import { expect, test } from "@playwright/test";

test("cipher identification guide connects animations, clues and practice", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ciphers/guides/identify/");
  const patterns = page.getByRole("group", { name: "Cipher pattern choices" });
  await patterns.getByRole("button", { name: "Transposition", exact: true }).click();
  await page.getByRole("button", { name: "Reorder 5, 2, 4, 1, 3" }).click();
  await expect(page.getByLabel("Block transposition output")).toHaveText("BRING YOURM APNOW");
  await patterns.getByRole("button", { name: "Vigenère", exact: true }).click();
  await expect(page.getByRole("region", { name: "Explore cipher patterns" })).toContainText(
    "Several Caesar shifts",
  );
  await page
    .getByRole("group", { name: "Mystery selection" })
    .getByRole("button", { name: "Mystery 4" })
    .click();
  await page
    .getByRole("group", { name: "Identify the mystery" })
    .getByRole("button", { name: "Caesar", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Try another clue");
  await page
    .getByRole("group", { name: "Identify the mystery" })
    .getByRole("button", { name: "Vigenère", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Yes");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("heading", { name: "1. Compare four patterns" }).scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-identify-guide.png` });
});
