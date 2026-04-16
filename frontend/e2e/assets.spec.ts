import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, username: string, password = "demo123") {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/);
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
