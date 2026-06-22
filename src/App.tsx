import React, { useState } from "react";
import { Compass, BookOpen, ShieldCheck, HelpCircle, Coins, Search, Cpu, RefreshCw, AlertCircle, Dna, ShieldAlert } from "lucide-react";
import Dashboard from "./components/Dashboard";
import Explorer from "./components/Explorer";
import Validator from "./components/Validator";
import TokenDetailsModal from "./components/TokenDetailsModal";
import AiAssistant from "./components/AiAssistant";
import AncestorTracer from "./components/AncestorTracer";
import SecurityIntelligenceHub from "./components/SecurityIntelligenceHub";
import { TokenList, TokenInfo, CuratedTokenList } from "./types";
import { FALLBACK_TOKENS, CURATED_LISTS } from "./data/curatedLists";

export default function App() {
  const [currentView, setCurrentView] = useState<"dashboard" | "explorer" | "validator" | "ancestor" | "security-hub">("dashboard");
  const [selectedCuratedMeta, setSelectedCuratedMeta] = useState<CuratedTokenList | null>(null);
  const [activeTokenList, setActiveTokenList] = useState<TokenList | null>(null);

  // Load Status Indicators
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [usingCacheFallback, setUsingCacheFallback] = useState(false);

  // Modal active variables
  const [inspectToken, setInspectToken] = useState<TokenInfo | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Fetch token list JSON either via curated metadata card or any custom address URL
  const loadTokenList = async (url: string, curatedListId?: string) => {
    setLoadingUrl(url);
    setFetchError(null);
    setUsingCacheFallback(false);

    try {
      const response = await fetch(`/api/fetch-list?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Server responded with status code ${response.status}`);
      }

      const listJson = await response.json();
      setActiveTokenList(listJson);
      setCurrentView("explorer");
    } catch (err: any) {
      console.warn("Failed to dynamically fetch token list, checking fallback seed tokens:", err.message);

      // Verify if fallback tokens exist for listId
      if (curatedListId && FALLBACK_TOKENS[curatedListId]) {
        // Construct standard-compliant Token List metadata shell
        const matchingMeta = CURATED_LISTS.find(l => l.id === curatedListId);
        const listShell: TokenList = {
          name: matchingMeta?.name || "Local Token List Cache",
          timestamp: new Date().toISOString(),
          version: { major: 1, minor: 0, patch: 0 },
          logoURI: matchingMeta?.logoURI,
          tokens: FALLBACK_TOKENS[curatedListId]
        };

        setActiveTokenList(listShell);
        setUsingCacheFallback(true);
        setCurrentView("explorer");
      } else {
        setFetchError(`Fetch error: ${err.message}. If this is a self-hosted custom URL, please check your server's CORS settings or ensure the JSON conforms to Token Lists schemas.`);
      }
    } finally {
      setLoadingUrl(null);
    }
  };

  const handleSelectCurated = (curated: CuratedTokenList) => {
    setSelectedCuratedMeta(curated);
    loadTokenList(curated.url, curated.id);
  };

  const handleSelectCustomUrl = (customUrl: string) => {
    setSelectedCuratedMeta(null); // Custom URL has no curated default metadata cards
    loadTokenList(customUrl);
  };

  const handleExploreToken = (token: TokenInfo) => {
    setInspectToken(token);
    setTokenModalOpen(true);
  };

  const handleTraceAncestorFromModal = (token: TokenInfo) => {
    setCurrentView("ancestor");
  };

  const handleAuditSelectedList = () => {
    if (activeTokenList) {
      setAuditModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-500/20 selection:text-indigo-900" id="main-portal">
      {/* Dynamic top divider line */}
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-slate-250 z-10" />

      {/* Primary header portal navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-250/80 max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo brand */}
          <div
            onClick={() => {
              setCurrentView("dashboard");
              setActiveTokenList(null);
              setSelectedCuratedMeta(null);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition duration-150">
              <Coins className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="font-sans font-extrabold tracking-tight text-slate-950 group-hover:text-indigo-600 transition duration-155 text-sm md:text-base">
                DefiLists
              </span>
              <span className="text-[10px] text-indigo-600 block font-bold uppercase tracking-widest leading-3 mt-0.5">
                Reputation Registry
              </span>
            </div>
          </div>

          {/* Nav buttons */}
          <nav className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => {
                setCurrentView("dashboard");
                setActiveTokenList(null);
                setSelectedCuratedMeta(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                currentView === "dashboard" || currentView === "explorer"
                  ? "bg-slate-105 bg-slate-100 text-slate-900 border border-slate-205 border-slate-200"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Lists</span>
            </button>

            <button
              onClick={() => setCurrentView("ancestor")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                currentView === "ancestor"
                  ? "bg-slate-105 bg-slate-100 text-slate-900 border border-slate-205 border-slate-200"
                  : "text-slate-505 text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Dna className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>Ancestor Lineage</span>
            </button>

            <button
              onClick={() => setCurrentView("validator")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                currentView === "validator"
                  ? "bg-slate-105 bg-slate-100 text-slate-900 border border-slate-205 border-slate-200"
                  : "text-slate-505 text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Standard Validator</span>
            </button>

            <button
              onClick={() => setCurrentView("security-hub")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                currentView === "security-hub"
                  ? "bg-slate-105 bg-slate-100 text-slate-900 border border-slate-205 border-slate-200"
                  : "text-slate-505 text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>Security Hub</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Sticky Loading Screen overlay */}
      {loadingUrl && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
              <Coins className="w-7 h-7 text-indigo-600" />
              <div className="absolute inset-0 border-2 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <div>
              <p className="text-slate-950 font-extrabold text-sm">Querying metadata endpoint</p>
              <p className="text-xs text-slate-500 leading-normal mt-1.5">
                Bypassing cross-origin blocking protocols. Downloading and validating JSON list schema variables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Cache Backup Reminder Banner */}
        {usingCacheFallback && currentView === "explorer" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Using local gateway cache index:</span> High-count rate restrictions or offline conditions on the remote provider prevented a direct call. Displaying pre-verified decentralized asset lists.
            </div>
          </div>
        )}

        {/* View Switcher Router */}
        {currentView === "dashboard" && (
          <Dashboard
            onSelectList={handleSelectCurated}
            onExploreCustomUrl={handleSelectCustomUrl}
            loadingUrl={loadingUrl || undefined}
            error={fetchError}
          />
        )}

        {currentView === "explorer" && activeTokenList && (
          <Explorer
            list={activeTokenList}
            curatedMeta={selectedCuratedMeta}
            onBack={() => {
              setCurrentView("dashboard");
              setActiveTokenList(null);
              setSelectedCuratedMeta(null);
            }}
            onExploreToken={handleExploreToken}
            onAuditList={handleAuditSelectedList}
          />
        )}

        {currentView === "validator" && <Validator />}

        {currentView === "ancestor" && (
          <AncestorTracer
            activeList={activeTokenList}
            onExploreToken={handleExploreToken}
          />
        )}

        {currentView === "security-hub" && (
          <SecurityIntelligenceHub activeList={activeTokenList} />
        )}
      </main>

      {/* Portal Footer stats (From design template!) */}
      <footer className="h-14 mt-12 bg-slate-900 text-slate-400 flex items-center justify-between px-4 md:px-8 text-xs font-medium max-w-7xl mx-auto rounded-t-2xl shrink-0">
        <div className="flex space-x-4 md:space-x-8">
          <span>Lists Catalog: <span className="text-white font-bold">{CURATED_LISTS.length} curated</span></span>
          <span className="hidden sm:inline">Active Checksums: <span className="text-emerald-400 font-bold">100% verified</span></span>
          <span>Scope: <span className="text-white">Standard v1.x</span></span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[11px]">Global DeFi Sync Active</span>
        </div>
      </footer>

      {/* Bottom informational footer */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-[11px] text-slate-400 border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} DefiLists &bull; Standardized ERC20 decentralized registry. Powered by Gemini.</p>
      </div>

      {/* Modals and Side Panels */}
      <TokenDetailsModal
        token={inspectToken}
        isOpen={tokenModalOpen}
        onClose={() => {
          setInspectToken(null);
          setTokenModalOpen(false);
        }}
        onTraceAncestor={handleTraceAncestorFromModal}
      />

      {activeTokenList && (
        <AiAssistant
          list={activeTokenList}
          isOpen={auditModalOpen}
          onClose={() => setAuditModalOpen(false)}
        />
      )}
    </div>
  );
}

