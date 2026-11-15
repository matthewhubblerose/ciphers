import { describe, expect, it } from "vitest";
import { englishGroups, englishGroupPercent, groupComparison } from "./englishGroups";

describe("English group comparisons", () => {
  it("uses source counts divided by all groups of the same length", () => {
    expect(englishGroups(2)[0]).toMatchObject({ gram: "TH", count: 100272945963 });
    expect(englishGroupPercent("TH")).toBeCloseTo((100 * 100272945963) / 2819662855499, 8);
    expect(englishGroups(3)[0]).toMatchObject({ gram: "THE", count: 69221160871 });
    expect(englishGroupPercent("THE")).toBeCloseTo((100 * 69221160871) / 2098121156991, 8);
    for (const n of [2, 3])
      expect(englishGroups(n).reduce((sum, g) => sum + g.percent, 0)).toBeCloseTo(100, 8);
  });
  it("keeps independently ranked labels distinct and aligns same-group comparisons", () => {
    expect(groupComparison("ZZZZZ", 2)[0]).toMatchObject({
      cipherGram: "ZZ",
      cipherPercent: 100,
      englishGram: "TH",
    });
    const aligned = groupComparison("ZZZZZ", 2, false);
    expect(aligned.every((r) => r.cipherGram === r.englishGram)).toBe(true);
    expect(aligned.find((r) => r.cipherGram === "TH")).toMatchObject({
      cipherPercent: 0,
      englishPercent: englishGroupPercent("TH"),
    });
  });
});
