import { Button } from "@sungano-group/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@sungano-group/ui/components/card";
import { Input } from "@sungano-group/ui/components/input";
import { Label } from "@sungano-group/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Mail } from "lucide-react";
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
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setIsPending(true);
      try {
        await login({ username: value.username, password: value.password });
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
        username: z.string().min(3, "Username is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  if (isPending) return <Loader />;

  return (
    <Card className="shadow-none border-0 p-0">
      <CardHeader className="px-0 pb-6 space-y-3">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
            <Mail className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-center text-2xl font-semibold">Sign in to Sungano</CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Access to this system is by invitation only.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-foreground">Enter your username</Label>
            <form.Field name="username">
              {(field) => (
                <div className="space-y-1">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="your-username"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
            <form.Field name="password">
              {(field) => (
                <div className="space-y-1">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Enter password"
                  />
                  {field.state.meta.errors.map((error) => (
                    <p key={error?.message} className="text-sm text-destructive">
                      {error?.message}
                    </p>
                  ))}
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button type="submit" className="w-full mt-6" disabled={!canSubmit || isSubmitting || isPending}>
                {isSubmitting ? "Submitting..." : "Continue"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <div className="flex items-center gap-3 pt-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="w-full" type="button">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <text x="12" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">
              G
            </text>
          </svg>
          Continue with Google
        </Button>

        <p className="text-xs text-muted-foreground text-center pt-2">
          By signing in, you agree to the Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  );
}
