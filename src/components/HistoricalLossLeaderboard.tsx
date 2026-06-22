import React, { useState, useMemo } from "react";
import { 
  TrendingDown, 
  ShieldAlert, 
  Flame, 
  Search, 
  Layers, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Activity,
  Award
} from "lucide-react";

export interface ExploitRecord {
  protocol: string;
  category: "Flash Loan" | "Rug Pull" | "Reentrancy" | "Key Compromise" | "Logic Upgrade Abuse" | "Oracle Manipulation";
  lossUSD: number;
  date: string;
  chain: string;
  description: string;
  vectorExplanation: string;
  remediation: string;
  thwartedByAudits: boolean;
}

export const HISTORICAL_EXPLOITS: ExploitRecord[] = [
  {
    protocol: "Ronin Bridge",
    category: "Key Compromise",
    lossUSD: 624000000,
    date: "2022-03-29",
    chain: "Ronin Network",
    description: "Axie Infinity's Ronin bridge was hacked for over $620M. Nodes were compromised via spear-phishing, giving access to 5 of the 9 validator keys.",
    vectorExplanation: "Private key compromise of multisig validators to directly sign fraudulent withdrawal receipts in bridge contracts.",
    remediation: "Symmetric threshold keys, offline HSM vault nodes, and strict rate-limiting gates on bridge balances.",
    thwartedByAudits: false
  },
  {
    protocol: "Poly Network",
    category: "Logic Upgrade Abuse",
    lossUSD: 611000000,
    date: "2021-08-10",
    chain: "Multi-Chain",
    description: "Multi-chain protocol Poly Network was exploited across Ethereum, BSC, and Polygon. Hacker manipulated cross-chain manager contracts to switch consensus keeper nodes.",
    vectorExplanation: "Unprotected execution context inside '_executeCrossChainTx' allowed arbitrary delegatecalls to change registry parameters.",
    remediation: "Implement rigid whitelist boundaries for consensus-governed state modifications and strictly separate administrative call paths.",
    thwartedByAudits: true
  },
  {
    protocol: "Nomad Bridge",
    category: "Logic Upgrade Abuse",
    lossUSD: 190000000,
    date: "2022-08-01",
    chain: "Ethereum / Moonbeam",
    description: "A bad initialization parameter validated the zero hash (0x0) as a completed proof root, allowing anyone to copy previous exploit payloads to drain tokens.",
    vectorExplanation: "Incorrect initialization of trusted root arrays. The zero-hash root defaulted to true, bypassing merkle-proof compliance.",
    remediation: "Strict require gates ensuring roots are never default-constructed zero bytes on upgrade initializers.",
    thwartedByAudits: true
  },
  {
    protocol: "Euler Finance",
    category: "Oracle Manipulation",
    lossUSD: 197000000,
    date: "2023-03-13",
    chain: "Ethereum",
    description: "Lending protocol Euler was drained through dynamic swap slippage. Flash loans were deployed to disrupt spot asset weightings in AMM pools.",
    vectorExplanation: "Vulnerable EToken internal mint/burn ratios combined with lack of Twap observations or external reliable oracle boundaries.",
    remediation: "Implement TWAP or decentralized dual-consensus oracles (Chainlink aggregate + Redstone fallback) coupled with dynamic slippage checks.",
    thwartedByAudits: true
  },
  {
    protocol: "Munchables",
    category: "Logic Upgrade Abuse",
    lossUSD: 62500000,
    date: "2024-03-26",
    chain: "Blast Layer 2",
    description: "Social gaming protocol Munchables suffered from an insider logic upgrade exploit. A rogue developer introduced covert hooks in token-locking structures.",
    vectorExplanation: "Rogue administrative address deployed upgraded proxy implementation that diverted lockup validation controls.",
    remediation: "Implement Gnosis Safe multi-signature structures, cold-storage emergency admin locks, and 48-hour timelock execution phases.",
    thwartedByAudits: true
  },
  {
    protocol: "Curve Finance Vyper Compiler",
    category: "Reentrancy",
    lossUSD: 61700000,
    date: "2023-07-30",
    chain: "Ethereum / Arbitrum",
    description: "Compiler level reentrancy guard malfunction. Specific versions of Vyper (0.2.15 to 0.3.0) compiled nested nonreentrant locks improperly.",
    vectorExplanation: "Reentrancy locks did not share the same state slots due to recursive storage allocation mismatch during compilation.",
    remediation: "Compile-time validation audits of gas variables and strict execution tests of guard mutexes before deploying live liquidity.",
    thwartedByAudits: true
  },
  {
    protocol: "Onyx Protocol",
    category: "Reentrancy",
    lossUSD: 2100000,
    date: "2023-11-01",
    chain: "Ethereum",
    description: "Onyx lending protocol was exploited due to a precision round-down reentrancy loophole in a newly launched empty compound market pool.",
    vectorExplanation: "Attacker manipulated base exchange rate registers via unsafe callback before update of compound states.",
    remediation: "Checks-Effects-Interactions compliance, and deposit virtual shares limits to prevent empty pool manipulation.",
    thwartedByAudits: true
  },
  {
    protocol: "SafenReflect Honeypot",
    category: "Rug Pull",
    lossUSD: 4500000,
    date: "2024-02-14",
    chain: "BNB Chain",
    description: "Algorithmic token deployed dynamic tax updates that modified transfer validation, disabling sell methods while retaining buys.",
    vectorExplanation: "Malicious customizable buy & sell fee hooks allowed administrative controls to trap users' balances upon entering.",
    remediation: "Enforced limitations in smart contract layout restricting sell fee taxes to a maximum cap of 5%. Ownership renounced.",
    thwartedByAudits: true
  }
];

export default function HistoricalLossLeaderboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // Stats analysis
  const stats = useMemo(() => {
    let totalValue = 0;
    const categoryTotals: Record<string, number> = {};
    const chainLosses: Record<string, number> = {};

    HISTORICAL_EXPLOITS.forEach((e) => {
      totalValue += e.lossUSD;
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.lossUSD;
      chainLosses[e.chain] = (chainLosses[e.chain] || 0) + e.lossUSD;
    });

    return {
      totalValue,
      categoryTotals,
      chainLosses
    };
  }, []);

  const filteredExploits = useMemo(() => {
    return HISTORICAL_EXPLOITS.filter((e) => {
      const matchesSearch = 
        e.protocol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.chain.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;

      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.lossUSD - a.lossUSD);
  }, [searchTerm, selectedCategory]);

  const toggleExpand = (protocol: string) => {
    setExpandedRecord(expandedRecord === protocol ? null : protocol);
  };

  const formatUSD = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    return `$${(val / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="historical-loss-leaderboard">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-650 text-indigo-600" />
            <h2 className="text-lg font-sans font-extrabold text-slate-900">Historical Loss Leaderboard</h2>
          </div>
          <p className="text-xs text-slate-505 text-slate-500">
            Audit-track summaries of notorious exploits, TVL impacts, and mitigation profiles mapped to our Scam signature scanner.
          </p>
        </div>

        <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <TrendingDown className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-slate-700">
            Total Charted Value Impact: <span className="text-rose-600 font-extrabold">{formatUSD(stats.totalValue)} USD</span>
          </span>
        </div>
      </div>

      {/* Hero Category Breakdown Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats.categoryTotals).map(([cat, total]) => {
          const totalNum = total as number;
          const pct = (totalNum / stats.totalValue) * 105 - 5; // Adjusted proportional bar layout
          const displayPct = (totalNum / stats.totalValue) * 100;
          return (
            <div key={cat} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
               <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">{cat}</span>
               <div className="flex items-baseline gap-1.5">
                 <span className="text-lg font-black text-slate-900">{formatUSD(totalNum)}</span>
                 <span className="text-[10px] text-rose-500 font-bold font-mono">({displayPct.toFixed(1)}%)</span>
               </div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                 <div className="bg-indigo-600 h-full" style={{ width: `${displayPct}%` }} />
               </div>
            </div>
          );
        })}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 border border-slate-200/80 rounded-2xl items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident logs by protocol or blockchain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/50 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-805 placeholder-slate-400 focus:outline-none focus:border-indigo-500 border border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 uppercase font-extrabold whitespace-nowrap">Filter Threat:</span>
          {["All", "Logic Upgrade Abuse", "Reentrancy", "Oracle Manipulation", "Rug Pull", "Key Compromise"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-50 text-slate-555 text-slate-500 hover:text-slate-800 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard grid list */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left select-none">
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-4 md:col-span-3">Protocol / Network</div>
          <div className="col-span-3">Category</div>
          <div className="col-span-2">Loss (USD)</div>
          <div className="col-span-2 hidden md:block text-slate-502">Exploit Date</div>
          <div className="col-span-2 text-right">Sanctuary Shield</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredExploits.map((e, index) => {
            const isExpanded = expandedRecord === e.protocol;
            const rank = index + 1;
            const rankBg = 
              rank === 1 ? "bg-amber-100 text-amber-900 border-amber-300" :
              rank === 2 ? "bg-slate-150 text-slate-800 border-slate-300" :
              rank === 3 ? "bg-orange-100 text-orange-950 border-orange-355 text-orange-700 border-orange-200" :
              "bg-slate-50 text-slate-500";

            return (
              <div key={e.protocol} className="transition hover:bg-slate-50/50">
                <div 
                  onClick={() => toggleExpand(e.protocol)}
                  className="grid grid-cols-12 gap-3 items-center px-6 py-4 text-xs cursor-pointer select-none"
                >
                  <div className="col-span-1 text-center">
                    <span className={`inline-flex w-5 h-5 rounded-md text-[10px] items-center justify-center font-extrabold border ${rankBg}`}>
                      {rank}
                    </span>
                  </div>

                  <div className="col-span-4 md:col-span-3">
                    <div className="text-slate-900 font-extrabold text-xs md:text-sm">{e.protocol}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-bold">{e.chain}</div>
                  </div>

                  <div className="col-span-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-120 border-indigo-100 text-indigo-700">
                      {e.category}
                    </span>
                  </div>

                  <div className="col-span-2 font-black font-mono text-slate-850 text-slate-800 text-xs md:text-sm">
                    {formatUSD(e.lossUSD)}
                  </div>

                  <div className="col-span-2 hidden md:block text-slate-500 font-bold font-mono">
                    {e.date}
                  </div>

                  <div className="col-span-2 text-right flex items-center justify-end gap-1.5">
                    {e.thwartedByAudits ? (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-tighter">
                        Blockable Pattern
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-50 text-rose-800 border border-rose-200 uppercase tracking-tighter animate-pulse text-rose-600">
                        Operational Loop
                      </span>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50 text-xs text-slate-705 text-slate-600 leading-relaxed md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                      <div>
                        <span className="font-extrabold text-[10px] text-indigo-650 text-indigo-600 block uppercase tracking-wide">Incident Summary</span>
                        <p className="text-[11px] text-slate-700">{e.description}</p>
                      </div>

                      <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1">
                        <span className="font-extrabold text-[9px] text-rose-600 block uppercase tracking-wide flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Threat Attack Vector
                        </span>
                        <p className="text-[11px] text-slate-800 leading-normal">{e.vectorExplanation}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-white border border-slate-205 border-slate-200 rounded-xl space-y-1.5">
                        <span className="font-extrabold text-[9px] text-emerald-700 block uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Best-Practice Mitigation (Sanctuary Remediation)
                        </span>
                        <p className="text-[11px] text-slate-800 leading-normal">{e.remediation}</p>
                      </div>

                      <div className="bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-800 font-mono text-[9px] overflow-x-auto select-all max-h-24">
                        <span className="text-slate-500 block mb-1 uppercase font-bold">// Sandbox Patch Check Example</span>
                        <pre className="text-indigo-300 font-bold">{getSimulatedCodeSnippet(e.category)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getSimulatedCodeSnippet(category: string): string {
  switch (category) {
    case "Reentrancy":
      return `modifier nonReentrant() {\n    require(_status != _ENTERED, "REENTRANT");\n    _status = _ENTERED;\n    _;\n    _status = _NOT_ENTERED;\n}`;
    case "Oracle Manipulation":
      return `// Price feed check:\nrequire(aggregator.latestAnswer() > 0, "Oracle dead");\nrequire(Math.abs(spotPrice - twapPrice) <= slippageTolerance, "Oracle manipulated");`;
    case "Logic Upgrade Abuse":
      return `function _authorizeUpgrade(address newImpl) internal override onlyOwner {\n    require(newImpl != address(0), "Zero address");\n    emit UpgradeScheduled(newImpl);\n}`;
    default:
      return `// Enforce rate limits\nrequire(amount <= getBridgeAllowedDailyLimit(), "Volume throttle threshold exceeded");`;
  }
}
