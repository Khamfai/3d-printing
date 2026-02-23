import { Elysia } from "elysia";
import { bearer } from "@elysiajs/bearer";
import { jwt } from "@elysiajs/jwt";
import { env } from "../config/env";
import { UnauthorizedError } from "../utils/error-handler";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({
    name: "jwt",
    secret: env.JWT_SECRET,
    exp: "7d",
  })
);

export const jwtRefreshPlugin = new Elysia({ name: "jwt-refresh-plugin" }).use(
  jwt({
    name: "jwtRefresh",
    secret: env.JWT_REFRESH_SECRET,
    exp: "30d",
  })
);

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(bearer())
  .use(jwtPlugin)
  .derive(async ({ jwt, bearer }) => {
    if (!bearer) {
      throw new UnauthorizedError("No authorization token provided");
    }

    const payload = await jwt.verify(bearer);
    if (!payload) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as "CUSTOMER" | "ADMIN",
      },
    };
  });

// Optional auth - doesn't throw if no token, just sets user to null
export const optionalAuth = new Elysia({ name: "optional-auth" })
  .use(bearer())
  .use(jwtPlugin)
  .derive(async ({ jwt, bearer }) => {
    if (!bearer) {
      return { user: null };
    }

    const payload = await jwt.verify(bearer);
    if (!payload) {
      return { user: null };
    }

    return {
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as "CUSTOMER" | "ADMIN",
      },
    };
  });
