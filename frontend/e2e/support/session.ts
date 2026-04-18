import { expect, type Page } from "@playwright/test";

const BACKEND_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://localhost:8080";

export async function waitForBackend(page: Page) {
  await expect
    .poll(
      async () => {
        const response = await page.request.get(`${BACKEND_BASE_URL}/api/health`);
        return response.status();
      },
      { timeout: 60_000, intervals: [1_000, 2_000, 5_000] },
    )
    .toBe(200);
}

export async function login(page: Page, username: string, password = "demo123") {
  await waitForBackend(page);
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}
