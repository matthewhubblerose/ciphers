import { expect, test } from "@playwright/test";
import { vigenere } from "../../src/utils/ciphers";

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

test("Vigenère guide teaches shifts, crib conflicts and stream solving", async ({
  page,
}, testInfo) => {
  await page.goto("/ciphers/guides/vigenere/");
  const play = page.getByRole("region", { name: "Vigenère playground" });
  await play.getByLabel("Playground message", { exact: true }).fill("MEET!");
  await expect(play.getByLabel("Playground output")).toHaveValue("YETF!");
  await play.getByLabel("Playground operation").selectOption("decode");
  await play.getByLabel("Playground message", { exact: true }).fill("YETF!");
  await expect(play.getByLabel("Playground output")).toHaveValue("meet!");
  await play.getByLabel("Playground key").fill("");
  await expect(play.getByRole("alert")).toContainText("at least one");
  await play.getByLabel("Playground key").fill("MAP");
  const crib = page.getByRole("region", { name: "Vigenère crib workshop" });
  await expect(crib.getByLabel("Crib key hypothesis")).toHaveText("MAP");
  await expect(crib.getByLabel("Crib decoded message")).toHaveText("meetattheoaktree");
  await crib.getByLabel("Assumed key length").fill("2");
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
