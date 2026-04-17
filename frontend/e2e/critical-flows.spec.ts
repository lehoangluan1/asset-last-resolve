import { expect, test } from "@playwright/test";

const BACKEND_BASE_URL = process.env.PLAYWRIGHT_API_BASE_URL ?? "http://localhost:8080";

async function waitForBackend(page: import("@playwright/test").Page) {
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

async function login(page: import("@playwright/test").Page, username: string, password = "demo123") {
  await waitForBackend(page);
  await page.goto("/login");
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function assetForm(page: import("@playwright/test").Page) {
  return page.locator("form").filter({ has: page.getByRole("button", { name: "Create Asset" }) });
}

function fieldControl(page: import("@playwright/test").Page, label: string) {
  return assetForm(page)
    .locator("div")
    .filter({ hasText: new RegExp(`^${escapeRegExp(label)}(\\*|$)`) })
    .locator("input, textarea")
    .first();
}

function selectControl(page: import("@playwright/test").Page, label: string) {
  return assetForm(page)
    .locator("div")
    .filter({ hasText: new RegExp(`^${escapeRegExp(label)}(\\*|$)`) })
    .locator('[role="combobox"]')
    .first();
}

test("admin sees admin features while employees are blocked from admin-only pages", async ({ browser }) => {
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await login(adminPage, "admin");
  await expect(adminPage.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(adminPage.getByRole("link", { name: "User Management" })).toBeVisible();
  await expect(adminPage.getByText("Active Verification Campaign")).toBeVisible();

  const employeeContext = await browser.newContext();
  const employeePage = await employeeContext.newPage();
  await login(employeePage, "employee");
  await expect(employeePage.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(employeePage.getByRole("link", { name: "User Management" })).toHaveCount(0);
  await expect(employeePage.getByText("Active Verification Campaign")).toHaveCount(0);
  await expect(employeePage.getByRole("link", { name: "Assets" })).toBeVisible();
  await employeePage.goto("/users");
  await expect(employeePage).toHaveURL(/\/403$/, { timeout: 20_000 });
  await expect(employeePage.getByRole("heading", { name: "Forbidden" })).toBeVisible();

  await adminContext.close();
  await employeeContext.close();
});

test("employee profile stays scoped to their own assets and borrow history", async ({ page }) => {
  await login(page, "employee");
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "My Profile" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Assigned Assets \(\d+\)/ })).toBeVisible();
  await expect(page.getByText("ThinkPad X1 Carbon")).toBeVisible();
  await expect(page.getByRole("heading", { name: /My Borrow Requests \(\d+\)/ })).toBeVisible();
  await expect(page.getByText("Campus recruitment event")).toBeVisible();
});

test("officer can create a new asset from the UI and see it in the asset list", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const assetName = `Coverage Asset ${suffix}`;
  const assetCode = `COV-${suffix}`;

  await login(page, "officer");
  await page.goto("/assets/new");
  await expect(page.getByRole("heading", { name: "New Asset" })).toBeVisible();

  await fieldControl(page, "Asset Name").fill(assetName);
  await fieldControl(page, "Asset Code").fill(assetCode);

  await selectControl(page, "Category").click();
  await page.getByRole("option", { name: "Laptops" }).click();

  await selectControl(page, "Department").click();
  await page.getByRole("option", { name: "Information Technology" }).click();

  await selectControl(page, "Location").click();
  await page.getByRole("option", { name: "IT Lab A" }).click();

  await page.getByRole("button", { name: "Create Asset" }).click();

  await expect(page).toHaveURL(/\/assets$/, { timeout: 20_000 });
  await page.getByPlaceholder("Search assets...").fill(assetCode);
  await expect(page.getByText(assetName)).toBeVisible();
});
