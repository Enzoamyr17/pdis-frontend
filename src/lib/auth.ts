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
  callbacks: {
    async session({ session, user }) {
      if (user && session.user) {
        session.user.id = user.id
        session.user.profileCompleted = user.profileCompleted || false
      }
      return session
    },
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        console.log('SignIn callback - Google account:', {
          hasAccessToken: !!account.access_token,
          hasRefreshToken: !!account.refresh_token,
          expiresAt: account.expires_at,
          scope: account.scope,
          userId: user?.id
        });
        
        // If no refresh token is provided, clean up any existing account
        // to force a fresh authorization next time
        if (!account.refresh_token && user?.id) {
          console.warn('No refresh token received. Cleaning up existing account to force re-authorization.');
          try {
            await prisma.account.deleteMany({
              where: {
                userId: user.id,
                provider: "google"
              }
            });
            console.log('Existing Google account deleted. User will need to re-authorize.');
            // Return false to prevent storing an account without refresh token
            return false;
          } catch (error) {
            console.error('Error cleaning up account:', error);
          }
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