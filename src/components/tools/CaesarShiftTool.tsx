import React from "preact/compat";
import { useState } from "preact/hooks";
import {
  caesarShift,
  type EncryptOptions,
  type DecryptOptions,
  type CipherMode,
} from "../../utils/caesarCipher";

interface BruteForceResult {
  shift: number;
  text: string;
}

export default function CaesarShiftTool() {
  const [inputText, setInputText] = useState("");
  const [shift, setShift] = useState(3);
  const [showBruteForce, setShowBruteForce] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [encryptOptions, setEncryptOptions] = useState<EncryptOptions>({
    stripNonAlpha: false,
    caseHandling: "upper",
    blockSize: 0,
  });
  const [decryptOptions, setDecryptOptions] = useState<DecryptOptions>({
    stripSpaces: false,
    caseHandling: "lower",
  });
  const [cipherMode, setCipherMode] = useState<CipherMode>({
    mode: "encrypt",
    options: encryptOptions,
  });

  function handleBruteForce(text: string, cipherMode: CipherMode): BruteForceResult[] {
    const results: BruteForceResult[] = [];
    for (let i = 0; i < 26; i++) {
      results.push({ shift: i, text: caesarShift(text, i, cipherMode) });
    }
    return results;
  }

  const outputText = caesarShift(inputText, shift, cipherMode);
  const bruteForceResults = showBruteForce ? handleBruteForce(inputText, cipherMode) : [];

  return (
    <div class="not-prose my-8 p-6 bg-base-200 rounded-lg shadow-lg">
      <h3 class="text-2xl font-bold mb-4 text-base-content">Caesar Shift Tool</h3>

      {/* Mode Selection */}
      <div class="flex gap-2 mb-4">
        <button
          class={`btn ${cipherMode.mode === "encrypt" ? "btn-primary" : "btn-outline"}`}
          onClick={() =>
            setCipherMode({
              mode: "encrypt",
              options: encryptOptions,
            })
          }
        >
          Encrypt
        </button>
        <button
          class={`btn ${cipherMode.mode === "decrypt" ? "btn-primary" : "btn-outline"}`}
          onClick={() =>
            setCipherMode({
              mode: "decrypt",
              options: decryptOptions,
            })
          }
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
      {cipherMode.mode === "encrypt" && (
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
                  checked={cipherMode.mode === "encrypt" ? cipherMode.options.stripNonAlpha : false}
                  onChange={(e) => {
                    if (cipherMode.mode === "encrypt") {
                      const options = {
                        ...cipherMode.options,
                        stripNonAlpha: (e.target as HTMLInputElement).checked,
                      };
                      setEncryptOptions(options);
                      setCipherMode({
                        ...cipherMode,
                        options: options,
                      });
                    }
                  }}
                />
                <span class="label-text">Strip non-alphabetic characters</span>
              </label>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Case handling:</span>
                </label>
                <div class="flex gap-2">
                  <button
                    class={`btn btn-sm ${cipherMode.mode === "encrypt" && cipherMode.options.caseHandling === "leave" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => {
                      if (cipherMode.mode === "encrypt") {
                        const options = {
                          ...cipherMode.options,
                          caseHandling: "leave" as const,
                        };
                        setEncryptOptions(options);
                        setCipherMode({
                          ...cipherMode,
                          options: options,
                        });
                      }
                    }}
                  >
                    Leave case
                  </button>
                  <button
                    class={`btn btn-sm ${cipherMode.mode === "encrypt" && cipherMode.options.caseHandling === "upper" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => {
                      if (cipherMode.mode === "encrypt") {
                        const options = {
                          ...cipherMode.options,
                          caseHandling: "upper" as const,
                        };
                        setEncryptOptions(options);
                        setCipherMode({
                          ...cipherMode,
                          options: options,
                        });
                      }
                    }}
                  >
                    Uppercase
                  </button>
                </div>
              </div>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">
                    Block size:{" "}
                    {cipherMode.mode === "encrypt"
                      ? cipherMode.options.blockSize === 0
                        ? "None"
                        : cipherMode.options.blockSize
                      : "None"}
                  </span>
                </label>
                <div class="flex gap-2 items-center">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={cipherMode.mode === "encrypt" ? cipherMode.options.blockSize : 0}
                    onChange={(e) => {
                      if (cipherMode.mode === "encrypt") {
                        const options = {
                          ...cipherMode.options,
                          blockSize: parseInt((e.target as HTMLInputElement).value),
                        };
                        setEncryptOptions(options);
                        setCipherMode({
                          ...cipherMode,
                          options: options,
                        });
                      }
                    }}
                    class="range range-sm flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={cipherMode.mode === "encrypt" ? cipherMode.options.blockSize : 0}
                    onChange={(e) => {
                      if (cipherMode.mode === "encrypt") {
                        const options = {
                          ...cipherMode.options,
                          blockSize: parseInt((e.target as HTMLInputElement).value) || 0,
                        };
                        setEncryptOptions(options);
                        setCipherMode({
                          ...cipherMode,
                          options: options,
                        });
                      }
                    }}
                    class="input input-sm input-bordered w-20"
                  />
                </div>
                <span class="label-text-alt mt-1">
                  {cipherMode.mode === "encrypt" && cipherMode.options.blockSize === 0
                    ? "No spacing added"
                    : cipherMode.mode === "encrypt"
                      ? `Add space every ${cipherMode.options.blockSize} characters`
                      : "No spacing added"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decrypt Options */}
      {cipherMode.mode === "decrypt" && (
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
                  checked={cipherMode.mode === "decrypt" ? cipherMode.options.stripSpaces : false}
                  onChange={(e) => {
                    if (cipherMode.mode === "decrypt") {
                      const options = {
                        ...cipherMode.options,
                        stripSpaces: (e.target as HTMLInputElement).checked,
                      };
                      setDecryptOptions(options);
                      setCipherMode({
                        ...cipherMode,
                        options: options,
                      });
                    }
                  }}
                />
                <span class="label-text">Strip spaces</span>
              </label>

              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Case handling:</span>
                </label>
                <div class="flex gap-2">
                  <button
                    class={`btn btn-sm ${cipherMode.mode === "decrypt" && cipherMode.options.caseHandling === "leave" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => {
                      if (cipherMode.mode === "decrypt") {
                        const options = {
                          ...cipherMode.options,
                          caseHandling: "leave" as const,
                        };
                        setDecryptOptions(options);
                        setCipherMode({
                          ...cipherMode,
                          options: options,
                        });
                      }
                    }}
                  >
                    Leave case
                  </button>
                  <button
                    class={`btn btn-sm ${cipherMode.mode === "decrypt" && cipherMode.options.caseHandling === "lower" ? "btn-primary" : "btn-outline"}`}
                    onClick={() => {
                      if (cipherMode.mode === "decrypt") {
                        const options = {
                          ...cipherMode.options,
                          caseHandling: "lower" as const,
                        };
                        setDecryptOptions(options);
                        setCipherMode({
                          ...cipherMode,
                          options: options,
                        });
                      }
                    }}
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
          placeholder={cipherMode.mode === "decrypt" ? "Enter cipher text" : "Enter plain text"}
          value={inputText}
          onInput={(e) => setInputText((e.target as HTMLTextAreaElement).value)}
        />
      </div>

      {/* Output Text */}
      <div class="form-control mb-4">
        <textarea
          class="textarea textarea-bordered h-32 font-mono w-full"
          placeholder={
            cipherMode.mode === "decrypt"
              ? "Plain text will appear here"
              : "Cipher text will appear here"
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
