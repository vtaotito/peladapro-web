import { test, expect } from "@playwright/test";

test.describe("Auth – Login & Register", () => {
  test("login page renders form fields", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar/i })).toBeVisible();
  });

  test("register page renders form fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/nome/i)).toBeVisible();
    await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /criar conta/i })).toBeVisible();
  });

  test("full register flow reaches dashboard", async ({ page }) => {
    const email = `e2e-${Date.now()}@test.com`;
    await page.goto("/register");

    await page.getByLabel(/nome/i).fill("E2E Tester");
    await page.getByLabel(/e-?mail/i).fill(email);
    await page.getByLabel(/senha/i).fill("Test12345!");

    await page.locator("label", { hasText: /concordo|termos/i }).click();
    await page.getByRole("button", { name: /criar conta/i }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("unauthenticated user is redirected from /dashboard", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
