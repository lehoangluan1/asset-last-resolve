import { expect, test } from "@playwright/test";
import { login } from "./support/session";

test("admin can access user management and perform an admin-only action", async ({ page }) => {
  await login(page, "admin");
  await page.getByRole("link", { name: "User Management" }).click();

  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await page.getByRole("button", { name: /actions for/i }).first().click();
  await page.getByRole("menuitem", { name: "Reset Password" }).click();

  await expect(page.getByText("Password reset to the demo default")).toBeVisible();
});

test("employee cannot reach admin user management", async ({ page }) => {
  await login(page, "employee");

  await expect(page.getByRole("link", { name: "User Management" })).toHaveCount(0);
  await page.goto("/users");
  await expect(page).toHaveURL(/\/$/);
});

test("auditor sees verification access but not admin controls", async ({ page }) => {
  await login(page, "auditor");

  await expect(page.getByRole("link", { name: "Verification Campaigns" })).toBeVisible();
  await expect(page.getByRole("link", { name: "User Management" })).toHaveCount(0);
  await page.getByRole("link", { name: "Verification Campaigns" }).click();
  await expect(page.getByRole("heading", { name: "Verification" })).toBeVisible();
});

test("officer can reach asset creation flow", async ({ page }) => {
  await login(page, "officer");

  await expect(page.getByRole("button", { name: /add asset/i })).toBeVisible();
  await page.getByRole("button", { name: /add asset/i }).click();
  await expect(page).toHaveURL(/\/assets\/new$/);
});
