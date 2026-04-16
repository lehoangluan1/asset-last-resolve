import { expect, test } from "@playwright/test";

async function login(page: import("@playwright/test").Page, username: string, password = "demo123") {
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 20_000 });
}

test("employee creates a borrow request and manager approves it", async ({ browser }) => {
  const purpose = `Playwright Borrow ${Date.now()}`;

  const employeeContext = await browser.newContext();
  const employeePage = await employeeContext.newPage();
  await login(employeePage, "employee");
  await employeePage.getByRole("link", { name: "Borrow Requests" }).click();
  await employeePage.getByRole("button", { name: /new request/i }).click();
  const dialog = employeePage.getByRole("dialog", { name: "New Borrow Request" });
  await dialog.getByRole("combobox").click();
  await employeePage.getByRole("option", { name: /AST-1009/i }).click();
  await dialog.getByPlaceholder("Meeting, demo, training...").fill(purpose);
  await dialog.locator('input[type="date"]').nth(0).fill("2026-05-10");
  await dialog.locator('input[type="date"]').nth(1).fill("2026-05-12");
  await dialog.getByPlaceholder("Additional details...").fill("Playwright flow");
  await dialog.getByRole("button", { name: "Submit Request" }).click();
  await expect(employeePage.getByText("Request submitted")).toBeVisible();
  await employeePage.getByPlaceholder("Search requests...").fill(purpose);
  await expect(employeePage.getByText(purpose)).toBeVisible();

  const managerContext = await browser.newContext();
  const managerPage = await managerContext.newPage();
  await login(managerPage, "emily");
  await managerPage.getByRole("link", { name: "Borrow Requests" }).click();
  await managerPage.getByPlaceholder("Search requests...").fill(purpose);
  await expect(managerPage.getByText(purpose)).toBeVisible();
  await managerPage.getByRole("button", { name: /actions for thinkpad x1 carbon/i }).click();
  await managerPage.getByRole("menuitem", { name: "Approve" }).click();
  await expect(managerPage.getByText("Request approved")).toBeVisible();
});
