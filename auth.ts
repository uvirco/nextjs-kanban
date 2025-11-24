import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Credentials provider called with:", credentials?.email);
        // For development: accept any email/password combination
        if (credentials?.email && credentials?.password) {
          try {
            // For credentials, we need to ensure user exists in database
            // since adapter handles OAuth but not credentials user creation
            let user = await prisma.user.findUnique({
              where: { email: credentials.email as string }
            });

            if (!user) {
              console.log("Creating new user:", credentials.email);
              user = await prisma.user.create({
                data: {
                  email: credentials.email as string,
                  name: (credentials.email as string).split('@')[0],
                }
              });
              console.log("User created:", user);
            }

            return user; // Return the user object directly
          } catch (error) {
            console.error("Error in credentials provider:", error);
            return null;
          }
        }
        return null;
      }
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.uid as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
