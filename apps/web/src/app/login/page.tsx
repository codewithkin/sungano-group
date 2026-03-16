"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@sungano-group/ui/components/button";
import { Card } from "@sungano-group/ui/components/card";
import { Input } from "@sungano-group/ui/components/input";
import { Label } from "@sungano-group/ui/components/label";
import Image from "next/image";
import { Loader2Icon } from "lucide-react";
import { motion } from "framer-motion";
import { login } from "@/lib/auth-client";

export default function Login () {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: (payload: { username: string; password: string }) => login(payload),
    onSuccess: () => {
      toast.success("Login successful!");
      router.push("/dashboard");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ username, password });
  };
  return (
    <section 
    style={{
      backgroundImage: "url('/images/white-truck.jpeg')",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    }}
    className="md:px-20 lg:px-40 py-36 justify-center items-center h-full flex">
      {/* Actual login form */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Card className="w-fit backdrop-blur-lg bg-white/10 border border-white/20 p-2">
        {/* Welcome message and logo */}
        <article className="flex flex-col gap-4 pt-2 px-4 justify-center items-center">
          <Image
          src="/logo.jpeg"
          alt="Sungano Group Logo"
          width={48}
          height={48}
          className="rounded-full"
        />
        <h1 className="text-xl font-semibold text-center text-white">Welcome to Sungano Group</h1>
        </article>

        <article className="flex flex-col gap-4 bg-white rounded-2xl p-8">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            aria-busy={loginMutation.isPending}
            aria-live="polite"
          >
            <article className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="joshuasmith"
                className="md:min-w-100 w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginMutation.isPending}
              />
            </article>

            <article className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="********"
                type="password"
                className="md:min-w-100 w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
              />
            </article>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              aria-disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2Icon className="animate-spin size-4" />
                  signing you in...
                </span>
              ) : (
                "Sign me in"
              )}
            </Button>

            {/* Screen reader status updates */}
            <div className="sr-only" role="status" aria-live="polite">
              {loginMutation.isPending
                ? "Signing you in..."
                : loginMutation.isError
                ? `Error: ${loginMutation.error instanceof Error ? loginMutation.error.message : "Login failed"}`
                : loginMutation.isSuccess
                ? "Signed in"
                : ""}
            </div>
          </form>
        </article>
        </Card>
      </motion.div>
    </section>
  )
}