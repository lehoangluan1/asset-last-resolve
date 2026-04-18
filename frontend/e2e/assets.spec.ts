import { expect, test } from "@playwright/test";
import { login } from "./support/session";

test("employee only sees in-scope asset results", async ({ page }) => {
  await login(page, "employee");
  await page.getByRole("link", { name: "Assets" }).click();

  const searchInput = page.getByPlaceholder("Search assets...");
  await searchInput.fill("ThinkPad");
  await expect(page.getByText("ThinkPad X1 Carbon")).toBeVisible();

  await searchInput.fill("PowerEdge");
  await expect(page.getByText("No assets found")).toBeVisible();
});
