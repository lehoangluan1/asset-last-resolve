import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, username: string, password = "demo123") {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
}

test("employee only sees in-scope asset results", async ({ page }) => {
  await login(page, "employee");
  await page.getByRole("link", { name: "Assets" }).click();

  const searchInput = page.getByPlaceholder("Search assets...");
  await searchInput.fill("ThinkPad");
  await expect(page.getByText("ThinkPad X1 Carbon")).toBeVisible();

  await searchInput.fill("PowerEdge");
  await expect(page.getByText("No assets found")).toBeVisible();
});

test("admin can access user management and perform an admin-only action", async ({ page }) => {
  await login(page, "admin");
  await page.getByRole("link", { name: "User Management" }).click();

  await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  await page.getByRole("button", { name: /actions for/i }).first().click();
  await page.getByRole("menuitem", { name: "Reset Password" }).click();

  await expect(page.getByText("Password reset to the demo default")).toBeVisible();
});

test("top search navigates to real grouped search results", async ({ page }) => {
  await login(page, "admin");

  const searchInput = page.getByPlaceholder("Search assets, users, requests...");
  await searchInput.fill("PowerEdge");
  await searchInput.press("Enter");

  await expect(page).toHaveURL(/\/search\?q=PowerEdge$/);
  await expect(page.getByRole("heading", { name: "Search Results" })).toBeVisible();
  await expect(page.getByText('Results for "PowerEdge"')).toBeVisible();
  await expect(page.getByRole("link", { name: /Dell PowerEdge R750 AST-1003/ })).toBeVisible();
});
