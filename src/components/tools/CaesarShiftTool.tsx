import React from "preact/compat";
import { useState } from "preact/hooks";

type Mode = "encrypt" | "decrypt";

interface BruteForceResult {
  shift: number;
  text: string;
}

export default function CaesarShiftTool() {
  const [inputText, setInputText] = useState("");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<Mode>("encrypt");
  const [showBruteForce, setShowBruteForce] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Encrypt options
  const [stripNonAlpha, setStripNonAlpha] = useState(false);
  const [encryptCase, setEncryptCase] = useState<"leave" | "upper">("leave");
  const [blockSize, setBlockSize] = useState(0); // 0 means no blocking

  // Decrypt options
  const [decryptCase, setDecryptCase] = useState<"leave" | "lower">("leave");
  const [stripSpaces, setStripSpaces] = useState(false);

  function caesarShift(text: string, shift: number, mode: Mode): string {
    function caesarShiftCharCode(charCode: number, shift: number) {
      return (charCode + shift) % 26;
    }

    function caesarShiftCharCodeFromBase(baseCharCode: number, charCode: number, shift: number) {
      return caesarShiftCharCode(charCode - baseCharCode, shift) + baseCharCode;
    }

    // Pre-process based on mode
    let processedText = text;

    if (mode === "encrypt" && stripNonAlpha) {
      // Strip non-alphabetic characters
      processedText = processedText.replace(/[^a-zA-Z]/g, "");
    }

    if (mode === "decrypt" && stripSpaces) {
      // Strip spaces
      processedText = processedText.replace(/\s/g, "");
    }

    // Apply case transformation based on mode
    if (mode === "encrypt" && encryptCase === "upper") {
      processedText = processedText.toUpperCase();
    }

    if (mode === "decrypt" && decryptCase === "lower") {
      processedText = processedText.toLowerCase();
    }

    // Apply Caesar shift
    shift = mode === "encrypt" ? shift : 26 - shift;
    let result = processedText
      .split("")
      .map((char) => {
        let charCode = char.charCodeAt(0);
        if (char >= "A" && char <= "Z") {
          return String.fromCharCode(
            caesarShiftCharCodeFromBase("A".charCodeAt(0), charCode, shift),
          );
        } else if (char >= "a" && char <= "z") {
          return String.fromCharCode(
            caesarShiftCharCodeFromBase("a".charCodeAt(0), charCode, shift),
          );
        } else {
          return char;
        }
      })
      .join("");

    // Post-process: Apply block size for encrypt mode
    if (mode === "encrypt" && blockSize > 0) {
      const blocks: string[] = [];
      for (let i = 0; i < result.length; i += blockSize) {
        blocks.push(result.slice(i, i + blockSize));
      }
      result = blocks.join(" ");
    }

    return result;
  }

  function handleBruteForce(text: string, mode: Mode): BruteForceResult[] {
    const results: BruteForceResult[] = [];
    for (let i = 0; i < 26; i++) {
      results.push({ shift: i, text: caesarShift(text, i, mode) });
    }
    return results;
  }

  const outputText = caesarShift(inputText, shift, mode);
  const bruteForceResults = showBruteForce ? handleBruteForce(inputText, mode) : [];

  return (
    <div class="not-prose my-8 p-6 bg-base-200 rounded-lg shadow-lg">
      <h3 class="text-2xl font-bold mb-4 text-base-content">Caesar Shift Tool</h3>

      {/* Mode Selection */}
      <div class="flex gap-2 mb-4">
        <button
          class={`btn ${mode === "encrypt" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setMode("encrypt")}
        >
          Encrypt
        </button>
        <button
          class={`btn ${mode === "decrypt" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setMode("decrypt")}
        >
          Decrypt
        </button>
      </div>

      {/* Shift Control */}
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-semibold">Shift Value: {shift}</span>
        </label>
        <div class="flex gap-2 items-center">
          <button
            class="btn btn-sm btn-square"
            onClick={() => setShift((prev) => (prev - 1 + 26) % 26)}
            title="Rotate Left"
          >
            ←
          </button>
          <input
            type="range"
            min="0"
            max="25"
            value={shift}
            onChange={(e) => setShift(parseInt((e.target as HTMLInputElement).value))}
            class="range range-primary flex-1"
          />
          <button
            class="btn btn-sm btn-square"
            onClick={() => setShift((prev) => (prev + 1) % 26)}
            title="Rotate Right"
          >
            →
          </button>
          <input
            type="number"
            min="0"
            max="25"
            value={shift}
            onChange={(e) => setShift(parseInt((e.target as HTMLInputElement).value) || 0)}
            class="input input-bordered w-20"
          />
        </div>
      </div>

      {/* Encrypt Options */}
      {mode === "encrypt" && (
        <div class="collapse collapse-arrow bg-base-300 rounded-lg mb-4">
          <input
            type="checkbox"
            checked={showOptions}
            onChange={(e) => setShowOptions((e.target as HTMLInputElement).checked)}
          />
          <div class="collapse-title font-semibold">Options</div>
          <div class="collapse-content">
            <div class="space-y-2">
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={stripNonAlpha}
                  onChange={(e) => setStripNonAlpha((e.target as HTMLInputElement).checked)}
                />
                <span class="label-text">Strip non-alphabetic characters</span>
              </label>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Case handling:</span>
                </label>
                <div class="flex gap-2">
                  <button
                    class={`btn btn-sm ${encryptCase === "leave" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setEncryptCase("leave")}
                  >
                    Leave case
                  </button>
                  <button
                    class={`btn btn-sm ${encryptCase === "upper" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setEncryptCase("upper")}
                  >
                    Uppercase
                  </button>
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">
                    Block size: {blockSize === 0 ? "None" : blockSize}
                  </span>
                </label>
                <div class="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={blockSize}
                    onChange={(e) => setBlockSize(parseInt((e.target as HTMLInputElement).value))}
                    class="range range-sm flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={blockSize}
                    onChange={(e) =>
                      setBlockSize(parseInt((e.target as HTMLInputElement).value) || 0)
                    }
                    class="input input-sm input-bordered w-20"
                  />
                </div>
                <span class="label-text-alt mt-1">
                  {blockSize === 0 ? "No spacing added" : `Add space every ${blockSize} characters`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decrypt Options */}
      {mode === "decrypt" && (
        <div class="collapse collapse-arrow bg-base-300 rounded-lg mb-4">
          <input
            type="checkbox"
            checked={showOptions}
            onChange={(e) => setShowOptions((e.target as HTMLInputElement).checked)}
          />
          <div class="collapse-title font-semibold">Options</div>
          <div class="collapse-content">
            <div class="space-y-2">
              <label class="label cursor-pointer justify-start gap-2">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={stripSpaces}
                  onChange={(e) => setStripSpaces((e.target as HTMLInputElement).checked)}
                />
                <span class="label-text">Strip spaces</span>
              </label>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Case handling:</span>
                </label>
                <div class="flex gap-2">
                  <button
                    class={`btn btn-sm ${decryptCase === "leave" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setDecryptCase("leave")}
                  >
                    Leave case
                  </button>
                  <button
                    class={`btn btn-sm ${decryptCase === "lower" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setDecryptCase("lower")}
                  >
                    Lowercase
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Text */}
      <div class="form-control mb-4">
        <textarea
          class="textarea textarea-bordered h-32 font-mono w-full"
          placeholder={mode === "decrypt" ? "Enter cipher text" : "Enter plain text"}
          value={inputText}
          onInput={(e) => setInputText((e.target as HTMLTextAreaElement).value)}
        />
      </div>

      {/* Output Text */}
      <div class="form-control mb-4">
        <textarea
          class="textarea textarea-bordered h-32 font-mono w-full"
          placeholder={
            mode === "decrypt" ? "Plain text will appear here" : "Cipher text will appear here"
          }
          value={outputText}
          readOnly
        />
      </div>
      {outputText && (
        <button
          class="btn btn-sm btn-outline mb-4"
          onClick={() => {
            navigator.clipboard.writeText(outputText);
          }}
        >
          Copy to Clipboard
        </button>
      )}

      {/* Brute Force Section */}
      <div class="divider">Brute Force Attack</div>
      <button
        class="btn btn-secondary btn-block mb-4"
        onClick={() => setShowBruteForce(!showBruteForce)}
        disabled={!inputText}
      >
        {showBruteForce ? "Hide" : "Show"} All Possible Shifts
      </button>

      {showBruteForce && (
        <div class="bg-base-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          <div class="space-y-3">
            {bruteForceResults.map((result) => (
              <div key={result.shift} class="hover:bg-base-200 p-2 rounded">
                <div class="font-bold text-sm mb-1">Shift {result.shift}</div>
                <div class="font-mono text-sm">{result.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
