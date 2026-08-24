import { expect, test } from "@playwright/test";

test.describe("WanderLodge smokes", () => {
  test("home renders the lodge grid and brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("WanderLodge").first()).toBeVisible();
    await expect(page.getByTestId("lodge-grid")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("lodge-card-prop-1")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Eldorado Ridge Cabin" })).toBeVisible();
  });

  test("theme toggle adds the dark class on html", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("theme-toggle")).toBeVisible();
    await page.getByTestId("theme-toggle").click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("property page shows the booking card", async ({ page }) => {
    await page.goto("/properties/prop-1");
    await expect(page.getByRole("heading", { name: /Eldorado Ridge Cabin/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("booking-card")).toBeVisible();
  });

  test("traveler can sign in and open the trip workspace", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("sign-in").click();
    await page.getByTestId("auth-email").fill("marcus@wanderlodge.com");
    await page.getByTestId("auth-password").fill("password123");
    await page.getByTestId("auth-submit").click();
    await expect(page.getByRole("link", { name: /My Journeys/i })).toBeVisible({ timeout: 15_000 });
    await page.goto("/trips");
    await expect(page.getByTestId("trip-workspace")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("tab-group").click();
    await expect(page.getByText(/Group Coordination Hub/i).first()).toBeVisible();
  });
});
