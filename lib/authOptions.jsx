import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import supabase from "@/app/utils/db";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 5, // Session berumur 5 jam karena 60 * 60 detik * 5 = 5 jam
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", credentials?.email);
        const user = data[0];

        const passwordCorrect = await bcrypt.compare(
          credentials?.password,
          user?.password
        );

        if (passwordCorrect) {
          return {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            username: user?.username,
            role: user?.role,
            provider: user?.provider,
            status: user?.status,
          };
        }

        // console.log("credentials", credentials);
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.username = user.username;
        token.email = user.email;
        token.status = user.status;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        name: token.name,
        username: token.username,
        email: token.email,
        provider: token.provider,
        status: token.status,
        role: token.role,
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
