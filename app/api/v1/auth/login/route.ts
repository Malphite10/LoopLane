import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { users } from "@/db/schema";
import { ok, fail, parseBody, handle } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handle(async () => {
    const input = await parseBody(request, loginSchema);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email.toLowerCase()))
      .limit(1);

    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      return fail(401, "invalid_credentials", "Invalid email or password.");
    }

    await createSession(user.id);

    return ok({ user: { id: user.id, name: user.name, email: user.email } });
  });
}
