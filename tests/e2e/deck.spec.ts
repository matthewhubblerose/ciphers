import { test, expect } from "@playwright/test";
import { decks, type VisualKind } from "../../src/data/decks";

const url = "/ciphers/decks/cipher-analysis/";
test("typing holds characters still and scrolls one complete line at a time", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  const live = page.locator(".deck-root>.slide-stage");
  await live.getByRole("button", { name: "Replay", exact: true }).click();
  const text = live.getByLabel("Text entered so far");
  const columns = Number(await text.getAttribute("data-columns"));
  await live.getByLabel("Text progress").fill(String(columns * 3 - 2));
  const first = text.locator(".typing-line").first();
  const glyph = () =>
    first.evaluate((el) => {
      const range = document.createRange();
      range.setStart(el.firstChild!, 0);
      range.setEnd(el.firstChild!, 1);
      const rect = range.getBoundingClientRect();
      return { x: rect.x, y: rect.y };
    });
  const before = await glyph();
  const secondLineY = (await text.locator('[data-line="1"]').boundingBox())!.y;
  await live.getByRole("button", { name: "Step", exact: true }).click();
  expect(await glyph()).toEqual(before);
  await expect(text).toHaveAttribute("data-first-line", "0");
  await live.getByRole("button", { name: "Step", exact: true }).click();
  await expect(text).toHaveAttribute("data-first-line", "1");
  const shifted = await text.locator('[data-line="1"]').boundingBox();
  expect(secondLineY - shifted!.y).toBeCloseTo(24);
  await expect(text.locator('[data-line="3"]')).toHaveText("▍");
});
const slide = (kind: VisualKind) =>
  url + "#slide-" + (decks[0].slides.findIndex((s) => s.visual === kind) + 1);
test("typing charts update, pause, scrub and replay", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  const live = page.locator(".deck-root>.slide-stage");
  const typing = live.locator(".typing-demo");
  await live.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(typing).toHaveAttribute("data-position", "0");
  await live.getByRole("button", { name: "Step", exact: true }).click();
  await expect(typing).toHaveAttribute("data-position", "1");
  expect(
    await live
      .locator("[data-value]")
      .evaluateAll((els) => els.some((el) => Number(el.getAttribute("data-value")) > 0)),
  ).toBe(true);
  await live.getByRole("button", { name: "Play", exact: true }).click();
  await expect
    .poll(async () => Number(await typing.getAttribute("data-position")))
    .toBeGreaterThan(2);
  await live.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await typing.getAttribute("data-position");
  await page.waitForTimeout(100);
  await expect(typing).toHaveAttribute("data-position", paused!);
  await live.getByRole("button", { name: "Show full text" }).click();
  expect(Number(await typing.getAttribute("data-position"))).toBeGreaterThan(3000);
  await live.getByRole("button", { name: "Replay", exact: true }).click();
  await expect(typing).toHaveAttribute("data-position", "0");
  await page.getByRole("button", { name: "Next", exact: false }).click();
  await live.getByRole("button", { name: "Show full text" }).click();
  await expect(live.getByText(/counts within words/)).toBeVisible();
  expect(await live.locator('[data-group="TH"]').getAttribute("data-value")).not.toBe("0.0000");
});

test("demonstrations run on entry and connect the graphs to real text", async ({ page }) => {
  await page.goto(url);
  const live = page.locator(".deck-root>.slide-stage");
  await expect
    .poll(async () => Number(await live.locator(".typing-demo").getAttribute("data-position")))
    .toBeGreaterThan(15);
  await expect(live.getByLabel("Text entered so far")).toContainText("THE OTHER");
  await expect(live.locator(".count-explanation")).toContainText("English reference");
  await page.goto(slide("caesar"));
  await expect
    .poll(async () => Number(await live.locator(".caesar-demo").getAttribute("data-shift")))
    .toBeGreaterThan(0);
  await expect(live.locator(".caesar-working")).toContainText("L →");
  await page.goto(slide("substitution-letters"));
  await expect(live.locator(".example-text-pair")).toContainText("THE OTHER");
  await expect(live.locator(".substitution-example")).toHaveAttribute("data-ranked", "true", {
    timeout: 5000,
  });
  await page.goto(slide("transposition-letters"));
  await expect(live.getByRole("heading", { level: 2 })).toHaveText(
    "Why does this unreadable text have English-like letter counts?",
  );
  await expect(live).not.toContainText("This is called transposition");
  await page.goto(slide("transposition-groups"));
  await live.getByRole("button", { name: "Show scrambled groups" }).click();
  const scrambled = await live
    .locator("[data-value]")
    .evaluateAll((els) => els.map((el) => el.getAttribute("data-value")));
  await expect(live).not.toContainText("This is called transposition");
  await live.getByRole("button", { name: "Reveal explanation" }).click();
  await expect(live).toContainText("This is called transposition");
  await live.getByRole("button", { name: "Restore the column order" }).click();
  expect(
    await live
      .locator("[data-value]")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-value"))),
  ).not.toEqual(scrambled);
  await page.goto(slide("blocks"));
  await expect(live.getByLabel("Block transposition output")).toHaveText("MEETZ INTHE DINER", {
    timeout: 8000,
  });
  await page.goto(slide("routes"));
  await expect(live.getByLabel("Reading route output")).toHaveText("LETSMOVELETTERS");
  await expect(live.getByLabel("Reading route grid")).toHaveAttribute("data-order", "12345");
  await live.getByRole("button", { name: "Reorder columns 5, 3, 1, 2, 4" }).click();
  await expect(live.getByLabel("Reading route grid")).toHaveAttribute("data-order", "53124");
  await live.getByRole("button", { name: "Across rows", exact: true }).click();
  await live.getByRole("button", { name: "Show complete route" }).click();
  await expect(live.getByLabel("Reading route output")).toHaveText("MTLESEEOVLSETTR");
  await live.getByRole("button", { name: "Down columns" }).click();
  await live.getByRole("button", { name: "Show complete route" }).click();
  await expect(live.getByLabel("Reading route output")).toHaveText("MESTEELOTEVTSLR");
});

test("Caesar alignment, ranked substitution and block movement recover their examples", async ({
  page,
}) => {
  await page.goto(slide("caesar"));
  const live = page.locator(".deck-root>.slide-stage");
  await expect(live.locator(".ribbon-label")).toHaveCount(52);
  await live.getByLabel("Caesar correction shift").fill("7");
  await expect(live.getByLabel("Caesar decoded text")).toHaveAttribute("data-correct", "true");
  await expect(live.locator(".moving-bars")).toHaveAttribute("style", /translateX\(-140px\)/);
  await page.goto(slide("substitution-letters"));
  await live.getByLabel("Order by frequency").check();
  expect(
    await live
      .locator("[data-value]")
      .evaluateAll((els) =>
        els.every((el) => el.getAttribute("data-value") === el.getAttribute("data-reference")),
      ),
  ).toBe(true);
  await page.goto(slide("blocks"));
  await live.getByRole("button", { name: "Reorder 5, 2, 4, 1, 3" }).click();
  await expect(live.getByLabel("Block transposition output")).toHaveText("MEETZ INTHE DINER");
  await expect(live.getByLabel("Five-column transposition grid")).toHaveAttribute(
    "data-order",
    "52413",
  );
});

test("guide screenshots load and only one guide and deck are listed", async ({
  page,
}, testInfo) => {
  await page.goto("/ciphers/guides/");
  await expect(page.locator(".resource-card")).toHaveCount(1);
  await page.locator(".resource-card").click();
  const images = page.locator(".excel-figure img");
  await expect(images).toHaveCount(6);
  for (const img of await images.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 100))
      .toBe(true);
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `artifacts/${testInfo.project.name}-excel-guide.png`,
    fullPage: true,
  });
  await page.goto("/ciphers/decks/");
  await expect(page.locator(".resource-card")).toHaveCount(1);
});

test("reduced motion supports manual steps and print contains completed examples", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url);
  const live = page.locator(".deck-root>.slide-stage");
  await expect(live.getByText(/Reduced motion is enabled/)).toBeVisible();
  await live.getByRole("button", { name: "Replay", exact: true }).click();
  await live.getByRole("button", { name: "Step", exact: true }).click();
  await expect(live.locator(".typing-demo")).toHaveAttribute("data-position", "1");
  await page.emulateMedia({ media: "print" });
  const printed = page.locator(".print-slides");
  await expect(printed.locator('[data-correct="true"]')).toHaveCount(1);
  await expect(printed.getByLabel("Block transposition output")).toHaveText("MEETZ INTHE DINER");
  expect(await printed.locator(".typing-demo").first().getAttribute("data-position")).not.toBe("0");
  await expect(printed.locator("[data-animation-controls]")).toHaveCount(0);
  await printed
    .locator(".slide-stage")
    .first()
    .screenshot({ path: "artifacts/analysis-print-first-slide.png" });
});
