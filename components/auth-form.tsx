"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Field, Input } from "@/components/ui/input";

interface ApiResponse<T> {
  data?: T;
  error?: { code: string; message: string };
}

async function postJson<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as ApiResponse<T>;
}

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload =
      mode === "signup"
        ? {
            name: String(form.get("name") ?? ""),
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
            tenantName: String(form.get("tenantName") ?? "") || undefined,
          }
        : {
            email: String(form.get("email") ?? ""),
            password: String(form.get("password") ?? ""),
          };

    const result = await postJson<{ user: unknown }>(
      mode === "signup" ? "/api/v1/auth/signup" : "/api/v1/auth/login",
      payload,
    );

    if (result.error) {
      setError(result.error.message);
      setPending(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="form" data-testid="auth-form">
      <div className="row-between">
        <p className="eyebrow">
          {mode === "signup" ? "Create your workspace" : "Sign in"}
        </p>
        <Badge variant="success">
          <BadgeDot />
          Open
        </Badge>
      </div>

      {mode === "signup" && (
        <>
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" required placeholder="Ada Lovelace" autoComplete="name" />
          </Field>
          <Field
            label="Workspace name"
            htmlFor="tenantName"
            help="Each workspace is a fully isolated tenant."
          >
            <Input id="tenantName" name="tenantName" placeholder="Ada's studio" />
          </Field>
        </>
      )}

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@team.dev"
          autoComplete="email"
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        help={mode === "signup" ? "At least 8 characters." : undefined}
      >
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === "signup" ? 8 : 1}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </Field>

      {error && (
        <p role="alert" data-testid="auth-error" className="body-sm" style={{ color: "var(--danger)" }}>
          {error}
        </p>
      )}

      <div className="form-actions">
        <Button type="submit" disabled={pending}>
          {pending ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </div>

      <p className="body-meta">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </>
        ) : (
          <>
            New to LoopLane?{" "}
            <Link href="/signup">Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
