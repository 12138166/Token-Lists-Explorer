import React, { useState } from "react";
import { AlertCircle, CheckCircle, FileJson, Play, HelpCircle, Code, Copy, Check, Download, ClipboardList } from "lucide-react";
import { ListValidationResult, ListValidationError } from "../types";

export default function Validator() {
  const [jsonText, setJsonText] = useState("");
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [results, setResults] = useState<ListValidationResult | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const sampleTemplate = `{
  "name": "My Custom Token List",
  "timestamp": "${new Date().toISOString()}",
  "version": {
    "major": 1,
    "minor": 0,
    "patch": 0
  },
  "keywords": ["community", "ethereum", "defi"],
  "tokens": [
    {
      "chainId": 1,
      "address": "0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2",
      "symbol": "WETH",
      "name": "Wrapped Ether",
      "decimals": 18,
      "logoURI": "https://assets.coingecko.com/coins/images/2518/thumb/weth.png"
    },
    {
      "chainId": 1,
      "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "symbol": "USDC",
      "name": "USD Coin",
      "decimals": 6,
      "logoURI": "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png"
    }
  ]
}`;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2050);
  };

  const handlePasteSample = () => {
    setJsonText(sampleTemplate);
  };

  const handleValidate = () => {
    setHasScanned(true);
    const errors: ListValidationError[] = [];
    let parsed: any = null;

    if (!jsonText.trim()) {
      setResults({
        isValid: false,
        errors: [{ path: "JSON", message: "Input area is empty. Please enter some text to scan.", severity: "error" }],
        tokenCount: 0,
        detectedChains: []
      });
      return;
    }

    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      setResults({
        isValid: false,
        errors: [{ path: "JSON Parser", message: `Invalid JSON syntax: ${e.message}`, severity: "error" }],
        tokenCount: 0,
        detectedChains: []
      });
      return;
    }

    // List Name checking
    if (!parsed.name) {
      errors.push({ path: "name", message: "Property 'name' is required.", severity: "error" });
    } else if (typeof parsed.name !== "string" || parsed.name.trim().length === 0) {
      errors.push({ path: "name", message: "Property 'name' must be a non-empty string.", severity: "error" });
    } else if (parsed.name.length > 35) {
      errors.push({ path: "name", message: `List name '${parsed.name}' is too long (${parsed.name.length}/35 chars). Standard apps might reject or squeeze it.`, severity: "warning" });
    }

    // Timestamp checking
    if (!parsed.timestamp) {
      errors.push({ path: "timestamp", message: "Property 'timestamp' is missing.", severity: "error" });
    } else {
      const isIso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(parsed.timestamp);
      const withTz = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(parsed.timestamp);
      if (!isIso && !withTz) {
        errors.push({ path: "timestamp", message: `Timestamp '${parsed.timestamp}' is invalid. Standard requires ISO-8601 string format.`, severity: "warning" });
      }
    }

    // Version checking
    if (!parsed.version) {
      errors.push({ path: "version", message: "Property 'version' is missing.", severity: "error" });
    } else {
      const v = parsed.version;
      if (typeof v.major !== "number" || typeof v.minor !== "number" || typeof v.patch !== "number" || v.major < 0 || v.minor < 0 || v.patch < 0) {
        errors.push({ path: "version", message: "Version must contain integer indexes major, minor, patch (e.g. 1.0.0).", severity: "error" });
      }
    }

    // Tokens matching
    let tokenCount = 0;
    const detectedChains: number[] = [];

    if (!parsed.tokens) {
      errors.push({ path: "tokens", message: "Property 'tokens' array is required in root list.", severity: "error" });
    } else if (!Array.isArray(parsed.tokens)) {
      errors.push({ path: "tokens", message: "Property 'tokens' must be a valid JSON array.", severity: "error" });
    } else {
      tokenCount = parsed.tokens.length;
      if (tokenCount === 0) {
        errors.push({ path: "tokens", message: "The tokens array is empty.", severity: "warning" });
      }

      parsed.tokens.forEach((token: any, index: number) => {
        const pathPrefix = `tokens[${index}]`;

        // chainId test
        if (typeof token.chainId !== "number" || isNaN(token.chainId) || token.chainId < 0) {
          errors.push({ path: `${pathPrefix}.chainId`, message: `Invalid chainId value. Must be positive integer.`, severity: "error" });
        } else {
          if (!detectedChains.includes(token.chainId)) {
            detectedChains.push(token.chainId);
          }
        }

        // address test
        if (!token.address) {
          errors.push({ path: `${pathPrefix}.address`, message: "Missing contract address property.", severity: "error" });
        } else if (typeof token.address !== "string") {
          errors.push({ path: `${pathPrefix}.address`, message: "Address property must be a string.", severity: "error" });
        } else {
          const isHex = /^0x[a-fA-F0-9]{40}$/.test(token.address);
          if (!isHex) {
            errors.push({ path: `${pathPrefix}.address`, message: `Address '${token.address}' is not a valid 40-character hexadecimal contract.`, severity: "error" });
          }
        }

        // name test
        if (!token.name) {
          errors.push({ path: `${pathPrefix}.name`, message: "Token name is missing.", severity: "error" });
        } else if (typeof token.name !== "string" || token.name.trim().length === 0) {
          errors.push({ path: `${pathPrefix}.name`, message: "Token name must be a non-empty string.", severity: "error" });
        }

        // symbol test
        if (!token.symbol) {
          errors.push({ path: `${pathPrefix}.symbol`, message: "Token symbol is missing.", severity: "error" });
        } else if (typeof token.symbol !== "string" || token.symbol.trim().length === 0) {
          errors.push({ path: `${pathPrefix}.symbol`, message: "Token symbol must be a non-empty string.", severity: "error" });
        } else if (!/^[A-Za-z0-9\-\+]{1,16}$/.test(token.symbol)) {
          errors.push({ path: `${pathPrefix}.symbol`, message: `Token symbol '${token.symbol}' contains non-standard characters or length.`, severity: "warning" });
        }

        // decimals test
        if (typeof token.decimals !== "number" || isNaN(token.decimals)) {
          errors.push({ path: `${pathPrefix}.decimals`, message: "Token decimals value is missing or non-numeric.", severity: "error" });
        } else if (token.decimals < 0 || token.decimals > 255) {
          errors.push({ path: `${pathPrefix}.decimals`, message: `Asset decimals (${token.decimals}) out of conventional bounds (0-255).`, severity: "error" });
        }

        // logoURI test
        if (token.logoURI) {
          if (typeof token.logoURI !== "string" || !token.logoURI.startsWith("http://") && !token.logoURI.startsWith("https://") && !token.logoURI.startsWith("ipfs://")) {
            errors.push({ path: `${pathPrefix}.logoURI`, message: `Invalid logo URI protocol. Use ipfs or secure HTTP links.`, severity: "warning" });
          }
        } else {
          errors.push({ path: `${pathPrefix}`, message: `Is recommended to supply logoURI for asset discoverability (${token.symbol}).`, severity: "warning" });
        }
      });
    }

    const hasErrors = errors.some((e) => e.severity === "error");

    setResults({
      isValid: !hasErrors,
      errors,
      tokenCount,
      detectedChains
    });
  };

  const handleDownload = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = JSON.parse(jsonText);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsed, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${parsed.name || "custom"}-tokenlist.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Please fix invalid JSON format before attempting download.");
    }
  };

  const errorCount = results?.errors.filter((e) => e.severity === "error").length || 0;
  const warningCount = results?.errors.filter((e) => e.severity === "warning").length || 0;

  return (
    <div className="space-y-8" id="tokenlists-validator">
      {/* Intro Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start shadow-sm animate-in fade-in duration-150">
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-2xl font-sans font-extrabold text-slate-950 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-600 animate-pulse" />
            Token List Schema Validator
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Validate your custom list parameters directly against the JSON Schema standards defined by Uniswap. Check timestamps, chain compatibility, decimals index range compliance, logo protocols, and crypto hexadecimal addresses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handlePasteSample}
            className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-105 hover:bg-slate-100 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            Paste Standard Template
          </button>
          <button
            onClick={handleCopyTemplate}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-105 hover:bg-slate-100 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            {copiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
            Copy Template Schema
          </button>
        </div>
      </div>

      {/* Editor & Results Panels split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input box */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 flex-1 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700 text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-indigo-605 text-indigo-600" />
                Raw JSON Schema Editor
              </span>

              {jsonText.trim() && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-605 text-indigo-600 hover:text-indigo-705 hover:text-indigo-700 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save List File
                </button>
              )}
            </div>

            <textarea
              placeholder="Paste your JSON structured token list here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full h-96 md:h-[450px] bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-850 text-slate-800 placeholder-slate-405 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
            />

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-455 text-slate-400 font-medium">
                Supports standard arrays of address hashes, decimals, names, symbols
              </span>
              <button
                onClick={handleValidate}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-100 transition duration-150 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Trigger Scan validation
              </button>
            </div>
          </div>
        </div>

        {/* Validation Outcomes */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-205 border-slate-200 rounded-3xl p-5 space-y-6 min-h-full shadow-sm">
            <h3 className="text-xs font-extrabold tracking-wider text-slate-400 uppercase">
              Scan Audit Logs
            </h3>

            {!hasScanned ? (
              <div className="text-center py-24 text-slate-400 space-y-3">
                <ClipboardList className="w-10 h-10 mx-auto opacity-20 text-slate-300" />
                <p className="text-sm font-extrabold text-slate-505 text-slate-500">Scan has not been triggered yet</p>
                <p className="text-[11px] max-w-[250px] mx-auto text-slate-405 text-slate-400 leading-normal">
                  Write or paste your custom Token List JSON in the editor panel and click "Trigger Scan validation".
                </p>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Visual validation card */}
                {results?.isValid ? (
                  <div className="flex items-start gap-3 p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs">
                    <CheckCircle className="w-5 h-5 text-teal-605 text-teal-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-teal-900 text-sm">Valid Token List Schema</h4>
                      <p className="mt-1 text-teal-700 leading-relaxed">
                        Excellent! Your JSON list conforms to the standard Token List specification.
                      </p>
                      <div className="flex gap-4 mt-3 pt-3 border-t border-teal-100 text-[10px]">
                        <div>
                          Unique Coins: <span className="font-bold text-slate-800">{results.tokenCount}</span>
                        </div>
                        <div>
                          Active Chains: <span className="font-bold text-slate-800">{results.detectedChains.join(", ") || "None"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-250 border-rose-200 text-rose-800 rounded-xl text-xs">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-rose-900 text-sm">Structural Schema Failure</h4>
                      <p className="mt-1 text-rose-700 leading-relaxed">
                        Detected {errorCount} blocking errors preventing standard application parser integration.
                      </p>
                    </div>
                  </div>
                )}

                {/* Score breakdown indicator */}
                <div className="flex items-center justify-between text-xs p-3.5 bg-slate-50 border border-slate-105 border-slate-100 rounded-xl">
                  <span className="text-slate-505 text-slate-500 font-semibold">Compliance Audit Summary:</span>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold rounded-md">
                      {errorCount} Errors
                    </span>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] font-bold rounded-md">
                      {warningCount} Warnings
                    </span>
                  </div>
                </div>

                {/* Specific issues trace */}
                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {results?.errors.map((err, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2.5 ${
                        err.severity === "error"
                          ? "bg-rose-50/50 border-rose-105 border-rose-100 text-rose-805 text-rose-800"
                          : "bg-amber-50/50 border-amber-105 border-amber-100 text-amber-805 text-amber-800"
                      }`}
                    >
                      <span className={`inline-block px-1.5 py-0.5 font-bold uppercase rounded text-[8px] transform -translate-y-[1px] ${
                        err.severity === "error" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {err.severity}
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="font-mono font-bold text-slate-505 text-slate-500 text-[10px]">
                          Path: {err.path}
                        </div>
                        <div className="text-slate-700 font-medium">{err.message}</div>
                      </div>
                    </div>
                  ))}
                  {results && results.errors.length === 0 && (
                    <div className="p-8 text-center text-teal-800 font-bold bg-teal-50/40 border border-teal-100 rounded-xl text-xs">
                      Zero schema warnings found. List is pristine.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
