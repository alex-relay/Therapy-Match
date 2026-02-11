import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const FASTAPI_URL = process.env.FASTAPI_URL;

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

        try {
          const res = await fetch(`${FASTAPI_URL}/token`, {
            method: "POST",
            body: new URLSearchParams({
              username: credentials?.emailAddress || "",
              password: credentials?.password || "",
            }),
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });

          if (res.status === 401) {
            console.warn(
              "Login failed: Invalid credentials for",
              credentials.emailAddress,
            );
            return null; // Triggers the default "Sign In Failed" error
          }

          // 4. Handle Unexpected Errors (500 Server Error)
          if (!res.ok) {
            console.error("Login failed: Backend returned error", res.status);
            throw new Error("BackendError");
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
          throw new Error("NetworkError");
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
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        // session.accessToken = token.accessToken as string;
        session.user = token.user;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
