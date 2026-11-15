import { expect, test } from "@playwright/test";

test("Vigenère highlights output key positions without a duplicate message preview", async ({
  page,
}, testInfo) => {
  await page.goto("/ciphers/tools/#vigenere");
  const message = "ab cd! ef\ngh ij";
  await page.getByLabel("Your message", { exact: true }).fill(message);
  await page.getByLabel("Key", { exact: true }).fill("MAP");
  await page.getByRole("button", { name: "Select key position 2", exact: true }).click();
  await expect(page.getByRole("region", { name: "Message key-position highlights" })).toHaveCount(
    0,
  );
  const output = page.getByRole("region", { name: "Output key-position highlights" });
  expect(
    await output
      .locator("mark")
      .evaluateAll((marks) =>
        marks.map((mark) => Number(mark.getAttribute("data-letter-position"))),
      ),
  ).toEqual([2, 5, 8]);
  await expect(output.locator("mark")).toHaveText(["B", "E", "H"]);
  expect(
    await output
      .locator("mark")
      .first()
      .evaluate((el) => getComputedStyle(el).textDecorationLine),
  ).toContain("underline");
  await page.getByLabel("Key operation").selectOption("add");
  await expect(output.locator("mark")).toHaveText(["B", "E", "H"]);
  await output.screenshot({ path: `artifacts/${testInfo.project.name}-tool-key-highlights.png` });
  await page.getByLabel("Key", { exact: true }).fill("MAM");
  await page.getByRole("button", { name: "Select key position 3", exact: true }).click();
  await expect(output.locator(".key-stream-text")).toHaveText("MB OP! ER\nSH UV");
  await expect(output.locator("mark")).toHaveText(["O", "R", "U"]);
  await page.getByRole("button", { name: "Select key position 1", exact: true }).click();
  await expect(output.locator("mark")).toHaveText(["M", "P", "S", "V"]);
  await page.getByLabel("Key", { exact: true }).fill("MAPMAPMAPMAP");
  await page.getByRole("button", { name: "Select key position 12", exact: true }).click();
  await expect(output.locator("mark")).toHaveCount(0);
  await expect(output).toContainText("no letters at this position yet");
  await page.getByLabel("Key", { exact: true }).fill("");
  await expect(output).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

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
