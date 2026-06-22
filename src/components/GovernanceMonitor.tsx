import React, { useState, useMemo } from "react";
import { 
  Vote, 
  CheckSquare, 
  Clock, 
  ChevronRight, 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Radio, 
  CheckCircle, 
  XCircle,
  Award,
  HelpCircle
} from "lucide-react";
import { TokenList, TokenInfo } from "../types";

interface GovernanceProposal {
  id: string;
  tokenSymbol: string;
  title: string;
  creator: string;
  status: "Active" | "Succeeded" | "Defeated" | "Queued" | "Executed";
  votesFor: number;
  votesAgainst: number;
  quorumRequired: number;
  quorumCurrent: number;
  startDate: string;
  endDate: string;
  executionDate?: string;
  executionPayload: string;
  description: string;
  events: Array<{
    title: string;
    date: string;
    txHash: string;
  }>;
}

const CONSTANT_PROPOSALS: GovernanceProposal[] = [
  {
    id: "aave-prop-148",
    tokenSymbol: "AAVE",
    title: "AIP-148: Upgradability Transition of V2 Liquidity Pool Stewards",
    creator: "0x2B1A...82E1 (Aave Risk DAO)",
    status: "Executed",
    votesFor: 641880,
    votesAgainst: 1240,
    quorumRequired: 320000,
    quorumCurrent: 643120,
    startDate: "2026-06-10",
    endDate: "2026-06-14",
    executionDate: "2026-06-16",
    executionPayload: "PoolConfigurator.setEmergencyAdmin(0x75ea...33a1);",
    description: "Upgrades administrative permissions on frozen legacy V2 markets to cold-vault parameters. This mitigates potential bad debt and reentrancy vectors on low-cap collateral pools.",
    events: [
      { title: "Proposal Created on-chain", date: "2026-06-10 09:00", txHash: "0xca771...a0a1" },
      { title: "Voting Phase Started", date: "2026-06-10 12:00", txHash: "0xbb123...4490" },
      { title: "Succeeded with 99.8% Approval", date: "2026-06-14 12:00", txHash: "0xec220...ff92" },
      { title: "Queued in Timelock Engine", date: "2026-06-14 14:00", txHash: "0xad821...bcdd" },
      { title: "Executed via Emergency Admin Module", date: "2026-06-16 11:22", txHash: "0xf0289...3302" }
    ]
  },
  {
    id: "uni-prop-42",
    tokenSymbol: "UNI",
    title: "Uniswap-Prop-42: Allocate Ecosystem Research Grants to Layer-2 Bridge Audits",
    creator: "0x3D0A...c218 (Uniswap Foundation)",
    status: "Active",
    votesFor: 44299100,
    votesAgainst: 8904500,
    quorumRequired: 40000000,
    quorumCurrent: 53203600,
    startDate: "2026-06-15",
    endDate: "2026-06-20",
    executionPayload: "EcosystemGiver.allocateFunds(0xecc1...9302, 1200000 * 1e18);",
    description: "Bridges represent high-severity attack surfaces for the DEX ecosystem. This governance action authorizes funding of six major audit initiatives for multi-chain and cross-chain routers.",
    events: [
      { title: "Proposal Initialized", date: "2026-06-15 08:30", txHash: "0x7a220...30aa" },
      { title: "Quorum threshold achieved", date: "2026-06-16 14:00", txHash: "0x9c821...83dd" }
    ]
  },
  {
    id: "comp-prop-210",
    tokenSymbol: "COMP",
    title: "Compound-Prop-210: Deprecate Legacy Price Spot Observers in Favor of TWAP Nodes",
    creator: "0x51E2...4021 (Gauntlet Risk Manager)",
    status: "Queued",
    votesFor: 188200,
    votesAgainst: 4210,
    quorumRequired: 100000,
    quorumCurrent: 192410,
    startDate: "2026-06-11",
    endDate: "2026-06-15",
    executionPayload: "PriceOracleV3.setAnchorTolerance(0x8e8...e9c3, 30);",
    description: "Sets observation parameters and incorporates decentralized TWAP thresholds across all lending assets to eliminate flashloan spot manipulability risks.",
    events: [
      { title: "Proposal Created", date: "2026-06-11 11:00", txHash: "0x9812a...77ab" },
      { title: "Voting Phase Active", date: "2026-06-11 14:00", txHash: "0x09bc3...82ee" },
      { title: "Vote Passed Successfully", date: "2026-06-15 15:00", txHash: "0xcc299...55b0" },
      { title: "Queued in Timelock Delay Contract", date: "2026-06-16 02:00", txHash: "0xd83a1...ff02" }
    ]
  },
  {
    id: "ldo-prop-90",
    tokenSymbol: "LDO",
    title: "LIP-90: Restructure Node Operator Multi-Signature Key Allocations",
    creator: "0x9E72...ffea (Lido DAO Core)",
    status: "Active",
    votesFor: 1290300,
    votesAgainst: 1450200,
    quorumRequired: 2000000,
    quorumCurrent: 2740500,
    startDate: "2026-06-16",
    endDate: "2026-06-21",
    executionPayload: "NodeConsensus.rebalanceValidators(5);",
    description: "Distributes validator node ownership metrics to incorporate fresh operators, preventing geographical key co-location or single hosting client dependency issues.",
    events: [
      { title: "Proposal Structured", date: "2026-06-16 13:00", txHash: "0x33aa1...902a" },
      { title: "Voting Active (Critical Tension)", date: "2026-06-17 01:00", txHash: "0xbf321...df01" }
    ]
  }
];

interface GovernanceMonitorProps {
  activeList?: TokenList | null;
}

export default function GovernanceMonitor({ activeList }: GovernanceMonitorProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [votedProposals, setVotedProposals] = useState<Record<string, "FOR" | "AGAINST">>({});
  const [proposalsState, setProposalsState] = useState<GovernanceProposal[]>(CONSTANT_PROPOSALS);
  const [filterToken, setFilterToken] = useState<string>("All");

  // Get what symbols actually exist in the active list to filter dynamically
  const listSymbols = useMemo(() => {
    if (!activeList || !activeList.tokens) return ["All", "AAVE", "UNI", "COMP", "LDO"];
    const syms = new Set<string>();
    activeList.tokens.forEach((t) => {
      if (["AAVE", "UNI", "COMP", "LDO"].includes(t.symbol.toUpperCase())) {
        syms.add(t.symbol.toUpperCase());
      }
    });
    return ["All", ...Array.from(syms)];
  }, [activeList]);

  // Filter proposals
  const filteredProposals = useMemo(() => {
    return proposalsState.filter((p) => {
      if (filterToken === "All") return true;
      return p.tokenSymbol.toUpperCase() === filterToken.toUpperCase();
    });
  }, [proposalsState, filterToken]);

  const handleCastVote = (proposalId: string, choice: "FOR" | "AGAINST") => {
    if (votedProposals[proposalId]) return; // Already voted

    setVotedProposals((prev) => ({ ...prev, [proposalId]: choice }));

    // Increment local state data count to show realistic changes
    setProposalsState((prevProposals) =>
      prevProposals.map((p) => {
        if (p.id === proposalId) {
          const voteWeight = 250000; // Simulated user vote balance weight
          const updatedFor = choice === "FOR" ? p.votesFor + voteWeight : p.votesFor;
          const updatedAgainst = choice === "AGAINST" ? p.votesAgainst + voteWeight : p.votesAgainst;
          const updatedQuorum = p.quorumCurrent + voteWeight;
          
          return {
            ...p,
            votesFor: updatedFor,
            votesAgainst: updatedAgainst,
            quorumCurrent: updatedQuorum,
            events: [
              ...p.events,
              {
                title: `Cast Vote ${choice} (+250K weight)`,
                date: new Date().toISOString().replace("T", " ").substring(0, 16),
                txHash: "0x" + Math.floor(Math.random() * 900000 + 100000) + "user...tx"
              }
            ]
          };
        }
        return p;
      })
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Executed": return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Succeeded": return "bg-teal-50 text-teal-800 border-teal-200";
      case "Queued": return "bg-blue-50 text-blue-800 border-blue-200";
      case "Defeated": return "bg-rose-50 text-rose-800 border-rose-200";
      default: return "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"; // Active
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" id="governance-monitor">
      {/* Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-indigo-600 animate-pulse" />
            <h2 className="text-lg font-sans font-extrabold text-slate-900">Multisig & Governance Monitor</h2>
          </div>
          <p className="text-xs text-slate-500">
            Real-time consensus audits. Displays proposal states, on-chain execution logs, and quorum milestones for standard DAO contracts.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs flex items-center gap-2.5">
          <Activity className="w-4 h-4 text-emerald-500 animate-spin" />
          <span className="font-bold text-slate-655 text-slate-600">
            Scanning ERC-20 Timelock Controllers...
          </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider mr-1">DAO Token:</span>
        {listSymbols.map((sym) => {
          const count = sym === "All" 
            ? proposalsState.length 
            : proposalsState.filter(p => p.tokenSymbol.toUpperCase() === sym).length;

          return (
            <button
              key={sym}
              onClick={() => setFilterToken(sym)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                filterToken === sym 
                  ? "bg-slate-900 text-white border-slate-900" 
                  : "bg-white text-slate-505 text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{sym === "All" ? "All DAOs" : sym}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                filterToken === sym ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Proposals List (Col 7) */}
        <div className="lg:col-span-12 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProposals.map((p) => {
              const forPct = (p.votesFor / (p.votesFor + p.votesAgainst)) * 100;
              const quorumPct = Math.min(100, (p.quorumCurrent / p.quorumRequired) * 100);
              const userVoteChoice = votedProposals[p.id];

              return (
                <div 
                  key={p.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-slate-350 hover:shadow-md transition duration-150 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Proposal Category Label & Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-indigo-650 text-indigo-600 tracking-wider">
                        {p.tokenSymbol} Governance DAO
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>

                    {/* Proposal Title */}
                    <h3 className="text-sm font-sans font-extrabold text-slate-900 leading-snug">
                      {p.title}
                    </h3>

                    {/* Creator Metadata */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Proposer: <span className="font-mono text-slate-600 font-bold">{p.creator}</span></span>
                    </div>

                    <p className="text-[11px] text-slate-502 text-slate-500 leading-normal line-clamp-3">
                      {p.description}
                    </p>

                    {/* Progress bars for active / proposed items */}
                    <div className="space-y-3 pt-2.5 border-t border-slate-100">
                      {/* FOR vs AGAINST gauge */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-emerald-700">FOR ({(p.votesFor / 1e6).toFixed(1)}M)</span>
                          <span className="text-rose-600">AGAINST ({(p.votesAgainst / 1e6).toFixed(1)}M)</span>
                        </div>
                        <div className="w-full bg-rose-100 h-2 rounded-full overflow-hidden flex">
                          <div className="bg-emerald-500 h-full" style={{ width: `${forPct}%` }} />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                          <span>{forPct.toFixed(1)}% Approval</span>
                          <span>{(100 - forPct).toFixed(1)}% Dissent</span>
                        </div>
                      </div>

                      {/* Quorum indicator */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Quorum Threshold:</span>
                          <span>{quorumCurrentPercentage(p)}% of {(p.quorumRequired / 1e6).toFixed(0)}M</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.quorumCurrent >= p.quorumRequired ? "bg-amber-500 animate-pulse" : "bg-indigo-600"}`} style={{ width: `${quorumPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Interactive casting or logs flow */}
                  <div className="mt-5 border-t border-slate-50 pt-3.5 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      {p.status === "Active" ? (
                        <>
                          <button
                            disabled={!!userVoteChoice}
                            onClick={() => handleCastVote(p.id, "FOR")}
                            className={`px-3 py-1 text-[10px] font-black tracking-tighter uppercase rounded transition cursor-pointer ${
                              userVoteChoice === "FOR" ? "bg-emerald-500 text-white border-transparent" :
                              userVoteChoice ? "opacity-35 cursor-not-allowed bg-slate-100 text-slate-400" :
                              "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
                            }`}
                          >
                            {userVoteChoice === "FOR" ? "✓ Voted FOR" : "Vote FOR"}
                          </button>
                          <button
                            disabled={!!userVoteChoice}
                            onClick={() => handleCastVote(p.id, "AGAINST")}
                            className={`px-3 py-1 text-[10px] font-black tracking-tighter uppercase rounded transition cursor-pointer ${
                              userVoteChoice === "AGAINST" ? "bg-rose-500 text-white border-transparent" :
                              userVoteChoice ? "opacity-35 cursor-not-allowed bg-slate-100 text-slate-400" :
                              "bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            {userVoteChoice === "AGAINST" ? "✓ Voted AGAINST" : "Vote AGAINST"}
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] italic text-slate-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                          Voting window finalized
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedProposalId(selectedProposalId === p.id ? null : p.id)}
                      className="text-[10px] font-extrabold text-indigo-650 text-indigo-600 hover:text-indigo-805 text-indigo-700 flex items-center gap-0.5 cursor-pointer ml-auto"
                    >
                      <span>{selectedProposalId === p.id ? "Hide Logs" : "View Timelock Logs"}</span>
                      <ChevronRight className={`w-3 h-3 transition ${selectedProposalId === p.id ? "rotate-90" : ""}`} />
                    </button>
                  </div>

                  {/* Timelock Sequence Expandable Logs */}
                  {selectedProposalId === p.id && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 bg-slate-50 p-3 rounded-xl">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Timelock Verification Sequence Logs</span>
                      <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-3 text-[10px]">
                        {p.events.map((ev, idx) => (
                          <div key={idx} className="relative">
                            <span className="absolute -left-[20.5px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white" />
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-extrabold text-slate-800 block text-[10px] leading-tight">{ev.title}</span>
                                <span className="font-mono text-slate-400 text-[8px]">Hash: {ev.txHash}</span>
                              </div>
                              <span className="text-[8px] font-mono text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded block">{ev.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200/80">
                        <span className="text-[9px] font-black uppercase text-slate-400 block pb-1">Target Payload Directive</span>
                        <code className="text-[9px] font-mono block bg-slate-900 border border-slate-850 text-emerald-400 p-1.5 rounded select-all whitespace-nowrap overflow-x-auto text-[9px] font-semibold">
                          {p.executionPayload}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function quorumCurrentPercentage(p: GovernanceProposal): number {
  return Math.round((p.quorumCurrent / p.quorumRequired) * 100);
}
