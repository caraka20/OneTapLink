"use client";
import { useState } from "react";
import { apiFetch } from "../../lib/api";
import { useRouter } from "next/navigation";
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
    <div className="max-w-sm mx-auto p-6">
      <Card>
        <CardContent className="space-y-3 p-4">
          <h1 className="text-xl font-bold">Login Admin</h1>
          {error && <p className="text-red-500">{error}</p>}
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button onClick={handleLogin} className="w-full">Login</Button>
        </CardContent>
      </Card>
    </div>
  );
}
