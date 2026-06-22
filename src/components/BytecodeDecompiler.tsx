import React, { useState, useEffect } from "react";
import {
  Binary,
  FileCode,
  Terminal,
  ArrowRight,
  Search,
  Copy,
  Check,
  Layers,
  Cpu,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  ChevronDown,
  Info
} from "lucide-react";
import { TokenList, TokenInfo, DecompileResponse } from "../types";
import { CHAINS_MAP } from "../data/curatedLists";
import { motion, AnimatePresence } from "motion/react";

interface DiffLine {
  value: string;
  type: "added" | "removed" | "unchanged";
}

function diffLines(text1: string, text2: string): DiffLine[] {
  const lines1 = (text1 || "").split("\n").map(l => l.trimEnd());
  const lines2 = (text2 || "").split("\n").map(l => l.trimEnd());
  
  const m = lines1.length;
  const n = lines2.length;
  
  if (m > 350 || n > 350) {
    const result: DiffLine[] = [];
    const set1 = new Set(lines1);
    lines2.forEach(line => {
      if (set1.has(line)) {
        result.push({ value: line, type: "unchanged" as const });
      } else {
        result.push({ value: line, type: "added" as const });
      }
    });
    return result;
  }
  
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (lines1[i - 1] === lines2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const result: DiffLine[] = [];
  let i = m;
  let j = n;
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lines1[i - 1] === lines2[j - 1]) {
      result.unshift({ value: lines1[i - 1], type: "unchanged" as const });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ value: lines2[j - 1], type: "added" as const });
      j--;
    } else {
      result.unshift({ value: lines1[i - 1], type: "removed" as const });
      i--;
    }
  }
  
  return result;
}

interface InteractiveDiffViewerProps {
  data1: DecompileResponse;
  data2: DecompileResponse;
}

export function InteractiveDiffViewer({ data1, data2 }: InteractiveDiffViewerProps) {
  const [diffTab, setDiffTab] = useState<"pseudocode" | "opcodes" | "storage" | "functions">("pseudocode");
  const [searchCodeQuery, setSearchCodeQuery] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  // Compute text diff for Pseudocode
  const pseudocodeDiff = React.useMemo(() => {
    return diffLines(data1.pseudocode, data2.pseudocode);
  }, [data1.pseudocode, data2.pseudocode]);

  // Compute text diff for Opcodes
  const opcodesDiff = React.useMemo(() => {
    return diffLines(data1.opcodes, data2.opcodes);
  }, [data1.opcodes, data2.opcodes]);

  // Merge state variables
  const storageAnalysis = React.useMemo(() => {
    const s1Map = new Map((data1.storageSlots || []).map((s) => [s.slot, s]));
    const s2Map = new Map((data2.storageSlots || []).map((s) => [s.slot, s]));
    const allSlots = Array.from(new Set([...s1Map.keys(), ...s2Map.keys()])).sort((a, b) => {
      const parsedA = parseInt(a || "0", 16) || 0;
      const parsedB = parseInt(b || "0", 16) || 0;
      return parsedA - parsedB;
    });

    return allSlots.map((slot) => {
      const s1 = s1Map.get(slot);
      const s2 = s2Map.get(slot);

      let status: "added" | "removed" | "modified" | "unchanged" = "unchanged";
      if (!s1 && s2) {
        status = "added";
      } else if (s1 && !s2) {
        status = "removed";
      } else if (s1 && s2) {
        if (s1.variableName !== s2.variableName || s1.type !== s2.type) {
          status = "modified";
        }
      }

      return {
        slot,
        oldVar: s1?.variableName || null,
        newVar: s2?.variableName || null,
        oldType: s1?.type || null,
        newType: s2?.type || null,
        oldDesc: s1?.description || null,
        newDesc: s2?.description || null,
        status
      };
    });
  }, [data1.storageSlots, data2.storageSlots]);

  // Merge function signatures
  const functionAnalysis = React.useMemo(() => {
    const f1Map = new Map((data1.functions || []).map((f) => [f.signature, f]));
    const f2Map = new Map((data2.functions || []).map((f) => [f.signature, f]));
    const allSigs = Array.from(new Set([...f1Map.keys(), ...f2Map.keys()]));

    return allSigs.map((sig) => {
      const f1 = f1Map.get(sig);
      const f2 = f2Map.get(sig);

      let status: "added" | "removed" | "modified" | "unchanged" = "unchanged";
      if (!f1 && f2) {
        status = "added";
      } else if (f1 && !f2) {
        status = "removed";
      } else if (f1 && f2) {
        if (
          f1.name !== f2.name ||
          f1.solidityEquivalent !== f2.solidityEquivalent ||
          f1.logicOverview !== f2.logicOverview
        ) {
          status = "modified";
        }
      }

      return {
        signature: sig,
        oldName: f1?.name || null,
        newName: f2?.name || null,
        oldSolidity: f1?.solidityEquivalent || null,
        newSolidity: f2?.solidityEquivalent || null,
        oldLogic: f1?.logicOverview || null,
        newLogic: f2?.logicOverview || null,
        status
      };
    });
  }, [data1.functions, data2.functions]);

  // Filter diff results based on search code query
  const filteredPseudocodeDiff = React.useMemo(() => {
    if (!searchCodeQuery.trim()) return pseudocodeDiff;
    const query = searchCodeQuery.toLowerCase();
    return pseudocodeDiff.filter((line) => line.value.toLowerCase().includes(query));
  }, [pseudocodeDiff, searchCodeQuery]);

  const filteredOpcodesDiff = React.useMemo(() => {
    if (!searchCodeQuery.trim()) return opcodesDiff;
    const query = searchCodeQuery.toLowerCase();
    return opcodesDiff.filter((line) => line.value.toLowerCase().includes(query));
  }, [opcodesDiff, searchCodeQuery]);

  // Counter summaries
  const stats = React.useMemo(() => {
    const codeAdded = pseudocodeDiff.filter((x) => x.type === "added").length;
    const codeRemoved = pseudocodeDiff.filter((x) => x.type === "removed").length;

    const modifiedStorageCount = storageAnalysis.filter((x) => x.status === "modified").length;
    const addedStorageCount = storageAnalysis.filter((x) => x.status === "added").length;
    const removedStorageCount = storageAnalysis.filter((x) => x.status === "removed").length;

    const modifiedFuncs = functionAnalysis.filter((x) => x.status === "modified").length;
    const addedFuncs = functionAnalysis.filter((x) => x.status === "added").length;
    const removedFuncs = functionAnalysis.filter((x) => x.status === "removed").length;

    return {
      codeAdded,
      codeRemoved,
      storageChanged: modifiedStorageCount + addedStorageCount + removedStorageCount,
      funcsChanged: modifiedFuncs + addedFuncs + removedFuncs,
      mStorage: modifiedStorageCount,
      aStorage: addedStorageCount,
      rStorage: removedStorageCount,
      mFuncs: modifiedFuncs,
      aFuncs: addedFuncs,
      rFuncs: removedFuncs
    };
  }, [pseudocodeDiff, storageAnalysis, functionAnalysis]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleFuncClick = (funcName: string) => {
    setDiffTab("pseudocode");
    setSearchCodeQuery(funcName);
  };

  const currentDiff = diffTab === "pseudocode" ? filteredPseudocodeDiff : filteredOpcodesDiff;

  return (
    <div className="space-y-6 w-full animate-fadeIn font-sans" id="interactive-comparison-flow">
      {/* Visual Diagnostic Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Code Line Mutations */}
        <div className="bg-slate-900 border border-slate-850 border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-lg hover:shadow-indigo-500/5 transition">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Solidity Pseudocode Mutations
              </p>
              <h4 className="text-xl font-black text-white mt-1">
                <span className="text-emerald-400">+{stats.codeAdded}</span>{" "}
                <span className="text-rose-400">-{stats.codeRemoved}</span>
              </h4>
              <p className="text-[10px] text-slate-450 text-slate-400 font-semibold mt-0.5">
                Lines changed between versions
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Storage Map Deviations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-lg hover:shadow-cyan-500/5 transition">
          <div className="absolute right-0 top-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Storage Layout Blueprint
              </p>
              <h4 className="text-xl font-black text-white mt-1">
                {stats.storageChanged > 0 ? (
                  <span className="text-amber-400">{stats.storageChanged} Delta Slots</span>
                ) : (
                  <span className="text-emerald-400">Fully Aligned</span>
                )}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {stats.mStorage} modified • {stats.aStorage} added • {stats.rStorage} retired
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Functional Signature Gap */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-lg hover:shadow-emerald-500/5 transition">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Functional Interface Gap
              </p>
              <h4 className="text-xl font-black text-white mt-1">
                {stats.funcsChanged > 0 ? (
                  <span className="text-violet-400">{stats.funcsChanged} Methods Mutated</span>
                ) : (
                  <span className="text-emerald-400">Identical Interface</span>
                )}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                {stats.mFuncs} changed • {stats.aFuncs} added • {stats.rFuncs} deleted
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs list and Interactive search */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Main subtab navigation */}
          <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1 rounded-2xl max-w-xl">
            <button
              onClick={() => {
                setDiffTab("pseudocode");
                setSearchCodeQuery("");
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                diffTab === "pseudocode"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-500" />
              Solidity Pseudocode
              {stats.codeAdded + stats.codeRemoved > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black leading-none px-1.5 py-0.5 rounded-full">
                  {stats.codeAdded + stats.codeRemoved}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setDiffTab("opcodes");
                setSearchCodeQuery("");
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                diffTab === "opcodes"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              EVM Assembly
            </button>
            <button
              onClick={() => setDiffTab("storage")}
              className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                diffTab === "storage"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-500" />
              State Blueprint
              {stats.storageChanged > 0 && (
                <span className="bg-amber-500 text-white text-[9px] font-black leading-none px-1.5 py-0.5 rounded-full">
                  {stats.storageChanged}
                </span>
              )}
            </button>
            <button
              onClick={() => setDiffTab("functions")}
              className={`py-2 px-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                diffTab === "functions"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Binary className="w-3.5 h-3.5 text-rose-500" />
              Contract Interface
              {stats.funcsChanged > 0 && (
                <span className="bg-violet-500 text-white text-[9px] font-black leading-none px-1.5 py-0.5 rounded-full">
                  {stats.funcsChanged}
                </span>
              )}
            </button>
          </div>

          {/* Interactive filter (only for code text views) */}
          {(diffTab === "pseudocode" || diffTab === "opcodes") && (
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter code lines/methods..."
                value={searchCodeQuery}
                onChange={(e) => setSearchCodeQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold placeholder:text-slate-400"
              />
            </div>
          )}
        </div>

        {/* Content Pane */}
        <div className="p-6">
          {(diffTab === "pseudocode" || diffTab === "opcodes") && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-indigo-50 border border-indigo-100/60 p-3 rounded-2xl leading-relaxed">
                <Info className="w-4 h-4 text-indigo-500 shrink-0" />
                <span>
                  The following box merges the code sequences of Contract A and Contract B: 
                  <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded mx-1 select-none font-mono">- red lines</span> indicate original logic present only in A, while 
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded mx-1 select-none font-mono">+ green lines</span> are new or modified code introduced in contract B.
                </span>
              </div>

              {/* Code Panel */}
              <div className="bg-slate-950 rounded-2xl border border-slate-900 shadow-2xl p-4 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-3">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-sans flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Unified {diffTab === "pseudocode" ? "Solidity Draft" : "Bytecode Instructions"} Decoupled Source
                  </span>
                  <div className="flex items-center gap-2">
                    {searchCodeQuery && (
                      <button
                        onClick={() => setSearchCodeQuery("")}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 font-black uppercase bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/10 cursor-pointer"
                      >
                        Clear Filter
                      </button>
                    )}
                    <button
                      onClick={() => handleCopy(diffTab === "pseudocode" ? data2.pseudocode : data2.opcodes)}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition cursor-pointer font-bold"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          Copied B
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy B Source
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="max-h-[500px] overflow-y-auto font-mono text-[11px] leading-relaxed divide-y divide-slate-800/20 rounded-xl bg-slate-950 p-2 border border-slate-900">
                  {currentDiff.length === 0 ? (
                    <div className="text-center py-12 text-slate-505 text-slate-400 font-bold font-sans">
                      No matching code segments found for: "{searchCodeQuery}"
                    </div>
                  ) : (
                    currentDiff.map((line, idx) => {
                      let bgClass = "text-slate-300 hover:bg-slate-900/30";
                      let indicator = " ";
                      let lineBorder = "";

                      if (line.type === "added") {
                        bgClass = "bg-emerald-950/25 text-emerald-300 hover:bg-emerald-950/40";
                        indicator = "+";
                        lineBorder = "border-l-[3px] border-emerald-500 pl-3";
                      } else if (line.type === "removed") {
                        bgClass = "bg-rose-950/25 text-rose-300 hover:bg-rose-950/40";
                        indicator = "-";
                        lineBorder = "border-l-[3px] border-rose-500 pl-3";
                      } else {
                        lineBorder = "pl-3.5 text-slate-400";
                      }

                      return (
                        <div
                          key={idx}
                          className={`group flex py-1 px-2 transition font-mono ${bgClass}`}
                        >
                          <span className="w-8 shrink-0 text-[10px] text-slate-600 select-none font-mono text-right pr-2">
                            {idx + 1}
                          </span>
                          <span className={`w-4 shrink-0 text-[10px] select-none font-mono font-black ${
                            line.type === "added" ? "text-emerald-400" : line.type === "removed" ? "text-rose-400" : "text-slate-700"
                          }`}>
                            {indicator}
                          </span>
                          <span className={`font-mono flex-1 break-all whitespace-pre-wrap ${lineBorder}`}>
                            {line.value}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* State Blueprint slot comparative table */}
          {diffTab === "storage" && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-amber-50 border border-amber-100/60 p-3 rounded-2xl leading-relaxed">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  The state storage layout map tracks variables permanently configured as pointers. Row highlight indicates: 
                  <span className="bg-rose-50/50 text-rose-800 font-bold px-1.5 py-0.5 rounded mx-1 select-none font-sans">- Deleted / Retired variables</span> from Contract A, 
                  <span className="bg-emerald-50/50 text-emerald-800 font-bold px-1.5 py-0.5 rounded mx-1 select-none font-sans">+ New variables</span> introduced in Contract B, and 
                  <span className="bg-amber-100/40 text-amber-800 font-bold px-1.5 py-0.5 rounded mx-1 select-none font-sans font-extrabold font-sans">✎ Modified variable types</span> or storage pointers.
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-black">
                      <th className="py-3 px-4 font-mono">SLOT KEY</th>
                      <th className="py-3 px-4">CONTRACT A</th>
                      <th className="py-3 px-4">CONTRACT B</th>
                      <th className="py-3 px-4">MUTATIONAL CLASSIFICATION</th>
                      <th className="py-3 px-4">DESCRIPTION OR EXPLANATION OF CHANGE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60">
                    {storageAnalysis.map((item, idx) => {
                      let rowStyle = "hover:bg-slate-50/50";
                      let badge = (
                        <span className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-slate-200">
                          Unchanged
                        </span>
                      );

                      if (item.status === "added") {
                        rowStyle = "bg-emerald-50/20 hover:bg-emerald-50/40 text-emerald-950 font-medium";
                        badge = (
                          <span className="bg-emerald-500/10 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-emerald-500/20">
                            + New Layout Variable
                          </span>
                        );
                      } else if (item.status === "removed") {
                        rowStyle = "bg-rose-50/20 hover:bg-rose-50/40 text-rose-950 font-medium";
                        badge = (
                          <span className="bg-rose-500/10 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border border-rose-500/20">
                            - Row Retired
                          </span>
                        );
                      } else if (item.status === "modified") {
                        rowStyle = "bg-amber-50/25 hover:bg-amber-50/45 text-amber-950 font-medium";
                        badge = (
                          <span className="bg-amber-500/10 text-amber-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-lg border border-amber-500/20">
                            ✎ Type Mutation
                          </span>
                        );
                      }

                      return (
                        <tr key={idx} className={`transition ${rowStyle}`}>
                          <td className="py-3 px-4 font-mono font-black text-indigo-700">{item.slot}</td>
                          <td className="py-3 px-4">
                            {item.oldVar ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block">{item.oldVar}</span>
                                <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md inline-block">
                                  {item.oldType}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono italic">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {item.newVar ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-800 block">{item.newVar}</span>
                                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block font-black">
                                  {item.newType}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 font-mono italic">Retired slot</span>
                            )}
                          </td>
                          <td className="py-3 px-4">{badge}</td>
                          <td className="py-3 px-4 text-slate-600 text-[11px] leading-relaxed font-sans max-w-sm">
                            {item.status === "modified" && (
                              <div className="font-extrabold text-amber-805 text-amber-800 mb-1">
                                Modified layout definition: name changed or type cast.
                              </div>
                            )}
                            {item.newDesc || item.oldDesc}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Contract interface / Function changes view */}
          {diffTab === "functions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold bg-violet-50 border border-violet-100/60 p-3 rounded-2xl leading-relaxed">
                <Info className="w-4 h-4 text-violet-600 shrink-0" />
                <span>
                  Methods compared by 4-byte selector signatures. Clicking on <b className="text-indigo-700 font-bold">"Inspect matching logic lines"</b> 
                  automatically focuses on that function within the Solidity Code diff tab, highlighting how variable calculations or permissions were updated!
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {functionAnalysis.map((item, idx) => {
                  let cardStyle = "bg-white border-slate-200 hover:border-slate-300";
                  let tag = (
                    <span className="bg-slate-100 text-slate-600 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                      Selector Aligned
                    </span>
                  );
                  let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;

                  if (item.status === "added") {
                    cardStyle = "bg-emerald-50/10 border-emerald-200 hover:bg-emerald-50/20";
                    tag = (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                        + New Entrypoint
                      </span>
                    );
                    icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
                  } else if (item.status === "removed") {
                    cardStyle = "bg-rose-50/10 border-rose-200 hover:bg-rose-50/20";
                    tag = (
                      <span className="bg-rose-100 text-rose-800 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                        - Defunct Method
                      </span>
                    );
                    icon = <AlertTriangle className="w-4 h-4 text-rose-500" />;
                  } else if (item.status === "modified") {
                    cardStyle = "bg-amber-50/10 border-amber-200 hover:bg-amber-50/20";
                    tag = (
                      <span className="bg-amber-100 text-amber-850 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono">
                        ✎ Modified Code Logic / Branch
                      </span>
                    );
                    icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                  }

                  const activeName = item.newName || item.oldName || "unknown(...)";

                  return (
                    <div
                      key={idx}
                      className={`border p-4 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 transition ${cardStyle}`}
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {icon}
                          <span className="text-sm font-black text-slate-900 font-mono">
                            {activeName}
                          </span>
                          <span className="bg-slate-900 text-slate-300 font-mono text-[9px] px-2 py-0.5 leading-none rounded">
                            SIG: {item.signature}
                          </span>
                          {tag}
                        </div>

                        {/* Side-by-side or overview text block */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                              Solidity Interface Declaration
                            </span>
                            <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[10px] rounded-xl border border-slate-800 max-h-20 overflow-y-auto whitespace-pre">
                              {item.newSolidity || item.oldSolidity || "No code generated."}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block font-sans">
                              Reverse-Engineered Evaluation
                            </span>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-semibold">
                              {item.newLogic || item.oldLogic || "Unchanged instruction pathways."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Click interaction */}
                      <div className="shrink-0 pt-2 flex self-end md:self-start">
                        <button
                          onClick={() => handleFuncClick(activeName.split("(")[0])}
                          className="py-1.5 px-3 rounded-lg text-[10px] font-black border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                          Inspect matching logic lines
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface BytecodeDecompilerProps {
  activeList: TokenList | null;
  defaultSelectedToken?: TokenInfo | null;
}

export default function BytecodeDecompiler({
  activeList,
  defaultSelectedToken
}: BytecodeDecompilerProps) {
  const [viewMode, setViewMode] = useState<"single" | "dual">("single");
  const [dualSubMode, setDualSubMode] = useState<"side-by-side" | "interactive-diff">("side-by-side");

  // Selection state for Contract 1
  const [token1, setToken1] = useState<TokenInfo | null>(null);
  const [useCustom1, setUseCustom1] = useState(false);
  const [custAddress1, setCustAddress1] = useState("");
  const [custSymbol1, setCustSymbol1] = useState("");
  const [custName1, setCustName1] = useState("");
  const [custChainId1, setCustChainId1] = useState(1);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);

  // Selection state for Contract 2
  const [token2, setToken2] = useState<TokenInfo | null>(null);
  const [useCustom2, setUseCustom2] = useState(false);
  const [custAddress2, setCustAddress2] = useState("");
  const [custSymbol2, setCustSymbol2] = useState("");
  const [custName2, setCustName2] = useState("");
  const [custChainId2, setCustChainId2] = useState(1);
  const [searchTerm2, setSearchTerm2] = useState("");
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);

  // Decompilation results
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [error1, setError1] = useState<string | null>(null);
  const [error2, setError2] = useState<string | null>(null);
  const [decompileData1, setDecompileData1] = useState<DecompileResponse | null>(null);
  const [decompileData2, setDecompileData2] = useState<DecompileResponse | null>(null);

  // Copy status
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const tokens = activeList?.tokens || [];

  const filteredTokens1 = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm1.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchTerm1.toLowerCase()) ||
      t.address.toLowerCase().includes(searchTerm1.toLowerCase())
  );

  const filteredTokens2 = tokens.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm2.toLowerCase()) ||
      t.symbol.toLowerCase().includes(searchTerm2.toLowerCase()) ||
      t.address.toLowerCase().includes(searchTerm2.toLowerCase())
  );

  // Initialize selected tokens
  useEffect(() => {
    if (tokens.length >= 2) {
      setToken1(defaultSelectedToken || tokens[0]);
      const otherToken =
        tokens.find((t) => t.address !== (defaultSelectedToken?.address || tokens[0].address)) || tokens[1];
      setToken2(otherToken);
    } else if (tokens.length === 1) {
      setToken1(tokens[0]);
      setToken2(tokens[0]);
    } else {
      setToken1({
        symbol: "USDT",
        name: "Tether USD",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        chainId: 1
      });
      setToken2({
        symbol: "USDC",
        name: "USD Coin",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        chainId: 1
      });
    }
  }, [activeList, defaultSelectedToken]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleDecompile = async (idx: 1 | 2) => {
    const isFirst = idx === 1;
    const isCustom = isFirst ? useCustom1 : useCustom2;
    const token = isFirst ? token1 : token2;
    const custSymbol = isFirst ? custSymbol1 : custSymbol2;
    const custName = isFirst ? custName1 : custName2;
    const custAddress = isFirst ? custAddress1 : custAddress2;
    const custChainId = isFirst ? custChainId1 : custChainId2;

    const setLoading = isFirst ? setLoading1 : setLoading2;
    const setError = isFirst ? setError1 : setError2;
    const setDecompileData = isFirst ? setDecompileData1 : setDecompileData2;

    setLoading(true);
    setError(null);

    const payload = {
      symbol: isCustom ? custSymbol.toUpperCase() || "CST" : token?.symbol || "CST",
      name: isCustom ? custName || custSymbol || "Custom Contract" : token?.name || "Contract",
      address: isCustom ? custAddress || "0x..." : token?.address || "0x...",
      chainId: isCustom ? custChainId : token?.chainId || 1
    };

    try {
      const response = await fetch("/api/gemini/decompile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed with status ${response.status}`);
      }

      const data = await response.json();
      setDecompileData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during bytecode decompilation.");
    } finally {
      setLoading(false);
    }
  };

  // Run automatically on load of the active first/second token
  useEffect(() => {
    if (token1 || useCustom1) {
      handleDecompile(1);
    }
  }, [token1, useCustom1]);

  useEffect(() => {
    if (token2 || useCustom2) {
      handleDecompile(2);
    }
  }, [token2, useCustom2]);

  return (
    <div className="space-y-8 font-sans" id="bytecode-decompiler-pane">
      {/* Introduction and visual controls */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/20 text-indigo-300 font-extrabold uppercase tracking-widest text-[9px] px-2.5 py-1 rounded-full border border-indigo-400/20">
                EVM Reverse Engineering Engine
              </span>
              <span className="bg-rose-500/20 text-rose-300 font-extrabold uppercase tracking-widest text-[9px] px-2.5 py-1 rounded-full border border-rose-400/20">
                Solidity-like Pseudocode
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans sm:text-3xl">
              Decompiler & Bytecode Diff Panel
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Fetch low-level byte sequence data and use the Gemini 3.5 AI agent to decompile target token contracts, 
              instantiate storage slots, decode hash selectors, and compare internal function logic variations across distinct token versions.
            </p>
          </div>

          {/* Mode toggle */}
          <div className="bg-slate-800/80 p-1 rounded-2xl flex border border-slate-700 max-w-xs shrink-0 select-none">
            <button
              onClick={() => setViewMode("single")}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "single"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Single Contract
            </button>
            <button
              onClick={() => setViewMode("dual")}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === "dual"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Dual Compare
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Engine Layout Toggle */}
      {viewMode === "dual" && (
        <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-2xl mx-auto shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-2">
            Comparison Engine Layout Strategy
          </span>
          <div className="flex bg-slate-200/60 p-1 rounded-2xl border border-slate-300/40 select-none">
            <button
              onClick={() => setDualSubMode("side-by-side")}
              className={`py-1.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                dualSubMode === "side-by-side"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Side-by-Side
            </button>
            <button
              onClick={() => setDualSubMode("interactive-diff")}
              className={`py-1.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                dualSubMode === "interactive-diff"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-rose-300" />
              Interactive Intelligent Diff
            </button>
          </div>
        </div>
      )}

      {/* Main split workarea */}
      {viewMode === "dual" && dualSubMode === "interactive-diff" ? (
        decompileData1 && decompileData2 ? (
          <InteractiveDiffViewer data1={decompileData1} data2={decompileData2} />
        ) : (
          <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center shadow-xs space-y-4 max-w-md mx-auto my-12">
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-full text-rose-500 w-12 h-12 flex items-center justify-center mx-auto">
              <GitCompare className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Compare Panel Blocked
              </h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Both contract versions must be loaded and decompiled before the interactive diff audit module can execute.
              </p>
            </div>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* CONTRACT 1 PANEL */}
        <div className={`${viewMode === "single" ? "xl:col-span-12" : "xl:col-span-6"} space-y-6`}>
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600 font-mono text-xs font-black">
                  C1
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    TARGET CONTRACT A
                  </h3>
                  <h4 className="text-sm font-black text-slate-800">
                    {useCustom1
                      ? custName1 || custSymbol1 || "Custom Contract"
                      : token1?.name || "No token selected"}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseCustom1(!useCustom1)}
                  className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-600 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 px-2.5 py-1 rounded-lg transition"
                >
                  {useCustom1 ? "Select standard" : "Enter custom"}
                </button>
                <button
                  onClick={() => handleDecompile(1)}
                  disabled={loading1}
                  className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition disabled:opacity-50"
                  title="Force Reload Decompile"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading1 ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Selection inputs for Contract 1 */}
            {useCustom1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-208 border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Address
                  </label>
                  <input
                    type="text"
                    value={custAddress1}
                    onChange={(e) => setCustAddress1(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={custSymbol1}
                    onChange={(e) => setCustSymbol1(e.target.value)}
                    placeholder="USDC"
                    className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    type="text"
                    value={custName1}
                    onChange={(e) => setCustName1(e.target.value)}
                    placeholder="USD Coin"
                    className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Chain ID
                  </label>
                  <select
                    value={custChainId1}
                    onChange={(e) => setCustChainId1(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
                  >
                    {Object.values(CHAINS_MAP).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="relative">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                  Select predefined contract from token list
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <button
                      onClick={() => setIsDropdown1Open(!isDropdown1Open)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 text-left px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer focus:outline-none"
                    >
                      <span>
                        {token1 ? `${token1.name} (${token1.symbol}) - ${CHAINS_MAP[token1.chainId]?.name || `Chain ${token1.chainId}`}` : "Pick a token..."}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {isDropdown1Open && (
                      <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
                        <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2 px-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            placeholder="Filter contracts..."
                            value={searchTerm1}
                            onChange={(e) => setSearchTerm1(e.target.value)}
                            className="w-full bg-transparent focus:outline-none text-xs font-bold"
                          />
                        </div>
                        {filteredTokens1.length === 0 ? (
                          <div className="text-[11px] text-slate-400 text-center py-2">
                            No tokens found.
                          </div>
                        ) : (
                          filteredTokens1.map((t) => (
                            <button
                              key={t.address + t.chainId}
                              onClick={() => {
                                setToken1(t);
                                setIsDropdown1Open(false);
                                setSearchTerm1("");
                              }}
                              className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-indigo-50/50 flex flex-col gap-0.5 cursor-pointer ${
                                token1?.address === t.address && token1?.chainId === t.chainId
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-slate-700"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-extrabold">{t.name}</span>
                                <span className="font-mono text-[9px] text-slate-400">{t.symbol}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono font-medium block truncate">
                                {t.address}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ERROR HANDLERS */}
            {error1 && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-750 text-rose-750-bad text-rose-800 font-medium">
                  {error1}
                </p>
              </div>
            )}

            {/* RESULTS VIEW */}
            {loading1 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 font-bold font-mono">
                  Decompiling target EVM byte sequence...
                </p>
              </div>
            ) : decompileData1 ? (
              <div className="space-y-6">
                
                {/* Meta Summary Info */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black text-indigo-950 font-sans">
                    <Info className="w-4 h-4 text-indigo-500" />
                    DECOMPILER INSIGHTS
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {decompileData1.summary}
                  </p>
                </div>

                {/* Grid Split: Opcodes & Solidity Pseudocode */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* EVM Assembly column */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                        <Terminal className="w-3.5 h-3.5" />
                        Simulated EVM Opcodes
                      </span>
                      <button
                        onClick={() => handleCopyText(decompileData1.opcodes, "opcodes1")}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLabel === "opcodes1" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 whitespace-pre border border-slate-900 shadow-inner">
                      {decompileData1.opcodes}
                    </div>
                  </div>

                  {/* Solidity-like Pseudocode Codeblock */}
                  <div className="lg:col-span-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5" />
                        Reconstructed Solidity Pseudocode
                      </span>
                      <button
                        onClick={() => handleCopyText(decompileData1.pseudocode, "pseudocode1")}
                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedLabel === "pseudocode1" ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96 whitespace-pre leading-relaxed shadow-lg">
                      {decompileData1.pseudocode}
                    </div>
                  </div>

                </div>

                {/* Storage Slot Layout Mapping */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans block">
                    Discovered Storage Layout Map (State)
                  </span>
                  <div className="overflow-x-auto border border-slate-200/60 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/60 font-black">
                          <th className="py-2.5 px-4 font-mono">SLOT KEY</th>
                          <th className="py-2.5 px-4">VARIABLE NAME</th>
                          <th className="py-2.5 px-4">DATA TYPE</th>
                          <th className="py-2.5 px-3">EVM USE & MUTABILITY DESCRIPTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {decompileData1.storageSlots.map((item, id) => (
                          <tr key={id} className="hover:bg-slate-50/50 font-medium">
                            <td className="py-2.5 px-4 font-mono text-indigo-700">{item.slot}</td>
                            <td className="py-2.5 px-4 font-semibold text-slate-800">{item.variableName}</td>
                            <td className="py-2.5 px-4 font-mono text-[10px] bg-slate-50 rounded px-1.5 py-0.5 inline-block text-emerald-700 border border-slate-200/30 font-bold mt-1.5">
                              {item.type}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 leading-normal text-[11px]">{item.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Disassembled functions & signature hashes */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans block">
                    Functional Signature Hashes / Decompiled Call Tree
                  </span>
                  <div className="space-y-3">
                    {decompileData1.functions.map((func, id) => (
                      <div key={id} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <Binary className="w-3.5 h-3.5 text-indigo-600" />
                            <span className="text-xs font-black text-slate-900 font-mono">
                              {func.name}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono px-2 py-0.5 leading-none rounded bg-indigo-900 text-indigo-100 font-black border border-indigo-950">
                            SIGNATURE: {func.signature}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-2.5 bg-slate-900 text-teal-400 font-mono text-[10px] rounded-lg border border-slate-800 sm:max-h-24 overflow-y-auto">
                            {func.solidityEquivalent}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
                            <b className="text-slate-700 block text-[9.5px] uppercase tracking-wider font-sans">
                              Assembly Execution Flow:
                            </b>
                            {func.logicOverview}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs font-bold">
                Please pick a token contract target above to load decompiled results.
              </div>
            )}
          </div>
        </div>

        {/* CONTRACT 2 PANEL (Rendered only on dual compare mode) */}
        {viewMode === "dual" && (
          <div className="xl:col-span-6 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 font-mono text-xs font-black">
                    C2
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      TARGET CONTRACT B (VER 2 / COMPANION)
                    </h3>
                    <h4 className="text-sm font-black text-slate-800">
                      {useCustom2
                        ? custName2 || custSymbol2 || "Custom Contract"
                        : token2?.name || "No token selected"}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUseCustom2(!useCustom2)}
                    className="text-[10px] font-extrabold uppercase tracking-wide text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-2.5 py-1 rounded-lg transition"
                  >
                    {useCustom2 ? "Select standard" : "Enter custom"}
                  </button>
                  <button
                    onClick={() => handleDecompile(2)}
                    disabled={loading2}
                    className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition disabled:opacity-50"
                    title="Force Reload Decompile"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading2 ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Selection inputs for Contract 2 */}
              {useCustom2 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Address
                    </label>
                    <input
                      type="text"
                      value={custAddress2}
                      onChange={(e) => setCustAddress2(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Symbol
                    </label>
                    <input
                      type="text"
                      value={custSymbol2}
                      onChange={(e) => setCustSymbol2(e.target.value)}
                      placeholder="BABYDOGE"
                      className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded-xl px-3 py-1.5 text-xs font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      value={custName2}
                      onChange={(e) => setCustName2(e.target.value)}
                      placeholder="Baby Doge Coin"
                      className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded-xl px-3 py-1.5 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      Chain ID
                    </label>
                    <select
                      value={custChainId2}
                      onChange={(e) => setCustChainId2(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer"
                    >
                      {Object.values(CHAINS_MAP).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block mb-1">
                    Select predefined contract from token list
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <button
                        onClick={() => setIsDropdown2Open(!isDropdown2Open)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 text-left px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-between cursor-pointer focus:outline-none"
                      >
                        <span>
                          {token2 ? `${token2.name} (${token2.symbol}) - ${CHAINS_MAP[token2.chainId]?.name || `Chain ${token2.chainId}`}` : "Pick a token..."}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>

                      {isDropdown2Open && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-60 overflow-y-auto p-2 space-y-1">
                          <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2 px-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              placeholder="Filter contracts..."
                              value={searchTerm2}
                              onChange={(e) => setSearchTerm2(e.target.value)}
                              className="w-full bg-transparent focus:outline-none text-xs font-bold"
                            />
                          </div>
                          {filteredTokens2.length === 0 ? (
                            <div className="text-[11px] text-slate-400 text-center py-2">
                              No tokens found.
                            </div>
                          ) : (
                            filteredTokens2.map((t) => (
                              <button
                                key={t.address + t.chainId}
                                onClick={() => {
                                  setToken2(t);
                                  setIsDropdown2Open(false);
                                  setSearchTerm2("");
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-xl hover:bg-rose-50/50 flex flex-col gap-0.5 cursor-pointer ${
                                  token2?.address === t.address && token2?.chainId === t.chainId
                                    ? "bg-rose-50 text-rose-700"
                                    : "text-slate-700"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold">{t.name}</span>
                                  <span className="font-mono text-[9px] text-slate-400">{t.symbol}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono font-medium block truncate">
                                  {t.address}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR HANDLERS */}
              {error2 && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-rose-800 font-medium">
                    {error2}
                  </p>
                </div>
              )}

              {/* RESULTS VIEW */}
              {loading2 ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <RefreshCw className="w-8 h-8 text-rose-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-bold font-mono">
                    Decompiling target EVM byte sequence...
                  </p>
                </div>
              ) : decompileData2 ? (
                <div className="space-y-6">
                  
                  {/* Meta Summary Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-950 font-sans">
                      <Info className="w-4 h-4 text-rose-500" />
                      DECOMPILER INSIGHTS
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {decompileData2.summary}
                    </p>
                  </div>

                  {/* Grid Split: Opcodes & Solidity Pseudocode */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* EVM Assembly column */}
                    <div className="lg:col-span-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                          <Terminal className="w-3.5 h-3.5" />
                          Simulated EVM Opcodes
                        </span>
                        <button
                          onClick={() => handleCopyText(decompileData2.opcodes, "opcodes2")}
                          className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedLabel === "opcodes2" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-96 whitespace-pre border border-slate-900 shadow-inner">
                        {decompileData2.opcodes}
                      </div>
                    </div>

                    {/* Solidity-like Pseudocode Codeblock */}
                    <div className="lg:col-span-7 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans flex items-center gap-1">
                          <FileCode className="w-3.5 h-3.5" />
                          Reconstructed Solidity Pseudocode
                        </span>
                        <button
                          onClick={() => handleCopyText(decompileData2.pseudocode, "pseudocode2")}
                          className="text-[10px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedLabel === "pseudocode2" ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 text-slate-100 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-96 whitespace-pre leading-relaxed shadow-lg">
                        {decompileData2.pseudocode}
                      </div>
                    </div>

                  </div>

                  {/* Storage Slot Layout Mapping */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans block font-sans">
                      Discovered Storage Layout Map (State B)
                    </span>
                    <div className="overflow-x-auto border border-slate-200/60 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-400 border-b border-slate-200/60 font-black">
                            <th className="py-2.5 px-4 font-mono">SLOT KEY</th>
                            <th className="py-2.5 px-4">VARIABLE NAME</th>
                            <th className="py-2.5 px-4">DATA TYPE</th>
                            <th className="py-2.5 px-3">EVM USE & MUTABILITY DESCRIPTION</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {decompileData2.storageSlots.map((item, id) => (
                            <tr key={id} className="hover:bg-slate-50/50 font-medium">
                              <td className="py-2.5 px-4 font-mono text-emerald-705 text-indigo-700">{item.slot}</td>
                              <td className="py-2.5 px-4 font-semibold text-slate-800">{item.variableName}</td>
                              <td className="py-2.5 px-4 font-mono text-[10px] bg-slate-50 rounded px-1.5 py-0.5 inline-block text-emerald-700 border border-slate-200/30 font-bold mt-1.5 align-middle">
                                {item.type}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500 leading-normal text-[11px]">{item.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Disassembled functions & signature hashes */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-sans block">
                      Functional Signature Hashes / Decompiled Call Tree
                    </span>
                    <div className="space-y-3">
                      {decompileData2.functions.map((func, id) => (
                        <div key={id} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5">
                              <Binary className="w-3.5 h-3.5 text-rose-600" />
                              <span className="text-xs font-black text-slate-900 font-mono">
                                {func.name}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 leading-none rounded bg-slate-900 text-slate-100 font-black border border-slate-950">
                              SIGNATURE: {func.signature}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-2.5 bg-slate-900 text-teal-400 font-mono text-[10px] rounded-lg border border-slate-800 sm:max-h-24 overflow-y-auto">
                              {func.solidityEquivalent}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
                              <b className="text-slate-700 block text-[9.5px] uppercase tracking-wider font-sans">
                                Assembly Execution Flow:
                              </b>
                              {func.logicOverview}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-bold">
                  Please pick a token contract target above to load decompiled results.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      )}
    </div>
  );
}
