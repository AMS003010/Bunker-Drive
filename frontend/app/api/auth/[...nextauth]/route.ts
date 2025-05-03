import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        try {
          const res = await axios.post(`${process.env.BACKEND_URL}/api/auth/google-login`, {
            email: user.email,
            name: user.name,
          });
          token.backendJWT = res.data.token;
          token.userId = res.data.userId;
        } catch (err) {
          console.error("JWT fetch from backend failed", err);
        }
      }

      return {
        ...token,
        backendJWT: token.backendJWT,
        userId: token.userId,
      };
    },
    async session({ session, token }) {
      session.backendJWT = token.backendJWT;
      session.userId = token.userId;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };