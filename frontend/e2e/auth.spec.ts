import { expect, test } from "@playwright/test";
import { waitForBackend } from "./support/session";

test("redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/assets");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Asset Management" })).toBeVisible();
});

test("shows an error for invalid login", async ({ page }) => {
  await waitForBackend(page);
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.getByText("Invalid username or password")).toBeVisible();
});
