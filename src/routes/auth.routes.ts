import { Elysia, t } from "elysia";
import { authGuard, jwtPlugin, jwtRefreshPlugin } from "../middleware/auth.guard";
import { authService } from "../services/auth.service";
import { validate } from "../middleware/validation";
import { registerSchema, loginSchema } from "../types";
import { success } from "../utils/response";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .use(jwtRefreshPlugin)
  .post(
    "/register",
    async ({ body, jwt }) => {
      const data = validate(registerSchema, body);
      const user = await authService.register(data);
      const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      return success({ user, token }, "Registration successful");
    },
    {
      body: t.Object({
        email: t.String(),
        name: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, jwt, jwtRefresh }) => {
      const data = validate(loginSchema, body);
      const user = await authService.login(data);
      const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      const refreshToken = await jwtRefresh.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      return success({ user, token, refreshToken }, "Login successful");
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/refresh",
    async ({ body, jwt, jwtRefresh }) => {
      const payload = await jwtRefresh.verify(body.refreshToken);
      if (!payload) {
        return { success: false, message: "Invalid refresh token" };
      }
      const token = await jwt.sign({
        sub: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
      });
      return success({ token }, "Token refreshed");
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    }
  )
  .use(authGuard)
  .get("/me", async ({ user }) => {
    const profile = await authService.getProfile(user.id);
    return success(profile, "Profile retrieved");
  });
