import { test, expect } from "@playwright/test";
import { decks } from "../../src/data/decks";

test("pages and slides fit their viewports and produce review screenshots", async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  await page.goto("/ciphers/");
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-home.png`, fullPage: true });
  await page.goto("/ciphers/tools/#frequency");
  await page
    .getByLabel("Your message", { exact: true })
    .fill(
      "THE OTHER EXPLORERS WERE THERE WHEN THE LETTER ARRIVED. THE THREE FRIENDS READ THE LETTER TOGETHER.",
    );
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-frequency.png`,
    fullPage: true,
  });
  for (const tool of ["substitution", "transposition", "vigenere"]) {
    await page.goto(`/ciphers/tools/#${tool}`);
    await expect(page.locator(".workbench")).toHaveAttribute("aria-busy", "false");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/${testInfo.project.name}-${tool}.png`,
      fullPage: true,
    });
  }
  for (const deck of decks) {
    await page.goto(`/ciphers/decks/${deck.slug}/`);
    for (let i = 0; i < deck.slides.length; i++) {
      if (i > 0) await page.getByRole("button", { name: "Next", exact: false }).click();
      const stage = page.locator(".deck-root>.slide-stage");
      await expect(stage).toHaveAttribute(
        "aria-label",
        `Slide ${i + 1} of ${deck.slides.length}: ${deck.slides[i].title}`,
      );
      expect(await stage.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      expect(await stage.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
      await stage.screenshot({
        path: `artifacts/${testInfo.project.name}-${deck.slug}-slide-${i + 1}.png`,
      });
    }
  }
});

test("printed decks have exactly one page per slide", async ({ page, isMobile }) => {
  test.skip(isMobile, "The print export is identical at either device size.");
  for (const deck of decks) {
    await page.goto(`/ciphers/decks/${deck.slug}/`);
    await expect(page.locator(".deck-toolbar")).toBeVisible();
    const pdf = await page.pdf({
      path: `artifacts/${deck.slug}-handout.pdf`,
      format: "A4",
      landscape: true,
      preferCSSPageSize: true,
      printBackground: true,
    });
    expect(pdf.toString("latin1").match(/\/Type\s*\/Page\b/g)?.length).toBe(deck.slides.length);
  }
});
