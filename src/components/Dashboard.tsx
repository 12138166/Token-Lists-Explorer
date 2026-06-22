import React, { useState } from "react";
import { Search, Link, Copy, Check, Sparkles, Plus, AlertCircle, TrendingUp } from "lucide-react";
import { CURATED_LISTS } from "../data/curatedLists";
import { CuratedTokenList } from "../types";

interface DashboardProps {
  onSelectList: (list: CuratedTokenList) => void;
  onExploreCustomUrl: (url: string) => void;
  loadingUrl?: string;
  error?: string | null;
}

export default function Dashboard({
  onSelectList,
  onExploreCustomUrl,
  loadingUrl,
  error
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onExploreCustomUrl(customUrl.trim());
    }
  };

  const filteredLists = CURATED_LISTS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10" id="tokenlists-dashboard">
      {/* Search & Custom list box */}
      <div className="bg-white border border-slate-200/85 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        {/* Subtle decorative background gradient elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Unifying DeFi Metadata Discoverability
          </div>
          <h1 className="text-3xl md:text-4xl font-sans font-extrabold tracking-tight text-slate-950">
            Discover Verified <span className="text-indigo-600">Token Lists</span>
          </h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            The community standard for on-chain reputation. Token Lists improve asset discoverability, safety, and cross-platform compatibility. Browse core registries or plug in any raw JSON URL.
          </p>

          {/* Quick Custom list Loader Form */}
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <label className="block text-slate-700 text-xs font-bold tracking-wider uppercase">
              Explore custom Token List URI
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="url"
                  placeholder="Paste raw list JSON URL (e.g. static.optimism.io/optimism.tokenlist.json)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loadingUrl === customUrl}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/80 text-white font-semibold text-xs md:text-sm px-6 py-3 rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-100"
              >
                {loadingUrl === customUrl ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" />
                    Fetch & Explore
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="flex items-start gap-2.5 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 text-xs text-left">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <div className="flex-1 space-y-1">
                <p className="font-bold">Unable to fetch requested list</p>
                <p className="text-rose-600">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid Header & Search Filtering */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-sans font-extrabold text-slate-900">Curated Registries</h2>
            <p className="text-xs text-slate-555 text-slate-500 mt-1">Official lists frequently used across major DEX interfaces</p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search registries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-805 text-slate-805 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* List Card Grid */}
        {filteredLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => {
              const chainBadges = getCuratedChainBadges(list.id);
              return (
                <div
                  key={list.id}
                  onClick={() => onSelectList(list)}
                  className="group bg-white hover:bg-white border border-slate-200/60 hover:border-indigo-200 transition-all duration-200 rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer relative overflow-hidden"
                  id={`list-card-${list.id}`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                        {list.logoURI ? (
                          <img
                             src={list.logoURI}
                            alt={`${list.name} logo`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <TrendingUp className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getTagStyle(list.recommendationType)}`}>
                        {list.recommendationType}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <h3 className="font-sans font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {list.name}
                      </h3>
                      <p className="text-xs text-indigo-605 text-indigo-600 font-bold">by {list.author}</p>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                      {list.desc}
                    </p>
                  </div>

                  {/* Actions & Chains */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-4">
                    {/* Chains indicator */}
                    <div className="flex flex-wrap items-center gap-1">
                      {chainBadges.map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/50 text-slate-600"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-2.5">
                      <button
                        onClick={(e) => handleCopy(e, list.url, list.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-slate-505 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition duration-150 cursor-pointer"
                        title="Copy list JSON schema URL"
                      >
                        {copiedId === list.id ? (
                          <>
                            <Check className="w-3 h-3 text-teal-605 text-teal-600" />
                            <span className="text-teal-606 text-teal-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>JSON URL</span>
                          </>
                        )}
                      </button>

                      <div className="text-indigo-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Explore List &rarr;
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-3xl" id="dashboard-no-results">
            <p className="text-slate-500 font-bold">No curated lists match your query</p>
            <p className="text-slate-400 text-xs mt-1">Try refining your keyword search or use the input above to load a custom Token List URL.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getTagStyle(type: string): string {
  switch (type) {
    case "Core":
      return "bg-indigo-50 text-indigo-700 border border-indigo-100";
    case "Aggregator":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    case "Ecosystem":
      return "bg-purple-50 text-purple-700 border border-purple-100";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}

function getCuratedChainBadges(id: string): string[] {
  switch (id) {
    case "uniswap":
      return ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon"];
    case "coingecko":
      return ["Ethereum", "Arbitrum", "BSC", "Polygon", "Base", "Avalanche"];
    case "1inch":
      return ["Ethereum", "Arbitrum", "BSC", "Optimism", "Polygon", "Base"];
    case "optimism":
      return ["Optimism"];
    case "arbitrum":
      return ["Arbitrum"];
    case "aave":
      return ["Ethereum", "Optimism", "Arbitrum", "Polygon", "Avalanche"];
    case "compound":
      return ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon"];
    default:
      return ["Ethereum"];
  }
}
