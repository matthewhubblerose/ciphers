export interface EncryptOptions {
  stripNonAlpha: boolean;
  caseHandling: "leave" | "upper";
  blockSize: number;
}

export interface DecryptOptions {
  stripSpaces: boolean;
  caseHandling: "leave" | "lower";
}

export type CipherMode =
  | { mode: "encrypt"; options: EncryptOptions }
  | { mode: "decrypt"; options: DecryptOptions };

export function caesarShift(text: string, shift: number, cipherMode: CipherMode): string {
  function caesarShiftCharCode(charCode: number, shift: number) {
    return (charCode + shift) % 26;
  }

  function caesarShiftCharCodeFromBase(baseCharCode: number, charCode: number, shift: number) {
    return caesarShiftCharCode(charCode - baseCharCode, shift) + baseCharCode;
  }

  // Pre-process based on mode
  let processedText = text;

  if (cipherMode.mode === "encrypt") {
    if (cipherMode.options.stripNonAlpha) {
      // Strip non-alphabetic characters
      processedText = processedText.replace(/[^a-zA-Z]/g, "");
    }
    if (cipherMode.options.caseHandling === "upper") {
      processedText = processedText.toUpperCase();
    }
  } else {
    // decrypt mode
    if (cipherMode.options.stripSpaces) {
      // Strip spaces
      processedText = processedText.replace(/\s/g, "");
    }
    if (cipherMode.options.caseHandling === "lower") {
      processedText = processedText.toLowerCase();
    }
  }

  // Apply Caesar shift
  shift = cipherMode.mode === "encrypt" ? shift : 26 - shift;
  let result = processedText
    .split("")
    .map((char) => {
      const charCode = char.charCodeAt(0);
      if (char >= "A" && char <= "Z") {
        return String.fromCharCode(caesarShiftCharCodeFromBase("A".charCodeAt(0), charCode, shift));
      } else if (char >= "a" && char <= "z") {
        return String.fromCharCode(caesarShiftCharCodeFromBase("a".charCodeAt(0), charCode, shift));
      } else {
        return char;
      }
    })
    .join("");

  // Post-process: Apply block size for encrypt mode
  if (cipherMode.mode === "encrypt" && cipherMode.options.blockSize > 0) {
    const blocks: string[] = [];
    for (let i = 0; i < result.length; i += cipherMode.options.blockSize) {
      blocks.push(result.slice(i, i + cipherMode.options.blockSize));
    }
    result = blocks.join(" ");
  }

  return result;
}
