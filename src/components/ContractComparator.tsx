import React, { useState, useEffect } from "react";
import {
  GitCompare,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  Code,
  Binary,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Search,
  Split
} from "lucide-react";
import { TokenList, TokenInfo, ContractCompareResponse } from "../types";
import { CHAINS_MAP } from "../data/curatedLists";

interface ContractComparatorProps {
  activeList: TokenList | null;
  defaultSelectedToken?: TokenInfo | null;
}

export default function ContractComparator({
  activeList,
  defaultSelectedToken
}: ContractComparatorProps) {
  // Main state variables
  const [token1, setToken1] = useState<TokenInfo | null>(null);
  const [token2, setToken2] = useState<TokenInfo | null>(null);

  // Search through available tokens in list
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);

  // Custom manual contract overrides
  const [useCustom1, setUseCustom1] = useState(false);
  const [custAddress1, setCustAddress1] = useState("");
  const [custSymbol1, setCustSymbol1] = useState("");
  const [custName1, setCustName1] = useState("");
  const [custChainId1, setCustChainId1] = useState(1);

  const [useCustom2, setUseCustom2] = useState(false);
  const [custAddress2, setCustAddress2] = useState("");
  const [custSymbol2, setCustSymbol2] = useState("");
  const [custName2, setCustName2] = useState("");
  const [custChainId2, setCustChainId2] = useState(1);

  // Result & loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<ContractCompareResponse | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Helper lists from active lists
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
      // Attempt to pick a different second token
      const otherToken = tokens.find((t) => t.address !== (defaultSelectedToken?.address || tokens[0].address)) || tokens[1];
      setToken2(otherToken);
    } else if (tokens.length === 1) {
      setToken1(tokens[0]);
      setToken2(tokens[0]);
    } else {
      // Fallback fallback defaults
      setToken1({
        symbol: "SAFEMOON",
        name: "SafeMoon (Old Reflection)",
        address: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3",
        chainId: 56
      });
      setToken2({
        symbol: "BABYDOGE",
        name: "Baby Doge Coin (Reflection Fork)",
        address: "0xc748673057861a797275CD8A068AbB95AD906e12",
        chainId: 56
      });
    }
  }, [activeList, defaultSelectedToken]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const executeComparison = async () => {
    setLoading(true);
    setError(null);
    setCompareData(null);

    // Build payload structures
    let t1Payload = {
      symbol: useCustom1 ? custSymbol1.toUpperCase() || "T1" : token1?.symbol || "T1",
      name: useCustom1 ? custName1 || custSymbol1 || "Custom Token 1" : token1?.name || "Token 1",
      address: useCustom1 ? custAddress1 || "0x0001" : token1?.address || "0x0001",
      chainId: useCustom1 ? custChainId1 : token1?.chainId || 1,
      chainName: useCustom1 ? CHAINS_MAP[custChainId1]?.name : CHAINS_MAP[token1?.chainId || 1]?.name
    };

    let t2Payload = {
      symbol: useCustom2 ? custSymbol2.toUpperCase() || "T2" : token2?.symbol || "T2",
      name: useCustom2 ? custName2 || custSymbol2 || "Custom Token 2" : token2?.name || "Token 2",
      address: useCustom2 ? custAddress2 || "0x0002" : token2?.address || "0x0002",
      chainId: useCustom2 ? custChainId2 : token2?.chainId || 1,
      chainName: useCustom2 ? CHAINS_MAP[custChainId2]?.name : CHAINS_MAP[token2?.chainId || 1]?.name
    };

    try {
      const response = await fetch("/api/gemini/compare-contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token1: t1Payload,
          token2: t2Payload
        })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || `Server HTTP response status ${response.status}`);
      }

      const rawData = await response.json();
      setCompareData(rawData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to finalize contract sequence differential analysis");
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when token pairs details swap initially
  useEffect(() => {
    if ((token1 || useCustom1) && (token2 || useCustom2)) {
      executeComparison();
    }
  }, [token1, token2]);

  return (
    <div className="space-y-6" id="dual-genome-comparator-panel">
      {/* Controls & Selection Grid Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
            <GitCompare className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-sans uppercase tracking-wider">
              Sequence & Bytecode Comparer
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">
              Select any two smart contracts to cross-evaluate changes, similarity scores, and specific instructions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Token A Picker Column */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-indigo-700 tracking-wider">
                Contract Source A (Original)
              </span>
              <button
                onClick={() => setUseCustom1(!useCustom1)}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                {useCustom1 ? "Use List Dropdown" : "Use Custom Address"}
              </button>
            </div>

            {useCustom1 ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste Address (0x...)"
                  value={custAddress1}
                  onChange={(e) => setCustAddress1(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={custSymbol1}
                    onChange={(e) => setCustSymbol1(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={custName1}
                    onChange={(e) => setCustName1(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder={token1 ? `${token1.symbol} (${token1.name})` : "Search list tokens..."}
                  value={searchTerm1}
                  onChange={(e) => {
                    setSearchTerm1(e.target.value);
                    setIsDropdown1Open(true);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-500"
                  onFocus={() => setIsDropdown1Open(true)}
                />
                {isDropdown1Open && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 divide-y divide-slate-50">
                    {filteredTokens1.map((t) => (
                      <button
                        key={t.address}
                        onClick={() => {
                          setToken1(t);
                          setSearchTerm1("");
                          setIsDropdown1Open(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex justify-between"
                      >
                        <span className="font-bold text-slate-900">{t.symbol} &bull; {t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.address.substring(0, 6)}...</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {token1 && !useCustom1 && (
              <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>Address A: {token1.address}</span>
                <span className="bg-slate-200/65 px-1.5 py-0.5 rounded">Chain {token1.chainId}</span>
              </div>
            )}
          </div>

          {/* Token B Picker Column */}
          <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase text-emerald-700 tracking-wider">
                Contract Source B (Derivative Fork)
              </span>
              <button
                onClick={() => setUseCustom2(!useCustom2)}
                className="text-[10px] text-indigo-600 font-bold hover:underline"
              >
                {useCustom2 ? "Use List Dropdown" : "Use Custom Address"}
              </button>
            </div>

            {useCustom2 ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Paste Address (0x...)"
                  value={custAddress2}
                  onChange={(e) => setCustAddress2(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Symbol"
                    value={custSymbol2}
                    onChange={(e) => setCustSymbol2(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Name"
                    value={custName2}
                    onChange={(e) => setCustName2(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder={token2 ? `${token2.symbol} (${token2.name})` : "Search list tokens..."}
                  value={searchTerm2}
                  onChange={(e) => {
                    setSearchTerm2(e.target.value);
                    setIsDropdown2Open(true);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-905 text-slate-900 focus:outline-none placeholder:text-slate-500 font-sans"
                  onFocus={() => setIsDropdown2Open(true)}
                />
                {isDropdown2Open && (
                  <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg py-1 divide-y divide-slate-50">
                    {filteredTokens2.map((t) => (
                      <button
                        key={t.address}
                        onClick={() => {
                          setToken2(t);
                          setSearchTerm2("");
                          setIsDropdown2Open(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition flex justify-between"
                      >
                        <span className="font-bold text-slate-900">{t.symbol} &bull; {t.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.address.substring(0, 6)}...</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {token2 && !useCustom2 && (
              <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between font-sans">
                <span>Address B: {token2.address}</span>
                <span className="bg-slate-200/65 px-1.5 py-0.5 rounded">Chain {token2.chainId}</span>
              </div>
            )}
          </div>

        </div>

        <button
          onClick={executeComparison}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-sans text-xs font-black rounded-2xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
          ) : (
            <GitCompare className="w-4 h-4 text-rose-505 text-rose-500" />
          )}
          Run Multi-layered Genome Differential Scan
        </button>
      </div>

      {/* Main Differential Display screen */}
      {loading ? (
        <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center space-y-4 shadow-xs animate-pulse">
          <div className="p-3 bg-rose-50 rounded-full inline-block">
            <Layers className="w-8 h-8 text-rose-600 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Comparing Smart Contracts Genomes...</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
              Executing side-by-side AST parsing, generating line diff matrices, locating specific instruction mutations, and verifying standard solidity divergence parameters.
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold">Comparative Engine Error:</span> {error}
          </div>
        </div>
      ) : compareData ? (
        <div className="space-y-6 animate-in fade-in duration-250">
          
          {/* Similarity & Summary Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-3 text-center md:border-r border-slate-100 md:pr-6 space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                Byte-Gene Similarity ID
              </span>
              <div className="inline-flex items-center justify-center p-4 bg-rose-50/50 rounded-full">
                <span className="text-3xl font-black text-rose-600 font-mono">
                  {compareData.similarityScore}%
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans leading-none">
                {compareData.similarityScore > 85 ? "High Architectural Match" : compareData.similarityScore > 50 ? "Medium Template Fork" : "Independent Base/Abstract"}
              </p>
            </div>
            
            <div className="md:col-span-9 space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono leading-none">
                  {compareData.token1Name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-mono leading-none">
                  {compareData.token2Name}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase text-slate-405 text-slate-400 font-sans block mb-1">
                  Evolution Synthesis Verdict
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                  {compareData.generalComparisonSummary}
                </p>
              </div>
            </div>
          </div>

          {/* Source Code Line-By-Line Diff Visualizers */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <FileCode className="w-4 h-4 text-rose-600" />
              Solid Source Code Diff (Highlighted Changes)
            </h4>

            {compareData.sourceCodeDiffs.map((diffFile, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                
                {/* File overview header */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-slate-900 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      📄 {diffFile.fileName}
                    </span>
                    <span className="text-slate-400">&mdash;</span>
                    <span className="text-slate-500 font-sans font-medium">
                      Class: <strong className="text-slate-800 font-bold">{diffFile.className}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="bg-rose-100/70 border border-rose-200/50 text-rose-700 px-1.5 py-0.5 rounded">
                      File Match: {diffFile.similarityPercentage}%
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 text-xs text-slate-600 border-b border-slate-100/60 leading-relaxed font-sans font-medium">
                  <strong>Genetic Mutation Reason: </strong>
                  {diffFile.explanation}
                </div>

                {/* Line diff container with proper colors */}
                <div className="bg-slate-950 font-mono text-slate-300 text-xs overflow-x-auto leading-normal">
                  <table className="w-full border-collapse">
                    <tbody>
                      {diffFile.diffLines.map((line, lIdx) => {
                        const isAdded = line.type === "added";
                        const isRemoved = line.type === "removed";
                        
                        let lineBg = "hover:bg-slate-900/60";
                        let codeColor = "text-slate-100";
                        let marker = "  ";

                        if (isAdded) {
                          lineBg = "bg-emerald-950/55 hover:bg-emerald-900/40 text-emerald-300";
                          codeColor = "text-emerald-300 font-semibold";
                          marker = "+ ";
                        } else if (isRemoved) {
                          lineBg = "bg-rose-950/55 hover:bg-rose-900/40 text-rose-300";
                          codeColor = "text-rose-300 font-semibold line-through";
                          marker = "- ";
                        }

                        return (
                          <tr key={lIdx} className={`${lineBg} transition`}>
                            {/* Line number */}
                            <td className="w-12 text-right pr-4 text-slate-600 select-none border-r border-slate-800/50 py-1 font-mono text-[10px]">
                              {line.lineNumber}
                            </td>
                            {/* Marker + / - */}
                            <td className="w-6 text-center select-none font-bold py-1 text-slate-500 font-sans text-xs">
                              {marker}
                            </td>
                            {/* Raw line code */}
                            <td className={`pl-2 py-1 select-text leading-relaxed ${codeColor} whitespace-pre`}>
                              {line.code}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            ))}
          </div>

          {/* Compiled EVM Bytecode Diff View */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Binary className="w-4 h-4 text-rose-600" />
              Compiled EVM Bytecode & Opcodes Divergence Matrix
            </h4>

            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                  EVM executable bytecode comparison at specific memory offsets. Yellow rows indicate divergence slots where Solidity compilers produced customized binary outputs because of logic mutations or optimized compiler architectures.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10px] uppercase font-sans font-bold text-slate-400">
                      <th className="px-5 py-3">Hex Offset</th>
                      <th className="px-5 py-3">{compareData.token1Name} Bytecode</th>
                      <th className="px-5 py-3">{compareData.token2Name} Bytecode</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Assembly Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {compareData.bytecodeSegments.map((seg, sIdx) => {
                      const isMismatch = seg.type === "mismatch";
                      const rowBg = isMismatch ? "bg-amber-50/50 hover:bg-amber-100/40" : "hover:bg-slate-50/50";

                      return (
                        <tr key={sIdx} className={`${rowBg} transition`}>
                          <td className="px-5 py-3 font-semibold text-slate-805 text-slate-800">{seg.offset}</td>
                          <td className="px-5 py-3 text-slate-500 break-all">{seg.token1Bytecode}</td>
                          <td className="px-5 py-3 text-slate-500 break-all">{seg.token2Bytecode}</td>
                          <td className="px-5 py-3">
                            {isMismatch ? (
                              <span className="bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                DIVERGENCE
                              </span>
                            ) : (
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                MATCH
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-slate-700 font-sans text-xs italic font-medium">
                            {seg.instructionInterpretation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Evolutionary Concluding Verdict */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-slate-200 rounded-3xl border border-indigo-900 shadow-md space-y-2">
            <h5 className="text-[10px] font-extrabold uppercase text-indigo-400 font-sans flex items-center gap-1 tracking-wider">
              <ShieldCheck className="w-4 h-4 text-rose-500 animate-pulse" />
              Auditor Security Recommendations & Concluding Mutation Verdict
            </h5>
            <p className="text-xs leading-relaxed font-sans font-medium text-slate-300">
              {compareData.evolutionaryVerdict}
            </p>
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-16 rounded-3xl text-center text-slate-400 space-y-3 shadow-xs">
          <Split className="w-8 h-8 text-slate-350 mx-auto" />
          <p className="text-xs font-medium">Select a second contract and initiate the Multi-layered scan to visualize exact code line changes.</p>
        </div>
      )}

    </div>
  );
}
