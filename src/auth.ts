import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "CLIENT" | "AGENT" | "ADMIN";
      companyId?: string | null;
      companyName?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "CLIENT" | "AGENT" | "ADMIN";
    companyId?: string | null;
    companyName?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
    ...(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.AUTH_FACEBOOK_ID,
            clientSecret: process.env.AUTH_FACEBOOK_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user || !user.password) {
          return null;
        }

        if (user.isActive === false) {
          throw new Error("Your account access has been revoked. Contact your support administrator.");
        }

        const isMatch = await bcrypt.compare(
          String(credentials.password),
          user.password
        );

        if (!isMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name || null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "CLIENT";
        token.companyId = (user as any).companyId || null;
        token.companyName = (user as any).companyName || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        if (token.role) session.user.role = token.role as "CLIENT" | "AGENT" | "ADMIN";
        session.user.companyId = token.companyId as string | null;
        session.user.companyName = token.companyName as string | null;
      }
      return session;
    },
  },
});
