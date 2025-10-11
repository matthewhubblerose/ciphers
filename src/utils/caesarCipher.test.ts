import { describe, it, expect } from "vitest";
import { caesarShift, type CipherMode } from "./caesarCipher";

describe("caesarShift", () => {
  describe("basic encryption", () => {
    it("should encrypt with shift 3 (ROT3)", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("ABC", 3, mode)).toBe("DEF");
      expect(caesarShift("XYZ", 3, mode)).toBe("ABC");
    });

    it("should encrypt with shift 13 (ROT13)", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("HELLO", 13, mode)).toBe("URYYB");
    });

    it("should handle shift 0", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("HELLO", 0, mode)).toBe("HELLO");
    });

    it("should preserve case by default", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("Hello World", 3, mode)).toBe("Khoor Zruog");
    });

    it("should preserve non-alphabetic characters", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("Hello, World!", 3, mode)).toBe("Khoor, Zruog!");
      expect(caesarShift("Test 123", 5, mode)).toBe("Yjxy 123");
    });
  });

  describe("basic decryption", () => {
    it("should decrypt with shift 3", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };
      expect(caesarShift("DEF", 3, mode)).toBe("ABC");
      expect(caesarShift("ABC", 3, mode)).toBe("XYZ");
    });

    it("should decrypt ROT13", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };
      expect(caesarShift("URYYB", 13, mode)).toBe("HELLO");
    });

    it("should handle shift 0", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };
      expect(caesarShift("HELLO", 0, mode)).toBe("HELLO");
    });
  });

  describe("encrypt/decrypt symmetry", () => {
    it("should decrypt to original text", () => {
      const encryptMode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      const decryptMode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };

      const original = "Hello, World!";
      const encrypted = caesarShift(original, 7, encryptMode);
      const decrypted = caesarShift(encrypted, 7, decryptMode);

      expect(decrypted).toBe(original);
    });

    it("should work with all shifts (0-25)", () => {
      const encryptMode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      const decryptMode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };

      for (let shift = 0; shift <= 25; shift++) {
        const original = "The Quick Brown Fox";
        const encrypted = caesarShift(original, shift, encryptMode);
        const decrypted = caesarShift(encrypted, shift, decryptMode);
        expect(decrypted).toBe(original);
      }
    });
  });

  describe("encrypt options - stripNonAlpha", () => {
    it("should strip non-alphabetic characters when enabled", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: true, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("Hello, World!", 3, mode)).toBe("KhoorZruog");
      expect(caesarShift("Test 123 ABC", 5, mode)).toBe("YjxyFGH");
    });

    it("should not strip when disabled", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("Hello, World!", 3, mode)).toBe("Khoor, Zruog!");
    });
  });

  describe("encrypt options - caseHandling", () => {
    it("should uppercase when set to 'upper'", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "upper", blockSize: 0 },
      };
      expect(caesarShift("Hello World", 3, mode)).toBe("KHOOR ZRUOG");
    });

    it("should leave case when set to 'leave'", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("Hello World", 3, mode)).toBe("Khoor Zruog");
    });
  });

  describe("encrypt options - blockSize", () => {
    it("should add spaces at block intervals", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: true, caseHandling: "upper", blockSize: 5 },
      };
      expect(caesarShift("HELLOWORLD", 0, mode)).toBe("HELLO WORLD");
    });

    it("should handle block size with cipher text", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: true, caseHandling: "upper", blockSize: 4 },
      };
      expect(caesarShift("ATTACK AT DAWN", 3, mode)).toBe("DWWD FNDW GDZQ");
    });

    it("should not add spaces when blockSize is 0", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: true, caseHandling: "upper", blockSize: 0 },
      };
      expect(caesarShift("HELLOWORLD", 0, mode)).toBe("HELLOWORLD");
    });

    it("should handle text shorter than block size", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 10 },
      };
      expect(caesarShift("ABC", 0, mode)).toBe("ABC");
    });
  });

  describe("decrypt options - stripSpaces", () => {
    it("should strip spaces when enabled", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: true, caseHandling: "leave" },
      };
      expect(caesarShift("KHOOR ZRUOG", 3, mode)).toBe("HELLOWORLD");
    });

    it("should not strip spaces when disabled", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };
      expect(caesarShift("KHOOR ZRUOG", 3, mode)).toBe("HELLO WORLD");
    });
  });

  describe("decrypt options - caseHandling", () => {
    it("should lowercase when set to 'lower'", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "lower" },
      };
      expect(caesarShift("KHOOR ZRUOG", 3, mode)).toBe("hello world");
    });

    it("should leave case when set to 'leave'", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: false, caseHandling: "leave" },
      };
      expect(caesarShift("Khoor Zruog", 3, mode)).toBe("Hello World");
    });
  });

  describe("complex scenarios", () => {
    it("should handle full encryption workflow", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: true, caseHandling: "upper", blockSize: 5 },
      };
      const result = caesarShift("Attack at dawn!", 7, mode);
      expect(result).toBe("HAAHJ RHAKH DU");
    });

    it("should handle full decryption workflow", () => {
      const mode: CipherMode = {
        mode: "decrypt",
        options: { stripSpaces: true, caseHandling: "lower" },
      };
      const result = caesarShift("KHOOR ZRUOG", 3, mode);
      expect(result).toBe("helloworld");
    });

    it("should handle empty string", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("", 5, mode)).toBe("");
    });

    it("should handle only non-alphabetic characters", () => {
      const mode: CipherMode = {
        mode: "encrypt",
        options: { stripNonAlpha: false, caseHandling: "leave", blockSize: 0 },
      };
      expect(caesarShift("123 !@#", 5, mode)).toBe("123 !@#");
    });
  });
});
