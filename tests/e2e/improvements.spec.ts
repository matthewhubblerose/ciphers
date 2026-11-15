import { expect, test } from "@playwright/test";

test("partial substitutions keep cipher letters and distinguish guesses", async ({ page }) => {
  await page.goto("/ciphers/tools/#substitution");
  await page.getByLabel("Your message", { exact: true }).fill("QEB QEXQ!");
  await page.getByLabel("Plaintext for Q", { exact: true }).fill("T");
  const output = page.getByRole("textbox", { name: "Output", exact: true });
  await expect(output).toHaveText("tEB tEXt!");
  await expect(output.locator("mark")).toHaveCount(3);
  await page.getByRole("button", { name: "Reset guesses" }).click();
  await expect(output).toHaveText("QEB QEXQ!");
});

test("group charts show overlapping counts and percentages", async ({ page }) => {
  await page.goto("/ciphers/tools/#ngrams");
  await page.getByLabel("Your message", { exact: true }).fill("AAAAA");
  await expect(page.locator(".group-pair-line").filter({ hasText: /^AA100/ })).toHaveText(
    /AA.*100.00%.*\(4\)/,
  );
  await expect(page.locator(".group-pair-line").filter({ hasText: /^AAA100/ })).toHaveText(
    /AAA.*100.00%.*\(3\)/,
  );
});

test("group analysis displays English percentages in tables and aligned charts", async ({
  page,
}, testInfo) => {
  await page.goto("/ciphers/tools/#ngrams");
  await page.getByLabel("Your message", { exact: true }).fill("THETHETHE");
  const bigrams = page.locator(".ngram-panel").first(),
    trigrams = page.locator(".ngram-panel").last();
  await expect(
    bigrams
      .locator(".english-groups")
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "TH", exact: true }) }),
  ).toContainText("3.56");
  await expect(
    trigrams
      .locator(".english-groups")
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "THE", exact: true }) }),
  ).toContainText("3.30");
  await expect(
    bigrams
      .locator(".ciphertext-groups")
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "TH", exact: true }) }),
  ).toContainText("37.503.56");
  await page.getByLabel("Order groups by frequency").uncheck();
  const row = bigrams
    .locator(".paired-group-row")
    .filter({ has: page.locator(".group-pair-line>b", { hasText: /^TH$/ }) });
  await expect(row.locator("b")).toHaveText(["TH", "TH"]);
  await expect(row).toContainText("3.56%");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-english-group-comparison.png`,
    fullPage: true,
  });
});
