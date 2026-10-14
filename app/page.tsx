import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Card, CardTitle, FeatureIcon } from "@/components/ui/card";
import { ArrowRightIcon, GlobeIcon, GridIcon, Kbd, ShieldIcon } from "@/components/ui/icon";
import { CopyButton } from "@/components/ui/copy-button";

export default function LandingPage() {
  return (
    <main className="container">
      <header className="row-between" style={{ paddingBlock: "var(--space-4)" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="eyebrow">LoopLane</span>
        </Link>
        <nav className="hero-actions" style={{ marginBlockStart: 0 }}>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <section className="hero" data-od-id="hero">
        <p className="eyebrow">v0.1 · multi-tenant operations platform</p>
        <h1>Bookings, reservations, and commerce — one workspace per tenant.</h1>
        <p className="lede">
          LoopLane is a modular monolith built for tenant-scoped operations: strict
          membership boundaries, role-based permissions, and a versioned API with a
          consistent contract.
        </p>
        <div className="hero-actions">
          <Link href="/signup" className="btn btn-primary">
            Create your workspace
            <ArrowRightIcon />
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Sign in
          </Link>
        </div>
        <p className="hero-meta">
          <Badge variant="secondary">
            <BadgeDot style={{ color: "var(--success)" }} />
            56 tokens · multi-tenant · v1 API
          </Badge>
          <span>
            Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to jump to a workspace.
          </span>
        </p>

        <div className="install-block" id="install">
          <span>
            <span className="prompt" aria-hidden="true">
              $
            </span>
            npx create-looplane@latest init
          </span>
          <CopyButton text="npx create-looplane@latest init" />
        </div>
      </section>

      <section data-od-id="features">
        <div className="stack-3">
          <p className="eyebrow">Why teams reach for it</p>
          <h2 style={{ maxWidth: "28ch" }}>
            Modules that share one spine, not one blob.
          </h2>
          <p className="lede" style={{ maxWidth: "60ch" }}>
            Booking, reservations, commerce, and CRM land on the same
            tenant-scoped core. Every module lives behind the membership boundary —
            no shared tables without ownership, no routes without guards.
          </p>
        </div>

        <div className="features-grid">
          <Card>
            <FeatureIcon>
              <GridIcon />
            </FeatureIcon>
            <CardTitle>Tenant isolation.</CardTitle>
            <p className="body-muted body-sm">
              Every query and mutation is scoped to the authenticated membership.
              Cross-tenant access is rejected with a 404, not merely hidden from
              the interface.
            </p>
            <Link href="/signup" className="body-sm">
              Create a workspace →
            </Link>
          </Card>

          <Card>
            <FeatureIcon>
              <GlobeIcon />
            </FeatureIcon>
            <CardTitle>Role-based access.</CardTitle>
            <p className="body-muted body-sm">
              Owners, admins, and members get exactly the permissions they need —
              owners manage everything, admins write bookings, members read.
            </p>
            <Link href="/login" className="body-sm">
              See the roles →
            </Link>
          </Card>

          <Card>
            <FeatureIcon>
              <ShieldIcon />
            </FeatureIcon>
            <CardTitle>Versioned to the token.</CardTitle>
            <p className="body-muted body-sm">
              The v1 JSON contract validates every request with schemas and answers
              with one error shape — rebind tokens, not routes, when the brand moves.
            </p>
            <Link href="/api/health" className="body-sm">
              Check the health probe →
            </Link>
          </Card>
        </div>
      </section>
    </main>
  );
}
