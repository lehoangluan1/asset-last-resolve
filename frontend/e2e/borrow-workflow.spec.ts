import { expect, test } from "@playwright/test";
import { login } from "./support/session";

test("employee creates a borrow request and manager approves it", async ({ browser }) => {
  const purpose = `Playwright Borrow ${Date.now()}`;

  const employeeContext = await browser.newContext();
  const employeePage = await employeeContext.newPage();
  await login(employeePage, "employee");
  await employeePage.getByRole("link", { name: "Borrow Requests" }).click();
  await employeePage.getByRole("button", { name: /new request/i }).click();
  const dialog = employeePage.getByRole("dialog", { name: "New Borrow Request" });
  await dialog.getByRole("combobox").click();
  await employeePage.getByText(/Laptops/i).click();
  await dialog.getByPlaceholder("Describe quantity, configuration, purpose, or any special requirements...").fill(purpose);
  await dialog.locator('input[type="date"]').nth(0).fill("2026-05-10");
  await dialog.locator('input[type="date"]').nth(1).fill("2026-05-12");
  await dialog.getByPlaceholder("Optional supporting notes...").fill("Playwright flow");
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
  await managerPage.getByRole("button", { name: /actions for/i }).first().click();
  await managerPage.getByRole("menuitem", { name: "Approve" }).click();
  const approvalDialog = managerPage.getByRole("dialog", { name: "Approve Borrow Request" });
  await approvalDialog.getByRole("combobox").click();
  await managerPage.getByRole("option").first().click();
  await approvalDialog.getByRole("button", { name: "Approve Request" }).click();
  await expect(managerPage.getByText("Request approved")).toBeVisible();
  await expect(managerPage.getByText("Approved")).toBeVisible();
});
