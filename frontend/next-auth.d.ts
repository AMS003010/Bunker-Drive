
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    backendJWT?: string;
    userId?: string;
  }

  interface User {
    backendJWT?: string;
    userId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendJWT?: string;
    userId?: string;
  }
}
