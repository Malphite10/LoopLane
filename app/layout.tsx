import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoopLane — Multi-tenant operations platform",
  description:
    "LoopLane is a multi-tenant modular monolith for booking, reservations, commerce, and CRM.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
