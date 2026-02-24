import { prisma } from "../db/prisma";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/error-handler";
import type { RegisterDTO, LoginDTO } from "../types";

export class AuthService {
  async register(data: RegisterDTO) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new ConflictError("Email already registered");
    }

    const hashedPassword = await Bun.password.hash(data.password, {
      algorithm: "bcrypt",
      cost: 12,
    });

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(data: LoginDTO) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    const valid = await Bun.password.verify(data.password, user.password);
    if (!valid) {
      throw new BadRequestError("Invalid email or password");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new UnauthorizedError("User not found");
    }
    return user;
  }
}

export const authService = new AuthService();
