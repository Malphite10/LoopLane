"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, BadgeDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

interface Me {
  user: { id: string; name: string; email: string };
  activeTenant: { id: string; name: string; role: string; permissions: string[] } | null;
  tenants: { id: string; name: string; role: string }[];
}

interface Booking {
  id: string;
  title: string;
  customerName: string;
  startsAt: string;
  status: string;
  notes: string | null;
}

const STATUS_PRESENTATION: Record<
  string,
  { variant: "secondary" | "success" | "outline"; dot?: string }
> = {
  pending: { variant: "outline", dot: "var(--warn)" },
  confirmed: { variant: "success" },
  cancelled: { variant: "secondary", dot: "var(--danger)" },
  completed: { variant: "secondary" },
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadBookings() {
    const res = await fetch("/api/v1/bookings");
    const json = await res.json();
    if (json.data) setBookings(json.data);
    else setError(json.error?.message ?? "Failed to load bookings.");
  }

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/v1/auth/me");
      const json = await res.json();
      if (json.error) {
        window.location.href = "/login";
        return;
      }
      setMe(json.data);
      await loadBookings();
    })();
  }, []);

  async function createBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const res = await fetch("/api/v1/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title") ?? ""),
        customerName: String(form.get("customerName") ?? ""),
        startsAt: new Date(String(form.get("startsAt") ?? "")).toISOString(),
        status: String(form.get("status") ?? "pending"),
        notes: String(form.get("notes") ?? "") || undefined,
      }),
    });
    const json = await res.json();
    if (json.error) setError(json.error.message);
    else event.currentTarget.reset();
    setPending(false);
    await loadBookings();
  }

  async function switchTenant(tenantId: string) {
    await fetch("/api/v1/tenants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });
    await loadBookings();
  }

  async function signOut() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  async function cancelBooking(id: string) {
    await fetch(`/api/v1/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });
    await loadBookings();
  }

  if (!me) {
    return (
      <main className="container" style={{ paddingTop: "var(--space-8)" }}>
        <p className="body-muted">Loading…</p>
      </main>
    );
  }

  const canWrite = me.activeTenant?.permissions.includes("bookings:write") ?? false;

  return (
    <main className="container" style={{ paddingTop: "var(--space-6)", paddingBottom: "var(--space-12)" }}>
      <header className="row-between" style={{ borderBottom: "1px solid var(--border)", paddingBottom: "var(--space-6)" }}>
        <div className="stack-2">
          <p className="eyebrow">Workspace</p>
          <h2 data-testid="active-tenant" style={{ fontSize: "var(--text-xl)" }}>
            {me.activeTenant?.name ?? "No workspace"}
          </h2>
        </div>
        <div className="hero-actions" style={{ marginBlockStart: 0 }}>
          {me.tenants.length > 1 && (
            <select
              aria-label="Switch workspace"
              className="btn btn-secondary"
              value={me.activeTenant?.id}
              onChange={(e) => switchTenant(e.target.value)}
              style={{ padding: "8px 12px" }}
            >
              {me.tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
          <Badge variant="default">{me.activeTenant?.role ?? "—"}</Badge>
          <Button variant="ghost" size="sm" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="form-row" style={{ gridTemplateColumns: "1.6fr 1fr" }}>
        <Card>
          <CardTitle>Bookings</CardTitle>
          {bookings.length === 0 ? (
            <p className="body-muted body-sm" data-testid="bookings-empty">
              No bookings yet for this workspace.
            </p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }} data-testid="booking-list">
              {bookings.map((booking, index) => {
                const presentation = STATUS_PRESENTATION[booking.status] ?? { variant: "outline" as const };
                return (
                  <li
                    key={booking.id}
                    data-id={booking.id}
                    className="row-between"
                    style={{
                      paddingBlock: "var(--space-3)",
                      borderTop: index === 0 ? "none" : "1px solid var(--border)",
                    }}
                  >
                    <div className="stack-2">
                      <p className="body-sm" style={{ fontWeight: 500 }}>
                        {booking.title}
                      </p>
                      <p className="body-meta">
                        {booking.customerName} ·{" "}
                        {new Date(booking.startsAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="row-between">
                      <Badge variant={presentation.variant}>
                        {presentation.dot && (
                          <BadgeDot style={{ color: presentation.dot }} />
                        )}
                        {booking.status}
                      </Badge>
                      {canWrite && booking.status !== "cancelled" && (
                        <Button variant="ghost" size="sm" onClick={() => cancelBooking(booking.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          {canWrite ? (
            <>
              <CardTitle>New booking</CardTitle>
              <form onSubmit={createBooking} className="stack-4" data-testid="booking-form">
                <Field label="Title" htmlFor="title">
                  <Input id="title" name="title" required placeholder="Consultation call" />
                </Field>
                <Field label="Customer" htmlFor="customerName">
                  <Input id="customerName" name="customerName" required placeholder="Jane Doe" />
                </Field>
                <Field label="Starts at" htmlFor="startsAt">
                  <Input id="startsAt" name="startsAt" type="datetime-local" required />
                </Field>
                <Field label="Status" htmlFor="status">
                  <Select id="status" name="status" defaultValue="pending">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </Select>
                </Field>
                <Field label="Notes" htmlFor="notes">
                  <Textarea id="notes" name="notes" rows={2} placeholder="Optional" />
                </Field>
                {error && (
                  <p role="alert" data-testid="booking-error" className="body-sm" style={{ color: "var(--danger)" }}>
                    {error}
                  </p>
                )}
                <div className="form-actions">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Create booking"}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <CardTitle>Read-only role</CardTitle>
              <p className="body-muted body-sm">
                Your role can read bookings but not create them. Ask an owner or
                admin for <code style={{ fontFamily: "var(--font-mono)" }}>bookings:write</code>{" "}
                access.
              </p>
              <Link href="/" className="body-sm">
                Back to home →
              </Link>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
