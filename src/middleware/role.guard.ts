import { Elysia } from "elysia";
import { ForbiddenError } from "../utils/error-handler";

type Role = "CUSTOMER" | "ADMIN";

export function requireRole(...roles: Role[]) {
  return new Elysia({ name: `role-guard-${roles.join("-")}` }).derive(({ user }) => {
    const typedUser = user as { id: string; email: string; role: Role } | null;
    if (!typedUser) {
      throw new ForbiddenError("Authentication required");
    }
    if (!roles.includes(typedUser.role)) {
      throw new ForbiddenError(`Access denied. Required role: ${roles.join(" or ")}`);
    }
    return {};
  });
}

export const adminOnly = requireRole("ADMIN");
export const customerOnly = requireRole("CUSTOMER");
export const anyAuthenticated = requireRole("ADMIN", "CUSTOMER");
