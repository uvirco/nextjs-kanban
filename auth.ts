import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// Don't import the admin client at module-load time because `auth` is
// imported from middleware (proxy.ts) — creating the admin client eagerly
// throws when the deployed environment doesn't expose the service key.
// We'll import it lazily inside the authorize handler so that it's only
// constructed during the sign-in request (server runtime), not during
// middleware initialization.
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Auth attempt:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        // Import the admin client lazily so middleware imports won't attempt
        // to construct the Supabase client and crash when the key is absent
        // (edge/middleware environments often don't expose server secrets).
        let supabaseAdmin: any;
        try {
          ({ supabaseAdmin } = await import("@/lib/supabase"));
        } catch (e) {
          console.log("Unable to import supabaseAdmin during authorize:", e);
          return null;
        }

        if (!supabaseAdmin) {
          console.log(
            "supabaseAdmin not available — ensure SUPABASE_SERVICE_ROLE_KEY is set for server runtime",
          );
          return null;
        }

        const { data: user, error } = await supabaseAdmin
          .from("User")
          .select("*")
          .eq("email", credentials.email as string)
          .single();

        if (error) {
          console.log("Database error:", error.message);
          return null;
        }

        if (!user) {
          console.log("User not found");
          return null;
        }

        if (!user.password || !user.isActive) {
          console.log("User inactive or no password");
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isValidPassword) {
          console.log("Password invalid");
          return null;
        }

        console.log("Auth successful for:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          modulePermissions: user.module_permissions || { projects: "MEMBER", crm: "MEMBER" },
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id; // Set the JWT subject to the user ID
        token.role = user.role;
        token.modulePermissions = user.modulePermissions;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string; // Use token.sub for the user ID
        session.user.role = token.role as string;
        session.user.modulePermissions = token.modulePermissions as { projects?: string; crm?: string };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
