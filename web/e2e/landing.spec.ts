import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section with branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("peladas", { ignoreCase: true });
    await expect(page.getByRole("link", { name: /criar conta|começar|cadastr/i }).first()).toBeVisible();
  });

  test("navigates to login page via header", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /entrar/i }).first().click();
    await expect(page).toHaveURL("/login");
  });

  test("navigates to register page via CTA", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /criar conta|começar|cadastr/i }).first().click();
    await expect(page).toHaveURL("/register");
  });
});
