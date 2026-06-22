import React, { useState, useEffect } from "react";
import {
  GitBranch,
  Dna,
  Binary,
  Code,
  Sparkles,
  ChevronRight,
  Cpu,
  Coins,
  Search,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  History,
  FileCode,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  GitCompare
} from "lucide-react";
import { TokenList, TokenInfo, AncestorTraceResponse } from "../types";
import { CHAINS_MAP } from "../data/curatedLists";
import D3HeritageTree from "./D3HeritageTree";
import ContractComparator from "./ContractComparator";
import ChronologicalDeploymentTimeline from "./ChronologicalDeploymentTimeline";
import BytecodeDecompiler from "./BytecodeDecompiler";

interface AncestorTracerProps {
  activeList: TokenList | null;
  onExploreToken?: (token: TokenInfo) => void;
}

// Interactive Prepopulated Demos for perfect instantly working UX
const DEMO_PRESETS = [
  {
    name: "SafeMoon (Reflection Token Fork)",
    symbol: "SAFEMOON",
    address: "0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3",
    chainId: 56,
    chainName: "BNB Smart Chain"
  },
  {
    name: "Aave Lending Pool (Proxy Contract)",
    symbol: "aUSDC",
    address: "0xBcca60bB61934080951369a648Fb03DF4F96263C",
    chainId: 1,
    chainName: "Ethereum"
  },
  {
    name: "PancakeSwap Token (Sushi/Uni Fork)",
    symbol: "CAKE",
    address: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    chainId: 56,
    chainName: "BNB Smart Chain"
  }
];

export default function AncestorTracer({ activeList, onExploreToken }: AncestorTracerProps) {
  // Config States
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [customAddress, setCustomAddress] = useState("");
  const [customSymbol, setCustomSymbol] = useState("");
  const [customName, setCustomName] = useState("");
  const [customChainId, setCustomChainId] = useState<number>(1);

  // Search through available tokens in activeList
  const [tokenSearchTerm, setTokenSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"genealogy" | "compare" | "decompiler">("genealogy");
  const [timelineDisplayMode, setTimelineDisplayMode] = useState<"chronological" | "stages">("chronological");

  // Result States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [traceData, setTraceData] = useState<AncestorTraceResponse | null>(null);

  // Copy helpers
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Get tokens from active list
  const listTokens = activeList?.tokens || [];
  const filteredListTokens = listTokens.filter(
    (t) =>
      t.name.toLowerCase().includes(tokenSearchTerm.toLowerCase()) ||
      t.symbol.toLowerCase().includes(tokenSearchTerm.toLowerCase()) ||
      t.address.toLowerCase().includes(tokenSearchTerm.toLowerCase())
  );

  // Trace implementation
  const runTrace = async (token: { address: string; symbol: string; name: string; chainId: number }) => {
    setLoading(true);
    setError(null);
    setTraceData(null);

    const chainObject = CHAINS_MAP[token.chainId];
    const chainName = chainObject ? chainObject.name : `Chain ${token.chainId}`;

    try {
      const response = await fetch("/api/gemini/trace-ancestor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          chainId: token.chainId,
          chainName: chainName
        })
      });

      if (!response.ok) {
        const errPayload = await response.json().catch(() => ({}));
        throw new Error(errPayload.error || `Server returned HTTP status ${response.status}`);
      }

      const rawData = await response.json();
      setTraceData(rawData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to conduct contract heritage research");
    } finally {
      setLoading(false);
    }
  };

  // Handles starting a trace from curated dropdown or presets
  const handleSelectPreload = (token: TokenInfo) => {
    setSelectedToken(token);
    setCustomAddress(token.address);
    setCustomSymbol(token.symbol);
    setCustomName(token.name);
    setCustomChainId(token.chainId);
    setIsDropdownOpen(false);
    runTrace(token);
  };

  const handleRunCustom = () => {
    if (!customSymbol.trim()) {
      setError("Please specify a token symbol first.");
      return;
    }
    const tokenObj = {
      address: customAddress.trim() || "0x0000000000000000000000000000000000000000",
      symbol: customSymbol.trim().toUpperCase(),
      name: customName.trim() || customSymbol.trim() + " Contract",
      chainId: customChainId
    };
    runTrace(tokenObj);
  };

  // Automatically load the first preset or selected list token on page entrance
  useEffect(() => {
    if (listTokens.length > 0) {
      const firstToken = listTokens[0];
      setSelectedToken(firstToken);
      setCustomAddress(firstToken.address);
      setCustomSymbol(firstToken.symbol);
      setCustomName(firstToken.name);
      setCustomChainId(firstToken.chainId);
      runTrace(firstToken);
    } else {
      // Load first demo preset
      const demo = DEMO_PRESETS[0];
      setCustomAddress(demo.address);
      setCustomSymbol(demo.symbol);
      setCustomName(demo.name);
      setCustomChainId(demo.chainId);
      runTrace(demo);
    }
  }, [activeList]);

  // Find other tokens in the list likely sharing this same ancestor template/archetype
  const sameArchetypeTokens = React.useMemo(() => {
    if (!traceData || !activeList) return [];
    const keywords = [
      "openzeppelin",
      "uniswap",
      "erc20",
      "safemoon",
      "pancake",
      "proxy",
      "lending",
      "aave",
      "gnosis",
      "standard"
    ];
    const ancestorLower = traceData.ancestorName.toLowerCase();
    const activeKeywords = keywords.filter((kw) => ancestorLower.includes(kw));

    if (activeKeywords.length === 0) return [];

    // Filter active list tokens except currently scoped one
    return listTokens.filter((token) => {
      if (token.address.toLowerCase() === customAddress.toLowerCase()) return false;
      const nameLower = token.name.toLowerCase();
      const symbolLower = token.symbol.toLowerCase();

      // Check for overlapping tags / extensions or keywords
      return activeKeywords.some((kw) => nameLower.includes(kw) || symbolLower.includes(kw));
    });
  }, [traceData, activeList, customAddress]);

  return (
    <div className="space-y-8 font-sans" id="ancestor-lineage-tracer-section">
      {/* Intro & Dashboard Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-indigo-900">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Dna className="w-96 h-96 animate-pulse" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-505 bg-indigo-600/30 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            AI Smart Contract Historian
          </div>
          <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-white leading-tight">
            Smart Contract Ancestor Lineage (找祖宗 / 找爸爸)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            Analyze the source code evolution of DeFi contracts. Trace custom implementations back to their core base standards (like OpenZeppelin template drafts, Uniswap forks, proxy contracts, or SafeMoon reflection models). Study divergence, mutations, and audited logic mutations over generations.
          </p>
        </div>
      </div>

      {/* Interactive Feature Segment Toggle */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("genealogy")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition relative ${
            activeTab === "genealogy"
              ? "border-indigo-600 text-indigo-700 font-extrabold"
              : "border-transparent text-slate-400 hover:text-slate-750 hover:text-slate-700"
          }`}
          id="toggle-genealogy-tab"
        >
          <Dna className="w-4 h-4 text-indigo-500" />
          Archetype Genealogy & History
        </button>
        <button
          onClick={() => setActiveTab("compare")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition relative ${
            activeTab === "compare"
              ? "border-rose-600 text-rose-700 font-extrabold"
              : "border-transparent text-slate-400 hover:text-rose-500"
          }`}
          id="toggle-compare-tab"
        >
          <GitCompare className="w-4 h-4 text-rose-500" />
          Multi-Token Genome & Code Diff
        </button>
        <button
          onClick={() => setActiveTab("decompiler")}
          className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-black uppercase tracking-wider border-b-2 transition relative ${
            activeTab === "decompiler"
              ? "border-emerald-600 text-emerald-750 font-extrabold"
              : "border-transparent text-slate-400 hover:text-emerald-500"
          }`}
          id="toggle-decompiler-tab"
        >
          <Binary className="w-4 h-4 text-emerald-500" />
          EVM Bytecode & Decompiler
        </button>
      </div>

      {activeTab === "genealogy" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="comparison-researcher-pane">
        {/* Left Side: Input selection parameters */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Binary className="w-4 h-4 text-indigo-650 text-indigo-600" />
              1. Choose Contract Target
            </h2>
            <p className="text-[11px] text-slate-500">
              Select an asset from your active token list, or analyze any custom contract network deployment.
            </p>
          </div>

          {/* Active list source dropdown */}
          <div className="space-y-4">
            {activeList ? (
              <div className="space-y-2 relative">
                <label className="text-[10px] font-bold uppercase text-slate-400 font-sans">
                  Active List Token: {activeList.name}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={tokenSearchTerm}
                    onChange={(e) => {
                      setTokenSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    placeholder={`Search ${listTokens.length} tokens...`}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 placeholder:text-slate-400"
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  {tokenSearchTerm && (
                    <button
                      onClick={() => {
                        setTokenSearchTerm("");
                        setIsDropdownOpen(false);
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-900"
                    >
                      &times;
                    </button>
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl py-1 divide-y divide-slate-100">
                    {filteredListTokens.length > 0 ? (
                      filteredListTokens.slice(0, 15).map((token) => (
                        <button
                          key={token.address}
                          onClick={() => handleSelectPreload(token)}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 transition flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{token.symbol}</span>{" "}
                            <span className="text-slate-400 text-[10px]">&mdash; {token.name}</span>
                          </div>
                          <span className="text-[9px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                            {token.address.substring(0, 6)}...{token.address.slice(-4)}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-400">No matching tokens found</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] text-indigo-700 font-sans">
                💡 <span className="font-bold">No active list loaded.</span> Navigate to "Explore Lists" first and choose a standard Token List to select items instantly here!
              </div>
            )}

            {/* Custom Manual fields */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                OR Paste Arbitrary Contract Details
              </span>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-700">Contract Address</label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-700">Symbol</label>
                  <input
                    type="text"
                    value={customSymbol}
                    placeholder="e.g. UNI"
                    onChange={(e) => setCustomSymbol(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-700">Name</label>
                  <input
                    type="text"
                    value={customName}
                    placeholder="e.g. Uniswap"
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-700 text-slate-600 block">Deploy Chain</label>
                <select
                  value={customChainId}
                  onChange={(e) => setCustomChainId(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {Object.entries(CHAINS_MAP).map(([id, info]) => (
                    <option key={id} value={id}>
                      {info.name} (Chain {id})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRunCustom}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Dna className="w-3.5 h-3.5" />
                )}
                Conduct Archetype Heritage Trace
              </button>
            </div>

            {/* Quick Presets Demo triggers */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
                Quick Historical Presets (Try These!)
              </span>
              <div className="grid grid-cols-1 gap-2">
                {DEMO_PRESETS.map((demo) => (
                  <button
                    key={demo.symbol}
                    onClick={() => {
                      setCustomAddress(demo.address);
                      setCustomSymbol(demo.symbol);
                      setCustomName(demo.name);
                      setCustomChainId(demo.chainId);
                      runTrace(demo);
                    }}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 hover:border-slate-350 rounded-xl transition flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900">{demo.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {demo.symbol} &bull; {demo.chainName}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Render Evolutionary Trees and Code comparisons */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-6 shadow-xs animate-pulse">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Dna className="w-12 h-12 text-indigo-650 text-indigo-600 animate-spin-slow" />
                <div className="absolute inset-0 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-sans font-extrabold text-slate-900">
                  Sequencing Smart Contract Genealogy Trace...
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Gemini is tracing parent abstract definitions, standard blueprints (OpenZeppelin compiler outputs, EIPs schemas), comparing deployment address byte-signatures, and rebuilding the evolutionary mutation tree.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-left space-y-4 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-rose-700 text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
                Ancestry Search Failed
              </div>
              <p className="text-xs text-rose-850 leading-relaxed font-medium">
                Could not automatically retrieve the smart contract archetype parameters: {error}. Traditional causes include server gateway rate bounds or temporary workspace environment issues.
              </p>
              <button
                onClick={handleRunCustom}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-705 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition"
              >
                <RefreshCw className="w-3 h-3" /> Retry Heritage Scan
              </button>
            </div>
          ) : traceData ? (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Ancestial Header card */}
              <div className="bg-white border border-slate-250 border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-sans font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Archetype Ancestor Identified
                    </span>
                    <h3 className="text-lg font-sans font-black text-slate-950 flex items-center gap-1.5 mt-1">
                      <History className="w-5 h-5 text-indigo-600" />
                      {traceData.ancestorName}
                    </h3>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-sans block text-right md:text-right">
                      Evolution Safety Rating
                    </span>
                    <span className="inline-block mt-1 px-3 py-1 text-xs font-black rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {traceData.reputationRating}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-4 bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col justify-between h-full space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">
                        Ancestor Address/ID
                      </span>
                      <div className="text-xs font-mono font-bold text-indigo-700 break-all mt-1 flex items-center justify-between bg-white px-2 py-1.5 rounded-lg border border-slate-200">
                        <span>
                          {traceData.ancestorAddress.startsWith("0x")
                            ? traceData.ancestorAddress.substring(0, 10) + "..."
                            : traceData.ancestorAddress}
                        </span>
                        <button
                          onClick={() => handleCopyText(traceData.ancestorAddress, "ancestor")}
                          className="hover:text-indigo-950"
                        >
                          {copiedText === "ancestor" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-8 space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {traceData.ancestorDescription}
                    </p>
                    <p className="text-xs text-slate-555 text-slate-500 italic bg-amber-50/50 border border-amber-100/60 p-2.5 rounded-xl font-sans font-medium">
                      &ldquo;{traceData.evolutionAnalysis}&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* D3.js Interactive Hierarchical Tree Visualization */}
              <D3HeritageTree
                traceData={traceData}
                sameArchetypeTokens={sameArchetypeTokens}
                selectedTokenSymbol={customSymbol}
              />

              {/* Interactive Selector for Timeline view */}
              <div className="flex bg-slate-100 p-1 rounded-2xl max-w-sm gap-1 select-none border border-slate-200/55">
                <button
                  onClick={() => setTimelineDisplayMode("chronological")}
                  className={`flex-1 py-1.5 px-3 text-center text-xs font-bold font-sans rounded-xl transition cursor-pointer ${
                    timelineDisplayMode === "chronological"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-950 text-slate-500"
                  }`}
                  id="btn-timeline-chronological"
                >
                  Chronological Timeline (Blocks)
                </button>
                <button
                  onClick={() => setTimelineDisplayMode("stages")}
                  className={`flex-1 py-1.5 px-3 text-center text-xs font-bold font-sans rounded-xl transition cursor-pointer ${
                    timelineDisplayMode === "stages"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-950 text-slate-500"
                  }`}
                  id="btn-timeline-stages"
                >
                  Evolution Stages View
                </button>
              </div>

              {timelineDisplayMode === "chronological" ? (
                <ChronologicalDeploymentTimeline
                  lineageSteps={traceData.lineageSteps}
                  tokenSymbol={customSymbol || selectedToken?.symbol || "TOKEN"}
                  tokenAddress={customAddress || selectedToken?.address}
                  chainId={customChainId || selectedToken?.chainId}
                />
              ) : (
                /* Connected Generation genealogy SVG pipeline representation */
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest leading-3 flex items-center gap-1.5 font-sans">
                    <GitBranch className="w-4 h-4 text-indigo-650 text-indigo-600" />
                    Smart Contract Fork Timeline (Evolution Stages)
                  </h3>

                  <div className="relative pl-8 border-l-2 border-indigo-100 space-y-6 py-2 ml-4">
                    {traceData.lineageSteps.map((step, idx) => {
                      const isRoot = step.generation === 0;
                      const isLeaf = idx === traceData.lineageSteps.length - 1;

                      return (
                        <div key={idx} className="relative z-10 space-y-2">
                          {/* Dot representation and connector badge */}
                          <div className="absolute -left-[41px] top-1.5 w-6 h-6 bg-white border-2 border-indigo-600 text-indigo-600 font-bold text-[10px] flex items-center justify-center rounded-full shadow-md z-20">
                            G{step.generation}
                          </div>

                          <div className="bg-slate-50 hover:bg-slate-100/50 border border-slate-205 border-slate-100 p-4 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-3 transition">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-black text-slate-900 font-mono">
                                  {step.contractName}
                                </h4>
                                <span className="text-[9px] px-2 py-0.5 font-bold font-sans bg-indigo-50 border border-indigo-100 rounded text-indigo-700">
                                  {step.evolutionType}
                                </span>
                              </div>
                              <p className="text-xs text-slate-605 text-slate-600 leading-normal font-medium">
                                {step.description}
                              </p>
                            </div>
                            <div className="md:text-right shrink-0">
                              <span className="text-[10px] font-mono text-slate-400 block font-bold">
                                {step.approximateDate}
                              </span>
                              <span className="text-[9px] font-bold text-indigo-600 bg-white border border-slate-200 rounded px-2 py-0.5 inline-block mt-1 font-mono">
                                Divergence: {step.codeDivergenceBrief}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Code comparison interactive panels (Source Code Evolution research) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-555 text-slate-500 uppercase tracking-widest leading-3 flex items-center gap-1.5 font-sans">
                    <FileCode className="w-4 h-4 text-indigo-650 text-indigo-600" />
                    Function-Level Code Divergence Research
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold font-sans">
                    Comparing Parent Standard vs Deployed Mutation
                  </span>
                </div>

                <div className="space-y-6">
                  {traceData.codeComparisons.map((comp, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs border-b border-indigo-100"
                    >
                      {/* Comparison Title row */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 font-sans">
                            File: {comp.fileName}
                          </span>
                          <span className="text-slate-405 text-slate-400">&bull;</span>
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 font-mono text-[10px] rounded font-bold">
                            function {comp.methodName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-505 text-slate-400 font-sans italic">
                          Step #{idx + 1} code delta analysis
                        </span>
                      </div>

                      {/* Code comparison split layout */}
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-150 divide-slate-200">
                        {/* Parent standardized version */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-sans font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Parent Blueprint Code (Standard)
                            </span>
                            <button
                              onClick={() => handleCopyText(comp.parentCode, `p-${idx}`)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {copiedText === `p-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <pre className="bg-slate-950 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-normal whitespace-pre-wrap max-h-56">
                            <code>{comp.parentCode}</code>
                          </pre>
                        </div>

                        {/* Mutated child version */}
                        <div className="p-5 space-y-2 bg-indigo-50/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-sans font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                              Deployed Token Mutation (Modified)
                            </span>
                            <button
                              onClick={() => handleCopyText(comp.childCode, `c-${idx}`)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              {copiedText === `c-${idx}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <pre className="bg-indigo-950 text-indigo-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto leading-normal whitespace-pre-wrap max-h-56 shadow-inner">
                            <code>{comp.childCode}</code>
                          </pre>
                        </div>
                      </div>

                      {/* Auditor Explanation analysis */}
                      <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-2">
                        <h5 className="text-[10px] font-extrabold uppercase text-slate-500 font-sans flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          Research Code Divergence Breakdown & Security Implications
                        </h5>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                          {comp.differenceExplanation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared archetype tokens list representation (同一个祖宗下的 token 查找) */}
              {activeList && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest leading-3 flex items-center gap-1.5 font-sans">
                      <Coins className="w-4 h-4 text-indigo-650 text-indigo-600 animate-spin-slow" />
                      Other Tokens In List Sharing Archetype Structure (同祖宗 / 溯源关联)
                    </h3>
                    <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full font-mono">
                      {sameArchetypeTokens.length} family links
                    </span>
                  </div>

                  {sameArchetypeTokens.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sameArchetypeTokens.map((token) => (
                        <div
                          key={token.address}
                          onClick={() => {
                            setSelectedToken(token);
                            setCustomAddress(token.address);
                            setCustomSymbol(token.symbol);
                            setCustomName(token.name);
                            setCustomChainId(token.chainId);
                            runTrace(token);
                          }}
                          className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl cursor-pointer transition flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-slate-900">{token.symbol}</span>{" "}
                            <span className="text-slate-400">({token.name})</span>
                            <div className="text-[10px] text-indigo-600 font-bold">
                              Shares standard: {traceData.ancestorName}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded shadow">
                            Trace Code &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450 text-slate-400 italic">
                      There are no other obvious modifications of the "{traceData.ancestorName}" archetype present in the active list, making this token a unique implementation standard in the list.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-xs text-slate-400">
              <Dna className="w-12 h-12 mx-auto text-slate-300 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Trace Engine Initialized</p>
                <p className="text-xs">
                  Please pick a token from your list on the left, or input variables to trace the smart contract lineage.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      ) : activeTab === "compare" ? (
        <ContractComparator activeList={activeList} defaultSelectedToken={selectedToken} />
      ) : (
        <BytecodeDecompiler activeList={activeList} defaultSelectedToken={selectedToken} />
      )}
    </div>
  );
}
