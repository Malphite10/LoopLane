import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getSessionUser } from "@/lib/auth";

export default async function LoginPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <main className="container" style={{ minHeight: "100vh", paddingTop: "var(--space-12)" }}>
      <div className="form-row" style={{ marginTop: 0 }}>
        <div className="stack-4">
          <p className="eyebrow">Welcome back</p>
          <h2 style={{ maxWidth: "20ch" }}>Sign in to your workspaces.</h2>
          <p className="body-muted" style={{ maxWidth: "50ch" }}>
            Your session resolves your tenant memberships — the active workspace is
            always validated against a persisted membership, never taken from the
            request itself.
          </p>
          <p className="body-meta">
            New here? <Link href="/signup">Create a workspace</Link>.
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
