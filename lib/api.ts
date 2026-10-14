import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "@/lib/tenant";

export function ok<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status });
}

export function fail(status: number, code: string, message: string): Response {
  return Response.json({ error: { code, message } }, { status });
}

export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  }
  try {
    return schema.parse(raw);
  } catch (error) {
    if (error instanceof ZodError) {
      const first = error.issues[0];
      throw new ApiError(
        422,
        "validation_failed",
        first ? `${first.path.join(".") || "body"}: ${first.message}` : "Validation failed.",
      );
    }
    throw error;
  }
}

export async function handle(
  fn: () => Promise<Response>,
): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError) {
      return fail(error.status, error.code, error.message);
    }
    console.error("Unhandled API error", error);
    return fail(500, "internal_error", "Something went wrong.");
  }
}
