import { expect, test } from "@playwright/test";
import { login } from "./support/session";

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
