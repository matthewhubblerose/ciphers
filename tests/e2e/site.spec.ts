import { test, expect } from "@playwright/test";
import { challenge3 } from "../fixtures/challenge3";
import { readFile } from "node:fs/promises";

test("navigation, guides, responsive layouts and internal links work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/tools/",
    "/guides/",
    "/guides/frequency/",
    "/guides/transposition/",
    "/decks/",
    "/decks/frequency/",
    "/decks/transposition/",
  ]) {
    const response = await page.goto("/ciphers" + route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const links = await page
      .locator('a[href^="/ciphers"]')
      .evaluateAll((els) => els.map((a) => (a as HTMLAnchorElement).getAttribute("href")!));
    for (const href of new Set(links)) {
      const res = await page.request.get(href.split("#")[0]);
      expect(res.status(), href).toBe(200);
    }
  }
  expect(errors).toEqual([]);
});

test("frequency and ngrams handle grouped Challenge input and keep text across tools", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/");
  await page.getByLabel("Your message", { exact: true }).fill(challenge3);
  await expect(page.getByText("200 LETTERS", { exact: true })).toBeVisible();
  await page.getByLabel("Order by frequency").check();
  await page.getByLabel("Compare with English").uncheck();
  await page.getByText("Exact counts & percentages").click();
  await expect(page.getByRole("table")).toContainText("Letter");
  await page.getByRole("button", { name: /Bigrams & trigrams/ }).click();
  await expect(page.getByRole("heading", { name: "Bigrams", exact: true })).toBeVisible();
  await expect(page.getByLabel("Your message", { exact: true })).toHaveValue(challenge3);
  await page.reload();
  await expect(page.getByLabel("Your message", { exact: true })).toHaveValue(challenge3);
  await expect(page.getByRole("heading", { name: "Bigrams", exact: true })).toBeVisible();
});

test("Caesar generation, formatting and deciphering form a complete workflow", async ({ page }) => {
  await page.goto("/ciphers/tools/#caesar");
  await page.getByLabel("Your message", { exact: true }).fill("Attack at dawn!");
  await page.getByRole("button", { name: "Generate ciphertext", exact: true }).click();
  await page.getByLabel("Shift number").fill("3");
  await expect(page.getByLabel("Generated ciphertext")).toHaveValue("DWWDF NDWGD ZQ");
  await page.getByLabel("Keep original spacing & punctuation").check();
  await expect(page.getByLabel("Generated ciphertext")).toHaveValue("DWWDFN DW GDZQ!");
  await page.getByLabel("Keep original spacing & punctuation").uncheck();
  await page.getByRole("button", { name: "Use output as input" }).click();
  await page.getByRole("button", { name: "Decipher", exact: true }).click();
  await page.getByLabel("Output grouping").selectOption("0");
  await expect(page.getByLabel("Deciphered text")).toHaveValue("ATTACKATDAWN");
  await page.getByRole("button", { name: "Show all 26 shifts" }).click();
  await expect(page.locator(".all-shifts button")).toHaveCount(26);
});

test("substitution supports manual guesses, duplicate checks and keyphrase generation", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#substitution");
  await page.getByLabel("Your message", { exact: true }).fill("QEB");
  await page.getByLabel("Plaintext for Q", { exact: true }).fill("T");
  await page.getByLabel("Plaintext for E", { exact: true }).fill("H");
  await page.getByLabel("Plaintext for B", { exact: true }).fill("E");
  await expect(page.getByLabel("Deciphered text")).toHaveValue("THE");
  await page.getByLabel("Plaintext for A", { exact: true }).fill("E");
  await expect(page.getByRole("status")).toContainText("already assigned");
  await page.getByRole("button", { name: "Generate ciphertext", exact: true }).click();
  await page.getByLabel("Your message", { exact: true }).fill("THE");
  await page.getByLabel("Keyphrase", { exact: true }).fill("ORANGE");
  await expect(page.getByLabel("Generated ciphertext")).toHaveValue("TCG");
  await page.getByLabel("Cipher alphabet (editable)").fill("AAAA");
  await expect(page.getByRole("alert")).toContainText("each A–Z letter exactly once");
});

test("transposition supports keys, both routes, arrow reordering and invalid-key recovery", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#transposition");
  await page.getByLabel("Your message", { exact: true }).fill("WEAREDISCOVERED");
  await page.getByRole("button", { name: "Generate ciphertext", exact: true }).click();
  await page.getByLabel("Output grouping").selectOption("0");
  await expect(page.getByLabel("Generated ciphertext")).toHaveValue("EAWEROSDICDRVEE");
  await page.getByLabel("Method", { exact: true }).selectOption("columnar");
  await expect(page.getByLabel("Generated ciphertext")).toHaveValue("EODASRWDVEIERCE");
  await page.getByRole("button", { name: "Use output as input" }).click();
  await page.getByRole("button", { name: "Decipher", exact: true }).click();
  await expect(page.getByLabel("Deciphered text")).toHaveValue("WEAREDISCOVERED");
  await page.getByLabel("Column order or word key").fill("HOTEL");
  await expect(page.locator(".transpose-column").first()).toContainText("COL 4");
  await page.getByRole("button", { name: "Move column 4 right", exact: true }).click();
  await expect(page.getByLabel("Column order or word key")).toHaveValue("1,4,5,2,3");
  await page.getByLabel("Column order or word key").fill("11111");
  await expect(page.getByRole("alert")).toContainText("exactly once");
  await page.getByLabel("Column order or word key").fill("12345");
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("desktop column drag updates key and output", async ({ page, isMobile }) => {
  test.skip(isMobile, "Touch users have arrow button alternatives.");
  await page.goto("/ciphers/tools/#transposition");
  await page.getByLabel("Your message", { exact: true }).fill("ABCDE");
  await page.getByRole("button", { name: "Generate ciphertext", exact: true }).click();
  await page.getByLabel("Column order or word key").fill("12345");
  const cols = page.locator(".transpose-column");
  await cols.nth(0).dragTo(cols.nth(2));
  await expect(page.getByLabel("Column order or word key")).toHaveValue("2,3,1,4,5");
  await expect(page.getByLabel("Generated ciphertext")).toHaveValue("BCADE");
});

test("Vigenère controls key length and per-character shifts with known vectors", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#vigenere");
  await page.getByLabel("Your message", { exact: true }).fill("LXFOP VEFRN HR");
  await page.getByLabel("Key", { exact: true }).fill("LEMON");
  await page.getByLabel("Output grouping").selectOption("0");
  await expect(page.getByLabel("Deciphered text")).toHaveValue("ATTACKATDAWN");
  await page.getByRole("button", { name: "Increase key character 1", exact: true }).click();
  await expect(page.getByLabel("Key", { exact: true })).toHaveValue("MEMON");
  await page.getByLabel("Key length", { exact: true }).fill("3");
  await expect(page.getByLabel("Key", { exact: true })).toHaveValue("MEM");
  await page.getByLabel("Key", { exact: true }).fill("");
  await expect(page.getByRole("alert")).toContainText("at least one letter");
  await page.getByLabel("Key", { exact: true }).fill("BOT");
  await page.getByLabel("Try a practice cipher").selectOption("4");
  await expect(page.getByLabel("Deciphered text")).toHaveValue(/^THEOTHEREXPLORERS/);
  await expect(page.locator(".length-chart button")).toHaveCount(20);
});

test("output downloads the exact formatted result", async ({ page }, testInfo) => {
  await page.goto("/ciphers/tools/#caesar");
  await page.getByLabel("Your message", { exact: true }).fill("KHOOR ZRUOG");
  await page.getByLabel("Shift number").fill("3");
  await page.getByLabel("Lowercase output").check();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .txt" }).click();
  const download = await downloadPromise;
  const path = testInfo.outputPath("decoded.txt");
  await download.saveAs(path);
  expect(await readFile(path, "utf8")).toBe("hello world");
});

test("classroom decks support navigation, notes, deep links and print layouts", async ({
  page,
}) => {
  for (const slug of ["frequency", "transposition"]) {
    await page.goto(`/ciphers/decks/${slug}/`);
    await expect(page.getByRole("button", { name: "Previous", exact: false })).toBeDisabled();
    await page.getByRole("button", { name: "Next", exact: false }).click();
    await expect(page).toHaveURL(/#slide-2$/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#slide-3$/);
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(/#slide-2$/);
    await page.getByRole("button", { name: "Teacher notes" }).click();
    await expect(page.locator(".deck-notes")).toBeVisible();
    await page.locator("main h1").click();
    await page.keyboard.press("End");
    await expect(page.getByRole("button", { name: "Next", exact: false })).toBeDisabled();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#slide-2$/);
    await page.reload();
    await expect(page.locator(".deck-toolbar>span")).toContainText("SLIDE 2");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".print-slides")).toBeVisible();
    await expect(page.locator(".deck-toolbar")).not.toBeVisible();
    expect(await page.locator(".print-slides .slide-stage").count()).toBeGreaterThanOrEqual(12);
    await page.emulateMedia({ media: "screen" });
  }
});
