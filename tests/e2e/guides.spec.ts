import { expect, test } from "@playwright/test";
import { vigenere } from "../../src/utils/ciphers";
import { encodedGroup, SUBSTITUTION_PLAIN } from "../../src/data/substitutionPractice";

test("cipher identification guide connects animations, clues and practice", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/ciphers/guides/identify/");
  const patterns = page.getByRole("group", { name: "Cipher pattern choices" });
  const starter = page.getByRole("region", { name: "Learn frequency analysis" });
  await expect(
    starter.getByRole("heading", { name: "Count neighbours as well as single letters" }),
  ).toBeVisible();
  await expect(
    starter.getByRole("table", { name: "Two useful names for neighbouring letters" }),
  ).toContainText("Trigram");
  await expect(starter).toContainText("TH · HE · EN");
  await starter
    .getByRole("group", { name: "What shall we count?" })
    .getByRole("button", { name: "2. Bigrams" })
    .click();
  await expect(starter).toContainText("2 ÷ 5 = 40%");
  await starter.getByRole("button", { name: "3. Trigrams", exact: true }).click();
  await expect(starter).toContainText("2 ÷ 4 = 50%");
  await starter.getByLabel("First picked position").selectOption("3");
  await expect(starter.getByRole("status")).toContainText("a matching pair");
  await patterns.getByRole("button", { name: "Caesar", exact: true }).click();
  const caesarCode = page.locator(".guide-animation .caesar-working code").first();
  const colours = await caesarCode.evaluate((el) => ({
    foreground: getComputedStyle(el).color,
    background: getComputedStyle(el).backgroundColor,
  }));
  const luminance = (colour: string) => {
    const c = colour
      .match(/\d+/g)!
      .slice(0, 3)
      .map(Number)
      .map((v) => v / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
  };
  const l1 = luminance(colours.foreground),
    l2 = luminance(colours.background);
  expect((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toBeGreaterThan(4.5);
  await page
    .locator(".caesar-working")
    .screenshot({ path: `artifacts/${testInfo.project.name}-caesar-readable.png` });
  await patterns.getByRole("button", { name: "Transposition", exact: true }).click();
  await page.getByRole("button", { name: "Reorder 5, 2, 4, 1, 3" }).click();
  await expect(page.getByLabel("Block transposition output")).toHaveText("BRING YOURM APNOW");
  await patterns.getByRole("button", { name: "Vigenère", exact: true }).click();
  await expect(page.getByRole("region", { name: "Explore cipher patterns" })).toContainText(
    "one letter can have several replacements",
  );
  await page
    .getByRole("group", { name: "Mystery selection" })
    .getByRole("button", { name: "Mystery 4" })
    .click();
  const mystery = page.getByRole("region", { name: "Mystery cipher practice" });
  for (let i = 1; i <= 5; i++)
    await mystery
      .getByRole("group", { name: `Observation ${i}`, exact: true })
      .getByRole("button", { name: "No ❌", exact: true })
      .click();
  const comparison = mystery.getByRole("table");
  await expect(
    comparison
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "Your observations", exact: true }) })
      .getByRole("cell")
      .first(),
  ).toHaveText("❌");
  await mystery.getByRole("button", { name: "Choose Caesar", exact: true }).click();
  await expect(mystery.getByRole("status")).toContainText("Another clue");
  await mystery.getByRole("button", { name: "Choose Vigenère", exact: true }).click();
  await expect(mystery.getByRole("status")).toContainText("🎉 Case solved");
  expect(
    await mystery
      .locator(".clue-grid-scroll")
      .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
  ).toBe(true);
  await mystery
    .locator(".clue-cheatsheet")
    .screenshot({ path: `artifacts/${testInfo.project.name}-mystery-clue-grid.png` });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .getByRole("heading", { name: "Explore what each cipher changes" })
    .scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-identify-guide.png` });
});

test("substitution guide builds and undoes linked group guesses", async ({ page }, testInfo) => {
  await page.goto("/ciphers/guides/substitution/");
  const lab = page.getByRole("region", { name: "Substitution practice workshop" });
  const output = lab.getByRole("textbox", { name: "Substitution practice output", exact: true });
  for (const [step, plain] of [
    [1, "THE"],
    [2, "THA"],
    [3, "HER"],
  ] as const) {
    await lab
      .getByRole("group", { name: "Substitution learning steps" })
      .getByRole("button", { name: new RegExp(`^${step}\\.`) })
      .click();
    await lab.getByLabel("Cipher group", { exact: true }).fill(encodedGroup(plain));
    await lab.getByLabel("Plaintext hypothesis").fill(plain);
    await lab.getByRole("button", { name: "Test this mapping" }).click();
    await expect(lab.getByRole("status")).toContainText("Hypothesis applied");
  }
  await expect(lab).toContainText("5 letters guessed");
  await expect(output).toContainText("thethree");
  await expect(output.locator("mark")).not.toHaveCount(0);
  await lab.getByLabel("Cipher group", { exact: true }).fill("ABC");
  await lab.getByLabel("Plaintext hypothesis").fill("THE");
  await lab.getByRole("button", { name: "Test this mapping" }).click();
  await expect(lab.getByRole("status")).toContainText("already");
  await lab.getByRole("button", { name: "Undo last guess" }).click();
  await expect(lab).toContainText("4 letters guessed");
  await lab.getByRole("button", { name: "Show step hint" }).click();
  await expect(lab).toContainText(`${encodedGroup("HER")} → her`);
  await lab.getByText("Reveal the complete practice solution", { exact: true }).click();
  await lab.getByRole("button", { name: "Reveal practice mapping" }).click();
  await lab.getByLabel("Show original word spaces as a hint").check();
  await expect(output).toHaveText(SUBSTITUTION_PLAIN.toLowerCase());
  await lab.getByRole("button", { name: "Undo last guess" }).click();
  await expect(lab).toContainText("4 letters guessed");
  await lab.getByRole("button", { name: "Reset all guesses" }).click();
  await expect(output.locator("mark")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await lab.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-substitution-guide.png` });
});

test("Vigenère guide teaches shifts, crib conflicts and stream solving", async ({
  page,
}, testInfo) => {
  await page.goto("/ciphers/guides/vigenere/");
  const recap = page.getByRole("region", { name: "Caesar recap playground" });
  await expect(recap.getByLabel("Caesar recap output")).toHaveText(/^TLLA/);
  const alternating = page.getByRole("region", { name: "Two alternating shifts" });
  await alternating.getByRole("button", { name: "Inspect recap letter 2, e", exact: true }).click();
  await expect(alternating.locator(".guide-callout")).toContainText("22 places forward to get A");
  await alternating.getByRole("button", { name: "Inspect recap letter 3, e", exact: true }).click();
  await expect(alternating.locator(".guide-callout")).toContainText("7 places forward to get L");
  await alternating.getByRole("button", { name: "Record these shifts with letters" }).click();
  await expect(alternating).toContainText("HW");
  const effects = page.getByRole("region", { name: "Compare Vigenère frequency effects" });
  const originalE = await effects
    .locator('.cipher-bar[data-letter="E"]')
    .getAttribute("data-count");
  await effects.getByRole("button", { name: "After MAP encryption" }).click();
  expect(await effects.locator('.cipher-bar[data-letter="E"]').getAttribute("data-count")).not.toBe(
    originalE,
  );
  const gaps = page.getByRole("region", { name: "Try a Kasiski gap" });
  await gaps.getByLabel("Second repeated group starts at").selectOption("19");
  await expect(gaps.getByLabel("Selected Kasiski gap")).toHaveText("18");
  await gaps.getByLabel("Try a possible key length").fill("6");
  await expect(gaps.getByRole("status")).toContainText("6 divides this gap of 18 exactly");
  await expect(gaps.getByRole("status")).toContainText(
    "does not divide the two consecutive gaps of 9",
  );
  const play = page.getByRole("region", { name: "Vigenère playground" });
  await play.getByLabel("Playground message", { exact: true }).fill("MEET!");
  await expect(play.getByLabel("Playground output")).toHaveValue("YETF!");
  await play.getByRole("button", { name: "Inspect message letter 3, e", exact: true }).click();
  await expect(
    play.getByRole("button", { name: "Inspect message letter 3, e", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(play.locator('input[type="range"]')).toHaveCount(0);
  await play.getByLabel("Playground operation").selectOption("decode");
  await play.getByLabel("Playground message", { exact: true }).fill("YETF!");
  await expect(play.getByLabel("Playground output")).toHaveValue("meet!");
  await play.getByLabel("Playground key").fill("");
  await expect(play.getByRole("alert")).toContainText("at least one");
  await play.getByLabel("Playground key").fill("MAP");
  const crib = page.getByRole("region", { name: "Vigenère crib workshop" });
  await expect(crib.getByLabel("Crib key hypothesis")).toHaveText("MAP");
  await expect(crib.getByLabel("Crib decoded message")).toHaveText("meetattheoaktree");
  await crib.getByLabel("Assumed key length").fill("2.5");
  await expect(crib.getByLabel("Assumed key length")).toHaveValue("2");
  await expect(crib.locator('p[role="status"]')).toContainText("Conflict");
  await crib.getByLabel("Assumed key length").fill("3");
  const workshop = page.getByRole("region", { name: "Vigenère breaking workshop" });
  await workshop.getByRole("button", { name: /Try key length 3,/ }).click();
  for (const [position, shift] of [
    [0, 12],
    [1, 0],
    [2, 15],
  ]) {
    await workshop.getByLabel("Inspect key position").selectOption(String(position));
    await workshop.getByLabel("Workshop Caesar shift", { exact: true }).fill(String(shift));
  }
  await expect(workshop.getByLabel("Workshop key")).toHaveText("MAP");
  await expect(workshop.getByLabel("Workshop decoded message")).toHaveValue(/^theotherexplorers/);
  await workshop.getByRole("button", { name: "Restart with three A shifts" }).click();
  await expect(workshop.getByLabel("Workshop key")).toHaveText("AAA");
  await workshop.getByRole("button", { name: "Reveal worked solution" }).click();
  await expect(workshop.getByRole("status")).toContainText("MAP means shifts 12, 0, 15");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await play.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/${testInfo.project.name}-vigenere-guide.png` });
});

test("workbench Kasiski reports positions and factors and IC bars choose a length", async ({
  page,
}) => {
  await page.goto("/ciphers/tools/#vigenere");
  await page
    .getByLabel("Your message", { exact: true })
    .fill(vigenere("THECATSATTHECATRANTHECATHID", "MAP", false));
  const evidence = page.getByRole("region", { name: "Vigenère key-length evidence" });
  await evidence.getByText("Inspect repeated groups, positions and gaps", { exact: true }).click();
  const row = evidence
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader", { name: "FHT", exact: true }) });
  await expect(row).toContainText("1, 10, 19");
  await expect(row).toContainText("9, 9");
  await evidence.getByRole("button", { name: /Try key length 3,/ }).click();
  await expect(page.getByLabel("Key", { exact: true })).toHaveValue("AAA");
  await evidence.getByLabel("Repeated group length").selectOption("5");
  await expect(evidence.getByRole("rowheader", { name: "FHTOA", exact: true })).toBeVisible();
});
