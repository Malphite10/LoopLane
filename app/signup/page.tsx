import { redirect } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { getSessionUser } from "@/lib/auth";

export default async function SignupPage() {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <main className="container" style={{ minHeight: "100vh", paddingTop: "var(--space-12)" }}>
      <div className="form-row" style={{ marginTop: 0 }}>
        <div className="stack-4">
          <p className="eyebrow">Get started</p>
          <h2 style={{ maxWidth: "20ch" }}>One account, isolated workspaces.</h2>
          <p className="body-muted" style={{ maxWidth: "50ch" }}>
            Creating an account provisions your first workspace atomically — the
            tenant and your owner membership are written in the same transaction,
            so a workspace can never exist without its owner.
          </p>
          <p className="body-meta">
            Already registered? <Link href="/login">Sign in</Link>.
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </main>
  );
}
