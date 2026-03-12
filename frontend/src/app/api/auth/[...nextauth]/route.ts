import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

const FASTAPI_URL = process.env.FASTAPI_URL;

const CredentialsSchema = z.object({
  emailAddress: z.email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        emailAddress: { label: "Email Address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailAddress || !credentials?.password) {
          return null;
        }

        const validationResult = CredentialsSchema.safeParse(credentials);

        if (!validationResult.success) {
          console.warn(
            "Login failed: Validation error",
            validationResult.error,
          );
          return null;
        }

        const { emailAddress, password } = validationResult.data;

        try {
          const res = await fetch(`${FASTAPI_URL}/token`, {
            method: "POST",
            body: new URLSearchParams({
              username: emailAddress,
              password: password,
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          if (res.status === 401) {
            console.warn("Login failed: Invalid credentials for", emailAddress);
            return null;
          }

          if (!res.ok) {
            console.error("Login failed: Backend returned error", res.status);
            const errorData = await res.json();
            throw new Error(
              errorData.detail || "Unable to create an access token",
            );
          }

          const user = await res.json();
          return user;
        } catch (error) {
          if (error instanceof Error && error.message === "BackendError") {
            throw error;
          }
          console.error("Login critical failure:", error);
          throw new Error("NetworkError");
        }
      },
    }),
    CredentialsProvider({
      id: "anonymous-session",
      name: "Anonymous",
      credentials: {},
      async authorize() {
        try {
          const res = await fetch(`${FASTAPI_URL}/anonymous-sessions`, {
            method: "POST",
          });

          if (res.status === 401) {
            console.warn("Anonymous session creation failed: Unauthorized");
            return null;
          }

          const session = await res.json();

          if (res.ok && session) {
            return session;
          }

          console.error("Anonymous session creation failed:", res.status);
          return null;
        } catch (error) {
          console.error("Anonymous session critical failure:", error);
          throw new Error("Error in creating anonymous session");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ user, token }) {
      if (user) {
        token.accessToken = user.access_token;
        token.user = user.user;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        // session.accessToken = token.accessToken as string;
        session.user = token.user;
        session.roles = token.roles;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
