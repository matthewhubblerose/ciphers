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
  await expect(page.locator(".group-bar-row").first()).toHaveText(/AA.*100.00%.*\(4\)/);
  await expect(page.locator(".group-bar-row").last()).toHaveText(/AAA.*100.00%.*\(3\)/);
});
