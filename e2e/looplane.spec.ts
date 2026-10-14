import { expect, test, type Page } from "@playwright/test";

const stamp = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

async function signUp(page: Page, name: string, tenantName: string) {
  const email = `${name.toLowerCase().replace(/\s+/g, "-")}.${stamp()}@example.com`;
  await page.goto("/signup");
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Workspace name").fill(tenantName);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForURL("**/dashboard");
  return email;
}

async function createBooking(page: Page, title: string) {
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Customer").fill("Jane Doe");
  await page.getByLabel("Starts at").fill("2026-11-01T10:30");
  await page.getByRole("button", { name: "Create booking" }).click();
  await expect(page.getByTestId("booking-list")).toContainText(title);
}

test.describe("LoopLane", () => {
  test("landing page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Bookings, reservations, and commerce",
    );
  });

  test("health endpoint reports a connected database", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.status).toBe("ok");
    expect(json.database).toBe("connected");
  });

  test("signup, booking creation, and tenant-scoped listing", async ({ page }) => {
    const tenantName = `Aurora ${stamp()}`;
    await signUp(page, "Ada Lovelace", tenantName);
    await expect(page.getByTestId("active-tenant")).toHaveText(tenantName);

    await createBooking(page, `Audit ${stamp()}`);
  });

  test("unauthenticated API access is rejected", async ({ request }) => {
    const res = await request.get("/api/v1/bookings");
    expect(res.status()).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe("unauthenticated");
  });

  test("one tenant cannot access another tenant's bookings", async ({ browser }) => {
    const marker = stamp();

    const contextA = await browser.newContext();
    const pageA = await contextA.newPage();
    await signUp(pageA, "Alice Owner", `Alpha ${marker}`);
    await createBooking(pageA, `Secret ${marker}`);
    const bookingId = await pageA
      .getByTestId("booking-list")
      .locator("li")
      .first()
      .getAttribute("data-id");

    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();
    await signUp(pageB, "Bob Other", `Beta ${marker}`);
    await expect(pageB.getByTestId("bookings-empty")).toContainText("No bookings yet");

    const listRes = await pageB.request.get("/api/v1/bookings");
    const listed = await listRes.json();
    expect(JSON.stringify(listed)).not.toContain(`Secret ${marker}`);

    if (bookingId) {
      const getRes = await pageB.request.get(`/api/v1/bookings/${bookingId}`);
      expect(getRes.status()).toBe(404);

      const patchRes = await pageB.request.patch(`/api/v1/bookings/${bookingId}`, {
        data: { title: "hijacked" },
      });
      expect(patchRes.status()).toBe(404);

      const delRes = await pageB.request.delete(`/api/v1/bookings/${bookingId}`);
      expect(delRes.status()).toBe(404);
    }

    await contextA.close();
    await contextB.close();
  });

  test("signing out returns to the public site", async ({ page }) => {
    await signUp(page, "Carol Logout", `Charlie ${stamp()}`);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL("**/");
    await page.goto("/dashboard");
    await page.waitForURL("**/login");
  });
});
