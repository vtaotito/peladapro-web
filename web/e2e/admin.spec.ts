import { test, expect } from "@playwright/test";

test.describe("Admin Panel", () => {
  test("admin/login page renders correctly", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByPlaceholder(/admin@/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /acessar|entrar/i })).toBeVisible();
    await expect(page.locator("text=Painel administrativo")).toBeVisible();
  });

  test("unauthenticated access to /admin redirects to login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/(admin\/login|login)/);
  });
});
