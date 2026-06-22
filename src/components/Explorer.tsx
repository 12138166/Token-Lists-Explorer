import React, { useState, useMemo } from "react";
import { ArrowLeft, Search, Copy, Check, ExternalLink, Globe, ShieldCheck, Tag, Info, ListFilter, Percent, ShieldAlert, Shield, AlertTriangle, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TokenList, TokenInfo, CuratedTokenList } from "../types";
import { CHAINS_MAP } from "../data/curatedLists";
import { evaluateTokenRisk } from "../lib/securityScore";

interface ExplorerProps {
  list: TokenList;
  curatedMeta?: CuratedTokenList | null;
  onBack: () => void;
  onExploreToken: (token: TokenInfo) => void;
  onAuditList: () => void;
}

export default function Explorer({
  list,
  curatedMeta,
  onBack,
  onExploreToken,
  onAuditList
}: ExplorerProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChain, setSelectedChain] = useState<number | "all">("all");
  const [activeRiskTooltip, setActiveRiskTooltip] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"symbol" | "name" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const tokens = list.tokens || [];

  // Get active chains in this Token List
  const { chainStats, uniqueChains } = useMemo(() => {
    const stats: Record<number, number> = {};
    tokens.forEach((t) => {
      stats[t.chainId] = (stats[t.chainId] || 0) + 1;
    });

    const sortedChains = Object.keys(stats)
      .map(Number)
      .sort((a, b) => stats[b] - stats[a]);

    return {
      chainStats: stats,
      uniqueChains: sortedChains
    };
  }, [tokens]);

  const handleCopy = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Filtered tokens
  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      const trimmedSearch = searchTerm.trim().toLowerCase();
      if (!trimmedSearch) {
        return selectedChain === "all" || t.chainId === selectedChain;
      }

      const chainMeta = CHAINS_MAP[t.chainId];
      const chainName = chainMeta?.name || `Chain ${t.chainId}`;

      const matchSymbol = t.symbol.toLowerCase().includes(trimmedSearch);
      const matchName = t.name.toLowerCase().includes(trimmedSearch);
      const matchChainId = t.chainId.toString() === trimmedSearch || 
                           chainName.toLowerCase().includes(trimmedSearch);
      const matchAddress = t.address.toLowerCase().includes(trimmedSearch);

      const matchSearch = matchSymbol || matchName || matchChainId || matchAddress;

      const matchChain = selectedChain === "all" || t.chainId === selectedChain;

      return matchSearch && matchChain;
    });
  }, [tokens, searchTerm, selectedChain]);

  // Sort function: cycles through ASC -> DESC -> None
  const handleSort = (field: "symbol" | "name") => {
    if (sortBy === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortBy(null);
      }
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  // Sorted and filtered tokens
  const sortedTokens = useMemo(() => {
    if (!sortBy) return filteredTokens;

    return [...filteredTokens].sort((a, b) => {
      const valA = (a[sortBy] || "").toLowerCase();
      const valB = (b[sortBy] || "").toLowerCase();

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTokens, sortBy, sortDirection]);

  // Decimals profile stats
  const decimalsProfile = useMemo(() => {
    const counts: Record<number, number> = {};
    tokens.forEach((t) => {
      counts[t.decimals] = (counts[t.decimals] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([decimals, count]) => ({ decimals: Number(decimals), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [tokens]);

  return (
    <div className="space-y-8" id="tokenlists-explorer">
      {/* Navigation and List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-indigo-600 hover:border-slate-300 transition cursor-pointer"
            id="explorer-back-btn"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
              {list.logoURI ? (
                <img
                  src={list.logoURI}
                  alt={list.name}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Globe className="w-6 h-6 text-indigo-600" />
              )}
            </div>

            <div className="space-y-0.5">
              <h1 className="text-xl font-sans font-extrabold text-slate-900 flex items-center gap-2">
                {list.name}
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full">
                  v{list.version?.major || 1}.{list.version?.minor || 0}.{list.version?.patch || 0}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Created by {curatedMeta?.author || "Community Contributor"} &bull;{" "}
                {tokens.length} total tokens
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAuditList}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 hover:scale-[1.02] text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all cursor-pointer"
            id="explorer-audit-btn"
          >
            <ShieldCheck className="w-4 h-4" />
            AI Security List Audit
          </button>
        </div>
      </div>

      {/* Visual Statistical Breakdowns (Bento Rows) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Count Stats Block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="absolute right-3 top-3 opacity-10">
            <Globe className="w-24 h-24 text-slate-300" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-3">Total Asset Count</h3>
            <p className="text-3xl font-sans font-black text-slate-950 mt-4">{tokens.length}</p>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            Compliant with Uniswap Token Lists JSON schema specs.
          </div>
        </div>

        {/* Grouped Chain ID Stats Block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-3">Chain Grouping Stats</h3>
            <div className="mt-3.5 space-y-2 max-h-[85px] overflow-y-auto pr-1">
              {uniqueChains.map((chainId) => {
                const count = chainStats[chainId] || 0;
                const chainMeta = CHAINS_MAP[chainId];
                const chainName = chainMeta?.name || `Chain ${chainId}`;
                return (
                  <div key={chainId} className="flex items-center justify-between border-b border-slate-50 pb-1 text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 min-w-0">
                      <span className="text-[9px] text-slate-400 font-mono bg-slate-100 rounded px-1 flex-shrink-0">ID {chainId}</span>
                      <span className="truncate">{chainName}</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50/50 rounded px-1.5 py-0.5 flex-shrink-0">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 leading-none">
            Shows counts grouped by respective Chain ID.
          </div>
        </div>

        {/* Chain Distribution Chart Block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-3">Chain Composition</h3>
            <span className="text-[10px] text-slate-500 font-bold">{uniqueChains.length} networks</span>
          </div>

          {/* Simple Custom Grid Percent Bars */}
          <div className="space-y-3">
            <div className="h-2.5 w-full bg-slate-100 rounded-full flex overflow-hidden">
              {uniqueChains.slice(0, 5).map((chainId, idx) => {
                const count = chainStats[chainId] || 0;
                const pct = (count / tokens.length) * 100;
                const colors = ["bg-indigo-505 bg-indigo-600", "bg-emerald-505 bg-emerald-500", "bg-rose-505 bg-rose-500", "bg-amber-505 bg-amber-500", "bg-purple-505 bg-purple-500", "bg-slate-400"];
                const colorClass = colors[idx % colors.length];
                return (
                  <div
                    key={chainId}
                    style={{ width: `${pct}%` }}
                    className={`${colorClass} h-full transition-all duration-300`}
                    title={`${CHAINS_MAP[chainId]?.name || `Chain ID ${chainId}`}: ${count} tokens (${pct.toFixed(1)}%)`}
                  />
                );
              })}
            </div>

            {/* Labels under indicator */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 pt-1.5">
              {uniqueChains.slice(0, 5).map((chainId, idx) => {
                const count = chainStats[chainId] || 0;
                const pct = (count / tokens.length) * 100;
                const colors = ["bg-indigo-605 bg-indigo-600", "bg-emerald-605 bg-emerald-500", "bg-rose-605 bg-rose-500", "bg-amber-605 bg-amber-500", "bg-purple-605 bg-purple-500"];
                const indicatorColor = colors[idx % colors.length];
                return (
                  <div key={chainId} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`} />
                    <span className="text-[11px] font-bold text-slate-800">
                      {CHAINS_MAP[chainId]?.name || `Chain ${chainId}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {count} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
              {uniqueChains.length > 5 && (
                <span className="text-[10px] text-slate-500 font-bold">
                  + {uniqueChains.length - 5} other networks
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explorer Browser Controls */}
      <div className="space-y-4">
        {/* Search & Selector Row */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by symbol, name, contract address, or chain ID (e.g. 1, 137, USDC)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:bg-white rounded-xl py-3 pl-10 pr-10 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-650 px-1.5 py-0.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                title="Clear Search"
              >
                Clear
              </button>
            )}
          </div>

          {/* Chain Pill Filtering Selector */}
          <div className="flex-shrink-0 bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 overflow-x-auto max-w-full shadow-sm">
            <button
              onClick={() => setSelectedChain("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 whitespace-nowrap cursor-pointer ${
                selectedChain === "all"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              All chains ({tokens.length})
            </button>
            {uniqueChains.slice(0, 4).map((chainId) => {
              const chainMeta = CHAINS_MAP[chainId];
              const name = chainMeta?.name || `Chain ${chainId}`;
              const count = chainStats[chainId];
              return (
                <button
                  key={chainId}
                  onClick={() => setSelectedChain(chainId)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition duration-150 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    selectedChain === chainId
                      ? "bg-slate-100 text-slate-900 border border-slate-200 font-extrabold"
                      : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-[10px] font-mono opacity-60">({count})</span>
                </button>
              );
            })}

            {uniqueChains.length > 4 && (
              <div className="relative pl-1 border-l border-slate-200 flex items-center">
                <select
                  value={selectedChain === "all" || uniqueChains.slice(0, 4).includes(selectedChain as number) ? "more" : selectedChain}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value !== "more") {
                      setSelectedChain(Number(value));
                    }
                  }}
                  className="px-2 py-1.5 text-xs font-bold text-slate-505 text-slate-500 bg-transparent border-none outline-none focus:outline-none cursor-pointer max-w-[130px] pr-4"
                >
                  <option value="more" disabled>Other chains...</option>
                  {uniqueChains.slice(4).map((chainId) => {
                    const chainMeta = CHAINS_MAP[chainId];
                    const name = chainMeta?.name || `Chain ID ${chainId}`;
                    const count = chainStats[chainId];
                    return (
                      <option key={chainId} value={chainId}>
                        {name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Token Count Title */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-805 text-slate-800">{filteredTokens.length}</span>{" "}
            assets matching search terms
          </div>
          <div>
            Active chain:{" "}
            <span className="font-bold text-slate-805 text-slate-800">
              {selectedChain === "all" ? "All networks" : CHAINS_MAP[selectedChain]?.name || `Chain ${selectedChain}`}
            </span>
          </div>
        </div>

        {/* Token List Panel Grid */}
        {sortedTokens.length > 0 ? (
          <div className="bg-white border border-slate-205 border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest items-center">
              <div className="col-span-5 md:col-span-4 flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400">Asset</span>
                <span className="text-slate-300 font-normal">| Sort:</span>
                <button
                  type="button"
                  onClick={() => handleSort("symbol")}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-all flex items-center gap-0.5 border cursor-pointer ${
                    sortBy === "symbol"
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-extrabold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Sort by Token Symbol"
                >
                  <span>Symbol</span>
                  {sortBy === "symbol" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-2.5 h-2.5 text-indigo-600" />
                    ) : (
                      <ArrowDown className="w-2.5 h-2.5 text-indigo-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-2 h-2 opacity-50" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSort("name")}
                  className={`px-1.5 py-0.5 rounded text-[9px] transition-all flex items-center gap-0.5 border cursor-pointer ${
                    sortBy === "name"
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-extrabold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  }`}
                  title="Sort by Token Name"
                >
                  <span>Name</span>
                  {sortBy === "name" ? (
                    sortDirection === "asc" ? (
                      <ArrowUp className="w-2.5 h-2.5 text-indigo-600" />
                    ) : (
                      <ArrowDown className="w-2.5 h-2.5 text-indigo-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-2 h-2 opacity-50" />
                  )}
                </button>
              </div>
              <div className="col-span-2 block">Network</div>
              <div className="col-span-4 hidden md:block">Contract address</div>
              <div className="col-span-2 text-center md:text-left">Decimals</div>
              <div className="col-span-3 md:col-span-2 text-right">Insight</div>
            </div>

            {/* Token Rows */}
            <div className="divide-y divide-slate-100">
              {sortedTokens.slice(0, 150).map((token, idx) => {
                const chainMeta = CHAINS_MAP[token.chainId];
                const blockExplorer = chainMeta?.explorer;

                return (
                  <div
                    key={`${token.address}-${token.chainId}-${idx}`}
                    onClick={() => onExploreToken(token)}
                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-indigo-50/40 transition cursor-pointer group animate-in fade-in-50 duration-150"
                    id={`token-row-${token.symbol}-${idx}`}
                  >
                    {/* Name & Symbol */}
                    <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center flex-shrink-0 relative">
                        {token.logoURI ? (
                          <img
                            src={token.logoURI}
                            alt={`${token.symbol} Logo`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-slate-555 text-slate-505 text-slate-500">
                            {token.symbol?.slice(0, 2)}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        {(() => {
                          const riskDetails = evaluateTokenRisk(token);
                          const scoreColor = 
                            riskDetails.riskLevel === "Critical" ? "bg-rose-100 text-rose-800 border-rose-300" :
                            riskDetails.riskLevel === "High" ? "bg-orange-100 text-orange-850 text-orange-800 border-orange-300" :
                            riskDetails.riskLevel === "Medium" ? "bg-amber-100 text-amber-900 border-amber-300" :
                            "bg-emerald-100 text-emerald-800 border-emerald-300";

                          return (
                            <div className="font-extrabold text-slate-900 truncate text-sm md:text-base group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 relative">
                              {token.symbol}
                              <div 
                                onMouseEnter={(e) => { e.stopPropagation(); setActiveRiskTooltip(token.address + "-" + idx); }}
                                onMouseLeave={(e) => { e.stopPropagation(); setActiveRiskTooltip(null); }}
                                className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-tighter uppercase border flex items-center gap-0.5 select-none cursor-help transition-all transform hover:scale-105 duration-150 ${scoreColor}`}
                              >
                                <Shield className="w-2.5 h-2.5 shrink-0" />
                                <span>Risk {riskDetails.riskScore}%</span>
                                
                                {activeRiskTooltip === (token.address + "-" + idx) && (
                                  <div 
                                    className="absolute left-0 bottom-full mb-2 w-64 bg-slate-950 text-white rounded-2xl p-4 shadow-xl z-50 text-left cursor-default pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Security Summary</span>
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                          riskDetails.riskLevel === "Critical" ? "bg-rose-500 text-white" :
                                          riskDetails.riskLevel === "High" ? "bg-orange-500 text-white" :
                                          riskDetails.riskLevel === "Medium" ? "bg-amber-500 text-slate-900" :
                                          "bg-emerald-500 text-white"
                                        }`}>
                                          {riskDetails.riskLevel} Risk
                                        </span>
                                      </div>

                                      <div className="space-y-1.5 text-xs text-slate-100 font-medium leading-relaxed">
                                        <div className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                                          <span className="text-slate-400 text-[10px]">Security Rating Score:</span>
                                          <span className="font-extrabold text-white text-[11px]">{100 - riskDetails.riskScore}/100</span>
                                        </div>
                                        <div className="text-[10px] text-slate-300 leading-snug">
                                          {riskDetails.matchedSignatures.length > 0 
                                            ? `⚠️ Flags: matches ${riskDetails.matchedSignatures[0].name}`
                                            : "✓ Clean Standard Code layout signature"}
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-white/5 space-y-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                        <span className="block mb-1 text-slate-500">Security Vector Grades:</span>
                                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono font-bold">
                                          <div className="flex justify-between">
                                            <span>Reentrancy:</span>
                                            <span className={riskDetails.reentrancyRating > 80 ? "text-emerald-400" : "text-rose-400"}>{riskDetails.reentrancyRating}%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Oracle feed:</span>
                                            <span className={riskDetails.oracleRating > 80 ? "text-emerald-400" : "text-rose-400"}>{riskDetails.oracleRating}%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Anti-Phish:</span>
                                            <span className={riskDetails.phishingRating > 80 ? "text-emerald-400" : "text-rose-400"}>{riskDetails.phishingRating}%</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Tax Lock:</span>
                                            <span className={riskDetails.taxRating > 80 ? "text-emerald-400" : "text-rose-400"}>{riskDetails.taxRating}%</span>
                                          </div>
                                        </div>
                                      </div>

                                      <p className="text-[8px] text-indigo-400 pt-1 text-center font-bold">
                                        Click row to view full analysis details
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
                        <div className="text-[10px] md:text-xs text-slate-400 truncate mt-0.5">
                          {token.name}
                        </div>
                      </div>
                    </div>

                    {/* Network Chain ID badge */}
                    <div className="col-span-2 select-none">
                      <span
                        className={`text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          chainMeta?.color || "bg-slate-100 text-slate-655 text-slate-600 border-slate-205"
                        }`}
                      >
                        {chainMeta?.name || `Chain ${token.chainId}`}
                      </span>
                    </div>

                    {/* Address block with buttons */}
                    <div className="col-span-4 hidden md:flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-slate-500 truncate opacity-85">
                        {token.address}
                      </span>
                      <button
                        onClick={(e) => handleCopy(e, token.address)}
                        className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md transition flex items-center justify-center flex-shrink-0 cursor-pointer"
                        title="Copy contract address"
                      >
                        {copiedAddress === token.address ? (
                          <Check className="w-3 h-3 text-teal-605 text-teal-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {blockExplorer && (
                        <a
                          href={`${blockExplorer}/token/${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-805 text-slate-800 border border-slate-200 rounded-md transition flex items-center justify-center flex-shrink-0 cursor-pointer"
                          title="View on block explorer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Decimals */}
                    <div className="col-span-2 text-center md:text-left font-mono text-xs md:text-sm text-slate-600 font-bold">
                      {token.decimals}
                    </div>

                    {/* AI Button */}
                    <div className="col-span-3 md:col-span-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExploreToken(token);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 hover:bg-indigo-600 px-3 py-1.5 rounded-xl transition cursor-pointer"
                      >
                        Insight
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTokens.length > 150 && (
              <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-100 bg-slate-50">
                Displaying the first 150 matches to improve system render times. Use search filters to locate specific assets.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl" id="explorer-no-results">
            <Info className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-500 font-extrabold text-sm">No tokens match your current filter</p>
            <p className="text-slate-400 text-xs mt-1">
              Try updating your search text or removing the chain network filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
