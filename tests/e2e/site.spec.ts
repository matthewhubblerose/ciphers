import { test, expect } from "@playwright/test";
import { challenge3, challenge3Opening } from "../fixtures/challenge3";

test("pages use club wording, have working links and fit the viewport", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/tools/",
    "/guides/",
    "/guides/transposition/",
    "/decks/",
    "/decks/cipher-analysis/",
  ]) {
    expect((await page.goto("/ciphers" + route))?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    expect(await page.locator("body").innerText()).not.toMatch(/\b(classroom|teacher|lesson)s?\b/i);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    const links = await page
      .locator('a[href^="/ciphers"]')
      .evaluateAll((els) => els.map((a) => a.getAttribute("href")!));
    for (const href of new Set(links))
      expect((await page.request.get(href.split("#")[0])).status(), href).toBe(200);
  }
  expect(errors).toEqual([]);
});

test("frequency ranks both labelled distributions and explains coincidence", async ({ page }) => {
  await page.goto("/ciphers/tools/#frequency");
  await page.getByLabel("Your message", { exact: true }).fill("ZZZZBBBA");
  await page.getByLabel("Order by frequency", { exact: true }).check();
  const first = page.locator(".chart-column").first();
  await expect(first.locator(".cipher-label")).toHaveText("Z");
  await expect(first.locator(".english-label")).toHaveText("E");
  await page.getByRole("button", { name: "About Index of Coincidence" }).focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(page.getByRole("tooltip")).toContainText("0.066");
  await page.getByLabel("Compare with English").uncheck();
  await expect(page.locator(".english-bar")).toHaveCount(0);
  await page.getByText("Exact counts & percentages", { exact: true }).click();
  await expect(page.getByRole("table")).toContainText("Count");
});

test("ngrams have top-30 English reference tables and retain input between tools", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/");
  await page.getByLabel("Your message", { exact: true }).fill(challenge3);
  await expect(page.getByText("200 LETTERS", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Bigrams & trigrams/ }).click();
  const tables = page.locator(".english-groups");
  await expect(tables).toHaveCount(2);
  for (const table of await tables.all()) await expect(table.locator("tbody tr")).toHaveCount(30);
  await expect(tables.first().locator("tbody th").first()).toHaveText("TH");
  await expect(tables.last().locator("tbody th").first()).toHaveText("THE");
  await expect(page.getByRole("columnheader", { name: "English group", exact: true })).toHaveCount(
    0,
  );
  await expect(page.locator(".ciphertext-groups")).toHaveCount(2);
  await page.getByLabel("Order groups by frequency").uncheck();
  await expect(tables.first().locator("tbody th").first()).toHaveText("AL");
  await page.reload();
  await expect(page.getByLabel("Your message", { exact: true })).toHaveValue(challenge3);
});

test("Caesar uses a single shift with independent spacing, punctuation and case", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#caesar");
  await page.getByLabel("Your message", { exact: true }).fill("Attack at dawn!");
  await page.getByLabel("Shift number").fill("23");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("DWWDFN DW GDZQ!");
  await page.getByLabel("Uppercase", { exact: false }).uncheck();
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("Dwwdfn dw gdzq!");
  await page.getByLabel("Keep punctuation").uncheck();
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("Dwwdfn dw gdzq");
  await page.getByLabel("Uppercase", { exact: false }).check();
  await page.getByLabel("Spacing", { exact: true }).selectOption("blocks");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("DWWDF NDWGD ZQ");
  await page.getByLabel("Spacing", { exact: true }).selectOption("none");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("DWWDFNDWGDZQ");
  await page.getByLabel("Your message", { exact: true }).fill("DWWDFN DW GDZQ!");
  await page.getByLabel("Shift number").fill("3");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("ATTACKATDAWN");
  await page.getByRole("button", { name: "Show all 26 shifts" }).click();
  await expect(page.locator(".all-shifts button")).toHaveCount(26);
  await expect(
    page.getByRole("button", {
      name: /Decipher|Generate ciphertext|Download|Use output as input/i,
    }),
  ).toHaveCount(0);
});

test("substitution aligns each alphabet pair and removes secondary group lists", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#substitution");
  await page.getByLabel("Your message", { exact: true }).fill("QEB");
  for (const [cipher, plain] of [
    ["Q", "T"],
    ["E", "H"],
    ["B", "E"],
  ])
    await page.getByLabel(`Plaintext for ${cipher}`, { exact: true }).fill(plain);
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("THE");
  await page.getByLabel("Plaintext for A", { exact: true }).fill("E");
  await expect(page.getByRole("status")).toContainText("already assigned");
  await page.getByLabel("Substitution operation", { exact: true }).selectOption("encode");
  await page.getByLabel("Your message", { exact: true }).fill("THE");
  await page.getByLabel("Keyphrase", { exact: true }).fill("ORANGE");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("TCG");
  const rows = page.locator(".alphabet-reference tr");
  for (let i = 0; i < 26; i++) {
    const plain = await rows.first().locator("td").nth(i).boundingBox();
    const cipher = await rows.last().locator("td").nth(i).boundingBox();
    expect(plain?.x).toBe(cipher?.x);
  }
  await expect(page.locator(".gram-chips")).toHaveCount(0);
  await page.getByLabel("Cipher alphabet (editable)").fill("AAAA");
  await expect(page.getByRole("alert")).toContainText("each A–Z letter exactly once");
});

test("transposition output reads the visible Challenge B grid in order 52413", async ({ page }) => {
  await page.goto("/ciphers/tools/#transposition");
  await page.getByLabel("Your message", { exact: true }).fill(challenge3);
  await page.getByLabel("Column order or word key").fill("52413");
  await page.getByLabel("Spacing", { exact: true }).selectOption("none");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue(
    new RegExp("^" + challenge3Opening),
  );
  const grid = await page.locator(".transpose-column").evaluateAll((cols) => {
    const cells = cols.map((c) => [...c.querySelectorAll(".grid-cell")].map((x) => x.textContent));
    return Array.from({ length: cells[0].length }, (_, row) =>
      cells
        .map((c) => c[row])
        .filter((c) => c !== "·")
        .join(""),
    ).join("");
  });
  expect((await page.getByLabel("Output", { exact: true }).inputValue()).startsWith(grid)).toBe(
    true,
  );
  await page.getByRole("button", { name: "Move column 5 right", exact: true }).click();
  await expect(page.getByLabel("Column order or word key")).toHaveValue("2,5,4,1,3");
  await page.getByLabel("Column order or word key").fill("11111");
  await expect(page.getByRole("alert")).toContainText("exactly once");
  await page.getByLabel("Column order or word key").fill("HOTEL");
  await expect(page.locator(".transpose-column").first()).toContainText("COL 4");
});

test("dragging columns into the reported order produces readable output", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Arrow buttons provide the touch alternative.");
  await page.goto("/ciphers/tools/#transposition");
  await page.getByLabel("Your message", { exact: true }).fill(challenge3);
  const cols = page.locator(".transpose-column");
  await cols.nth(4).dragTo(cols.nth(0));
  await cols.nth(2).dragTo(cols.nth(1));
  await cols.nth(4).dragTo(cols.nth(2));
  await page.getByLabel("Spacing", { exact: true }).selectOption("none");
  await expect(page.getByLabel("Column order or word key")).toHaveValue("5,2,4,1,3");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue(
    new RegExp("^" + challenge3Opening),
  );
});

test("both transposition routes still support known key generation and reconstruction", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#transposition");
  await page.getByLabel("Your message", { exact: true }).fill("WEAREDISCOVERED");
  await page.getByLabel("Column order or word key").fill("53124");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("EAWEROSDICDRVEE");
  await page.getByLabel("Method", { exact: true }).selectOption("columnar");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("EODASRWDVEIERCE");
  await page.getByLabel("Your message", { exact: true }).fill("EODASRWDVEIERCE");
  await page.getByLabel("Method", { exact: true }).selectOption("undo-columnar");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("WEAREDISCOVERED");
  await page.getByLabel("Method", { exact: true }).selectOption("blocks");
  await page.getByLabel("Your message", { exact: true }).fill("AbCdE");
  await page.getByLabel("Column order or word key").fill("52413");
  await page.getByLabel("Uppercase", { exact: false }).uncheck();
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("EbdAC");
});

test("Vigenère updates the selected stream histogram and exposes its ciphertext", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#vigenere");
  await page.getByLabel("Your message", { exact: true }).fill("LXFOP VEFRN HR");
  await page.getByLabel("Key", { exact: true }).fill("LEMON");
  await page.getByLabel("Spacing", { exact: true }).selectOption("none");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue("ATTACKATDAWN");
  await expect(page.getByLabel("Key position 1 ciphertext", { exact: true })).toHaveValue("LVH");
  await expect(page.locator('.cipher-bar[data-letter="A"]')).toHaveAttribute("data-count", "1");
  await page.getByLabel("Selected shift number", { exact: true }).fill("12");
  await expect(page.getByLabel("Key", { exact: true })).toHaveValue("MEMON");
  await expect(page.locator('.cipher-bar[data-letter="A"]')).toHaveAttribute("data-count", "0");
  await expect(page.locator('.cipher-bar[data-letter="Z"]')).toHaveAttribute("data-count", "1");
  await page.getByRole("button", { name: "Copy column ciphertext" }).click();
  await expect(page.getByRole("status")).toContainText(
    /Column ciphertext copied|Clipboard unavailable/,
  );
  await page.getByRole("button", { name: "Select key position 2", exact: true }).click();
  await expect(page.getByLabel("Key position 2 ciphertext", { exact: true })).toHaveValue("XER");
  await page.getByLabel("Key length", { exact: true }).fill("3");
  await expect(page.getByLabel("Key", { exact: true })).toHaveValue("MEM");
  await page.getByLabel("Key", { exact: true }).fill("");
  await expect(page.getByRole("alert")).toContainText("at least one letter");
  await page.getByLabel("Key", { exact: true }).fill("BOT");
  await page.getByLabel("Try a practice cipher").selectOption("4");
  await expect(page.getByLabel("Output", { exact: true })).toHaveValue(/^THEOTHEREXPLORERS/);
  await page.getByText("Possible key lengths", { exact: true }).click();
  await expect(page.locator(".length-chart button")).toHaveCount(20);
  await page.getByText("Repeated-group gaps", { exact: true }).click();
  await expect(page.getByRole("table", { name: "Repeated trigram gap summary" })).toBeVisible();
  expect(await page.locator("body").innerText()).not.toMatch(/chi.squared|χ²/i);
});

test("copy actions return the selected ciphertext stream and formatted output", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:4321",
  });
  await page.goto("/ciphers/tools/#vigenere");
  await page.getByLabel("Your message", { exact: true }).fill("LXFOP VEFRN HR");
  await page.getByLabel("Key", { exact: true }).fill("LEMON");
  await page.getByRole("button", { name: "Copy column ciphertext" }).click();
  await expect(page.getByRole("status")).toHaveText("Column ciphertext copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("LVH");
  await page.getByLabel("Spacing", { exact: true }).selectOption("none");
  await page.getByRole("button", { name: "Copy output", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Output copied.");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("ATTACKATDAWN");
});

test("tools share formatting controls and omit removed actions and taglines", async ({ page }) => {
  for (const tool of ["caesar", "substitution", "transposition", "vigenere"]) {
    await page.goto(`/ciphers/tools/#${tool}`);
    await expect(page.locator(".workbench")).toHaveAttribute("aria-busy", "false");
    await expect(page.getByLabel("Spacing", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Keep punctuation")).toBeVisible();
    await expect(page.getByLabel("Uppercase", { exact: false })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Download|Use output as input|Use input as output/i }),
    ).toHaveCount(0);
    await expect(page.locator(".tool-title h2")).toHaveText(
      tool === "caesar"
        ? "Caesar shift"
        : tool === "vigenere"
          ? "Vigenère"
          : tool[0].toUpperCase() + tool.slice(1),
    );
  }
});

test("club decks support navigation, presenter notes and print layouts", async ({ page }) => {
  for (const slug of ["cipher-analysis"]) {
    await page.goto(`/ciphers/decks/${slug}/`);
    await page.getByRole("button", { name: "Next", exact: false }).click();
    await expect(page).toHaveURL(/#slide-2$/);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#slide-3$/);
    await page.getByRole("button", { name: "Presenter notes" }).click();
    await expect(page.locator(".deck-notes")).toBeVisible();
    await page.keyboard.press("End");
    await expect(page.getByRole("button", { name: "Next", exact: false })).toBeDisabled();
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(/#slide-2$/);
    await page.evaluate(() => {
      for (const key of ["End", "Home", "ArrowRight", "ArrowRight", "ArrowLeft"])
        window.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
    });
    await expect(page).toHaveURL(/#slide-2$/);
    await page.reload();
    await expect(page.locator(".deck-toolbar>span")).toContainText("SLIDE 2");
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".print-slides")).toBeVisible();
    await expect(page.locator(".deck-toolbar")).not.toBeVisible();
    await page.emulateMedia({ media: "screen" });
  }
});
