import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        emailAddress: { label: "Email Address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        const res = await fetch("http://localhost:8000/token", {
          method: "POST",
          body: new URLSearchParams({
            username: credentials?.emailAddress || "",
            password: credentials?.password || "",
          }),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const user = await res.json();

        // If no error and we have user data, return it
        if (res.ok && user) {
          return user;
        }
        // Return null if user data could not be retrieveds
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ user, token }) {
      if (user) {
        token.accessToken = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
