import { ok, handle } from "@/lib/api";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  return handle(async () => {
    await destroySession();
    return ok({ signedOut: true });
  });
}
