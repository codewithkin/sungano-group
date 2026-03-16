"use client";

import { Button } from "@sungano-group/ui/components/button";
import { Input } from "@sungano-group/ui/components/input";
import { Label } from "@sungano-group/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Chrome, Leaf, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

import { login } from "@/lib/auth-client";
import Loader from "./loader";

export default function SignInForm() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      try {
        await login({ username: value.email, password: value.password });
        router.push("/dashboard");
        toast.success("Sign in successful");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to sign in";
        toast.error(message);
      } finally {
        setIsPending(false);
      }
    },
    validators: {
      onSubmit: z.object({
        email: z.string().email("Enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) return <Loader />;

  return (
    <div className="space-y-10">
      <div className="space-y-5 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5f5eb] text-[#16a249] shadow-[0_12px_30px_rgba(21,162,73,0.25)]">
            <Leaf className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-[2.75rem]">
            Sign in to Sungano
          </h1>
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="#" className="font-semibold text-[#15a34a] hover:underline">
              Get started →
            </a>
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5d6b61]"
            >
              Enter your email
            </Label>
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9aa99f]" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="alexsmith.mobbins+1@gmail.com"
                      className="h-12 rounded-2xl border border-[#dfe7e2] bg-white/80 pl-11 text-base font-medium text-foreground placeholder:text-[#9aa99f] focus-visible:border-[#a7f0c8] focus-visible:ring-[#84d7ac]"
                    />
                  </div>
                  {field.state.meta.errors.map((error, index) => (
                    <p key={`email-${index}`} className="text-xs text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-[#5d6b61]"
            >
              Password
            </Label>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9aa99f]" />
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 rounded-2xl border border-[#dfe7e2] bg-white/80 pl-11 text-base font-medium text-foreground placeholder:text-[#9aa99f] focus-visible:border-[#a7f0c8] focus-visible:ring-[#84d7ac]"
                    />
                  </div>
                  {field.state.meta.errors.map((error, index) => (
                    <p key={`password-${index}`} className="text-xs text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>
        </div>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-2xl bg-[#16a249] text-base font-semibold tracking-tight text-white shadow-[0_25px_45px_rgba(22,162,73,0.35)] hover:bg-[#14913f]"
              disabled={!canSubmit || isSubmitting || isPending}
            >
              {isSubmitting ? "Signing in..." : "Continue"}
            </Button>
          )}
        </form.Subscribe>

        <div className="flex items-center gap-4 text-[#7d897f]">
          <span className="h-px flex-1 bg-[#d9e3dd]" />
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.5em]">or</span>
          <span className="h-px flex-1 bg-[#d9e3dd]" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full rounded-2xl border-[#dfe7e2] bg-white text-base font-semibold text-[#2f4134] hover:bg-[#f5f8f6]"
        >
          <Chrome className="size-4 text-[#f97316]" />
          Continue with Google
        </Button>
      </form>

      <div className="space-y-4 text-center text-xs text-muted-foreground md:text-left">
        <p>
          By signing in, you agree to the{" "}
          <a href="#" className="font-semibold text-[#15a34a] hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold text-[#15a34a] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
        <p>
          Need help?{" "}
          <a href="#" className="font-semibold text-[#15a34a] hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
