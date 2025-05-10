// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Admin login
          if (credentials.isAdmin === 'true') {
            const user = await prisma.user.findFirst({
              where: {
                email: credentials.email,
                role: "admin"
              }
            });
            if (!user) return null;

            const passwordMatch = await bcrypt.compare(credentials.password, user.password);
            if (!passwordMatch) return null;

            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role
            };
          } 
          // Normal kullanıcı login
          else {
            const user = await prisma.user.findUnique({
              where: { email: credentials.email }
            });
            if (!user) return null;

            const passwordMatch = await bcrypt.compare(credentials.password, user.password);
            if (!passwordMatch) return null;

            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              role: user.role || 'user',
              address: user.address,
              phone: user.phone
            };
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      }
    })
  ],
 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.address = user.address;
      token.phone = user.phone;
      token.email = user.email; 
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.address = token.address;
      session.user.phone = token.phone;
      session.user.email = token.email; 
    }
    return session;
  }
}
,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 
  },
  secret: process.env.NEXTAUTH_SECRET || "gizli-anahtar"
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
