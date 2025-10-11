import React from "preact/compat";
import { useState } from "preact/hooks";

export default function CaesarShiftTool() {
  const [inputText, setInputText] = useState("");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");

  const caesarShift = (text: string, shiftAmount: number, isDecrypt: boolean): string => {
    const actualShift = isDecrypt ? -shiftAmount : shiftAmount;

    return text
      .split("")
      .map((char) => {
        // Handle uppercase letters
        if (char >= "A" && char <= "Z") {
          const charCode = char.charCodeAt(0) - 65;
          const shifted = (charCode + actualShift + 26) % 26;
          return String.fromCharCode(shifted + 65);
        }
        // Handle lowercase letters
        if (char >= "a" && char <= "z") {
          const charCode = char.charCodeAt(0) - 97;
          const shifted = (charCode + actualShift + 26) % 26;
          return String.fromCharCode(shifted + 97);
        }
        // Leave non-alphabetic characters unchanged
        return char;
      })
      .join("");
  };

  const outputText = caesarShift(inputText, shift, mode === "decrypt");

  const handleBruteForce = () => {
    // Generate all 26 possible shifts (0-25)
    const results: string[] = [];
    for (let i = 0; i <= 25; i++) {
      results.push(`Shift ${i}: ${caesarShift(inputText, i, false)}`);
    }
    return results;
  };

  const [showBruteForce, setShowBruteForce] = useState(false);
  const bruteForceResults = showBruteForce ? handleBruteForce() : [];

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

      {/* Input Text */}
      <div class="form-control mb-4">
        <textarea
          class="textarea textarea-bordered h-32 font-mono"
          placeholder={mode === "decrypt" ? "Enter cipher text" : "Enter plain text"}
          value={inputText}
          onInput={(e) => setInputText((e.target as HTMLTextAreaElement).value)}
        />
      </div>

      {/* Output Text */}
      <div class="form-control mb-4">
        <textarea
          class="textarea textarea-bordered h-32 font-mono"
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
          <div class="font-mono text-sm space-y-1">
            {bruteForceResults.map((result, idx) => (
              <div key={idx} class="hover:bg-base-200 p-1 rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Examples */}
      <div class="mt-4">
        <p class="text-sm text-base-content/70">
          <strong>Quick examples:</strong> Try "HELLO WORLD" with shift 3, or paste in some
          ciphertext and use brute force to find the right shift!
        </p>
      </div>
    </div>
  );
}
