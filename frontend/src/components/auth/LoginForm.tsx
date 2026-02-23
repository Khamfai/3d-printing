"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/auth-store";
import { authAPI } from "@/services/auth.service";

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authAPI.login({ email, password });
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.token, res.data.refreshToken);
        localStorage.setItem("auth-token", res.data.token);
        router.push(res.data.user.role === "ADMIN" ? "/admin" : "/dashboard");
      } else {
        setError(res.message || "Login failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg" role="alert">{error}</p>
      )}

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-brand-600 hover:text-brand-700 font-medium">Sign Up</Link>
      </p>
    </form>
  );
}
