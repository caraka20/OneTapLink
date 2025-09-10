"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await apiFetch<{ token: string }>("/user/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("token", res.token);
      router.push("/admin");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-300/20 blur-3xl top-10 left-10 animate-pulse" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-blue-300/20 blur-3xl bottom-10 right-10 animate-pulse delay-200" />

      {/* Login card */}
      <Card className="w-full max-w-sm shadow-lg border border-slate-200 bg-white/80 backdrop-blur-md z-10">
        <CardContent className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Login Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Masuk untuk mengelola grup WhatsApp UT
            </p>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Form */}
          <div className="space-y-3">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-lg"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg"
            />
            <Button
              onClick={handleLogin}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Masuk
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
