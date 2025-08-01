import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Use JWT for credentials compatibility
    maxAge: 24 * 60 * 60, // 24 hours
  },
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
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id
        token.provider = account.provider
        
        // For credentials provider, get profile completion status from database
        if (account.provider === "credentials") {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { profileCompleted: true }
          })
          token.profileCompleted = dbUser?.profileCompleted || false
        } else {
          // For OAuth providers, check profile completion
          token.profileCompleted = user.profileCompleted || false
        }
      }
      
      // Handle session update trigger (when profile is completed)
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { profileCompleted: true }
        })
        token.profileCompleted = dbUser?.profileCompleted || false
      }
      
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.id as string
        session.user.profileCompleted = token.profileCompleted as boolean
        session.user.provider = token.provider as string
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
        
        // Only worry about refresh token on first-time authorization
        if (!account.refresh_token && user?.id) {
          console.log('No refresh token received - checking if existing account has one...');
          try {
            const existingAccount = await prisma.account.findFirst({
              where: {
                userId: user.id,
                provider: "google"
              }
            });
            
            if (existingAccount?.refresh_token) {
              console.log('Existing account has refresh token - allowing sign in');
            } else {
              console.warn('No existing refresh token found. User may need to re-authorize for calendar features.');
            }
          } catch (error) {
            console.error('Error checking existing account:', error);
          }
        }
        
        // Verify we have calendar scopes
        const hasCalendarScope = account.scope?.includes('calendar');
        if (!hasCalendarScope) {
          console.error('Warning: Calendar scope not granted. Calendar features will not work.');
        }
        
        console.log('Google OAuth successful - tokens will be stored by PrismaAdapter');
        return true
      }
      
      // Handle credentials provider sign in
      if (account?.provider === "credentials") {
        console.log('Credentials sign in successful for user:', user?.email);
        return true
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