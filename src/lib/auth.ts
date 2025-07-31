import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.events.readonly",
            "https://www.googleapis.com/auth/calendar.readonly",
            "openid",
            "email",
            "profile"
          ].join(" "),
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          include_granted_scopes: true
        }
      },
      // Force refresh token to be included
      checks: ["pkce", "state"],
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id }
        })
        token.profileCompleted = dbUser?.profileCompleted || false
      }
      
      // Handle account tokens (including refresh token)
      if (account && account.provider === "google") {
        console.log('JWT callback - Google account tokens:', {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at
        });
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.profileCompleted = token.profileCompleted as boolean
      }
      return session
    },
    async signIn({ account, profile, user }) {
      if (account?.provider === "google") {
        console.log('SignIn callback - Google account:', {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
          scope: account.scope,
          userId: user?.id
        });
        
        // Ensure we have the required tokens for calendar access
        if (!account.refresh_token) {
          console.error('Critical: No refresh token received from Google. This will cause calendar API failures.');
          console.error('User needs to revoke app permissions and re-authorize.');
          // Don't block sign-in, but log the issue
        }
        
        // Verify we have calendar scopes
        const hasCalendarScope = account.scope?.includes('calendar');
        if (!hasCalendarScope) {
          console.error('Warning: Calendar scope not granted. Calendar features will not work.');
        }
        
        console.log('Google OAuth successful - tokens will be stored by PrismaAdapter');
      }
      return true
    }
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
}