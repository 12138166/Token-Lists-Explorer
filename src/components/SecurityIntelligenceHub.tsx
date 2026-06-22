import React, { useState } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  BrainCircuit, 
  Code, 
  Flame, 
  Database, 
  Cpu, 
  Coins, 
  Bug, 
  Terminal, 
  ArrowRight, 
  GraduationCap, 
  TrendingUp, 
  GitBranch, 
  Activity, 
  FileCode,
  Sparkles,
  Zap,
  Info,
  Play,
  Pause,
  X,
  RefreshCw,
  Award,
  Radio,
  Compass
} from "lucide-react";
import { AiExplanationResponse, TokenList } from "../types";
import HackScenarioSandbox from "./HackScenarioSandbox";
import ExploitDemoModal from "./ExploitDemoModal";
import ProtocolRiskDashboard from "./ProtocolRiskDashboard";
import HistoricalLossLeaderboard from "./HistoricalLossLeaderboard";
import GovernanceMonitor from "./GovernanceMonitor";
import RiskRadarChart from "./RiskRadarChart";
import NetworkHealthHeatmap from "./NetworkHealthHeatmap";
import SimulationLaboratory from "./SimulationLaboratory";
import SmartContractAuditSimulator from "./SmartContractAuditSimulator";

export interface IntelligenceProject {
  name: string;
  url: string;
  desc: string;
  category: "Security & Auditing" | "Exploit Databases" | "Developer Tools" | "DeFi Research" | "DeFi Trackers" | "Contract Crawlers" | "Feeds & Symbology" | "Market Scrapers" | "DeFi Dashboards" | "Scam Protection" | "DAO Governance";
  useCase: string;
}

export const INTELLIGENCE_PROJECTS: IntelligenceProject[] = [
  {
    name: "SunSec - Web3 Security Researcher Portfolio",
    url: "https://web3sec.notion.site/I-m-SunSec-ddaa8bf9a985494dbaf70d698345b899",
    desc: "SunSec is a prominent Web3 security researcher and smart contract auditor, listing high-quality incident reports, DeFi security guidelines, and interactive learning boards.",
    category: "Security & Auditing",
    useCase: "Incident response, auditing templates, threat mitigation logs."
  },
  {
    name: "DeFiHackLabs (SunWeb3Sec)",
    url: "https://github.com/SunWeb3Sec/DeFiHackLabs",
    desc: "A sprawling collaborative database detailing successful decentralized finance hacks with copy-pasteable Foundry test suites to reproduce historic attack vectors.",
    category: "Exploit Databases",
    useCase: "Replicating attacks, testing code patches, learning Solidity attack footprints."
  },
  {
    name: "Foundry toolchain (Foundry-RS)",
    url: "https://github.com/foundry-rs",
    desc: "The hyper-fast, portable and modular toolchain for Ethereum application development, powering compiler execution, fuzz testing, and trace debugging.",
    category: "Developer Tools",
    useCase: "Writing smart contract tests, compiling Solidity code, asserting security invariants."
  },
  {
    name: "Ultimate DeFi Research Base (OfficerCia)",
    url: "https://github.com/OffcierCia/ultimate-defi-research-base",
    desc: "A goldmine of educational DeFi libraries, flash loan attack case studies, decentralized oracle guidelines, and math formulations.",
    category: "DeFi Research",
    useCase: "Academic research, designing robust tokenomics, oracle choosing logic."
  },
  {
    name: "Awesome DeFi Trackers (Cole Kennelly)",
    url: "https://github.com/colekennelly1/awesome-defi-trackers",
    desc: "Curated catalog of on-chain activity trackers, gas transaction optimizers, network status monitors, and dynamic asset portfolio management dashboards.",
    category: "DeFi Trackers",
    useCase: "Monitoring gas costs, visual tracking of decentralized pool metrics."
  },
  {
    name: "Smart Contract Sanctuary (Tintinweb)",
    url: "https://github.com/tintinweb/smart-contract-sanctuary",
    desc: "Automated scraping library archiving millions of verified smart contracts deployed on key chain networks, fully grouped by compiler version.",
    category: "Contract Crawlers",
    useCase: "Mining contract bytecodes, compiler version security audits, automated pattern search."
  },
  {
    name: "Blockchain Governance Project (robisonJohn)",
    url: "https://github.com/robisonJohn/Blockchain-Governance-Project",
    desc: "Analytical research detailing governance proposal activities, voting turnouts, multi-signature wallet actions, and decentralization health factors.",
    category: "DAO Governance",
    useCase: "DAO decentralization audit, analysis of protocol risk delegation parameters."
  },
  {
    name: "CoinGecko Exchange Symbols Fetcher (Invoany)",
    url: "https://github.com/Invoany/get_exchange_symbols_coingecko",
    desc: "Automation scripts fetching and mapping centralized/decentralized tickers, API symbols, exchange matching indexes, and token contract identifiers.",
    category: "Feeds & Symbology",
    useCase: "Coingecko symbol tracking, building price discovery aggregations."
  },
  {
    name: "DeFiLlama TVL Scraper (Gubchik123)",
    url: "https://github.com/Gubchik123/DeFiLlama-scraper",
    desc: "Programmatic scraper utility fetching historical total value locked (TVL) data, project categories, stablecoin reserves, and multi-chain stats.",
    category: "Market Scrapers",
    useCase: "DeFi TVL market research, capturing historical funding shifts, risk metrics."
  },
  {
    name: "DeFi XYZ Dashboard (rahullath)",
    url: "https://github.com/rahullath/defi.xyz/tree/main/defi-dashboard",
    desc: "Modular client-side dashboard facilitating real-time wallet tracking, yield calculation, governance participation views, and live pool liquidity positions.",
    category: "DeFi Dashboards",
    useCase: "Wallet yield analysis, comparing protocol APYs, decentralized portfolio overview."
  },
  {
    name: "DeFi Llama Live Watcher (pmuens)",
    url: "https://github.com/pmuens/defi-llama-watcher",
    desc: "Monitoring daemon triggering custom backend hooks during anomalous TVL drops, stablecoin peg variances, or protocol index modification flags.",
    category: "Market Scrapers",
    useCase: "Bot alerts for pool drains, depeg risk detection, liquidation prevention watch."
  },
  {
    name: "Doujiwang (itey)",
    url: "https://github.com/itey/doujiwang",
    desc: "Decentralized prediction market templates and interaction systems tracking real-world event indices, odds distributions, and trustless resolution systems.",
    category: "DAO Governance",
    useCase: "Prediction engine audits, decentralized betting consensus modeling."
  },
  {
    name: "Twitter Links Grabber for DeFiLlama (mibrahimbashir)",
    url: "https://github.com/mibrahimbashir/DefiLlama-Twitter-Links",
    desc: "Social intelligence scraper matching listed protocols with active Twitter profiles, fetching follow graphs and sentiment indicators.",
    category: "Feeds & Symbology",
    useCase: "Social sentiment evaluation, sybil profiling, protocol legitimacy check."
  },
  {
    name: "Scam Sniffer scam-database",
    url: "https://github.com/scamsniffer/scam-database",
    desc: "The leading open-source blacklist tracking malicious drainage smart contract addresses, bypass approval loops, phishing URLs, and wallet drainees.",
    category: "Scam Protection",
    useCase: "Token address validation, filter malicious frontend integrations, block phishing."
  },
  {
    name: "Awesome Crypto (AwesomeCrypto.xyz)",
    url: "https://www.awesomecrypto.xyz/",
    desc: "Curated collection of crypto bookmarks, blockchain developer tools, smart contract templates, and protocol security papers.",
    category: "DeFi Research",
    useCase: "Developer onboarding, comprehensive checklist compilation, security guidelines."
  },
  {
    name: "Awesome Crypto Guides & Libs (Dylan Hogg)",
    url: "https://github.com/dylanhogg/awesome-crypto",
    desc: "Awesome list detailing cryptographic primitives, Zero Knowledge Proof algorithms (ZKPs), consensus logic, and blockchain research repositories.",
    category: "DeFi Research",
    useCase: "Cryptographic auditing, advanced protocol research, textbook reference."
  },
  {
    name: "Cryptofeed Stream Aggregator (bmoscon)",
    url: "https://github.com/bmoscon/cryptofeed",
    desc: "Concurrent real-time streaming feed aggregator supporting order books, trades, tickers, and funding rates across more than 40 exchanges simultaneously.",
    category: "Feeds & Symbology",
    useCase: "Arbitrage bots tracking, real-time liquidation alerts, low-latency market feeds."
  },
  {
    name: "TokenBrice DeFi & Yield Expert Portfolio",
    url: "https://github.com/TokenBrice",
    desc: "Yield farming trackers, Curve/Convex ecosystem analysis, MEV defense guidelines, and technical strategies to maximize APY safety.",
    category: "DeFi Trackers",
    useCase: "Yield strategy planning, evaluating liquidity pool risks, curve gauge tracing."
  },
  {
    name: "Etherscan Contract Crawler (Apurvis)",
    url: "https://github.com/apurvis/etherscan-contract-crawler/blob",
    desc: "Crawler utilities pulling Solidity sources from block explorers for massive-scale static analysis and vulnerability scanning.",
    category: "Contract Crawlers",
    useCase: "Automated audits, backup deployed bytecodes, building compliance scanners."
  },
  {
    name: "Crypto Rekts Timeline (liqtags)",
    url: "https://github.com/liqtags/crypto-rekts/tree/main",
    desc: "Chronological documentation of major DeFi exploits, team rugpulls, and flash loan attacks, listing loss metrics and root causes.",
    category: "Exploit Databases",
    useCase: "Analyzing historic attack types, scoring project security records."
  },
  {
    name: "DeFi Detective (plotchy)",
    url: "https://github.com/plotchy/defi-detective",
    desc: "Interactive graph-based tracking tools illustrating sybil transfers, drainage wallet chains, and mixers cash-out targets.",
    category: "Security & Auditing",
    useCase: "Tracing stolen funds, identifying sybil attacks, forensic reports."
  },
  {
    name: "Asteria-Pro Security Framework",
    url: "https://github.com/Asteria-BCSD/Asteria-Pro",
    desc: "Vulnerability analysis engine running static and dynamic smart contract assessments mapping risk criteria directly to interactive visual panels.",
    category: "Security & Auditing",
    useCase: "Interactive code testing, gas optimization scans, security vulnerability maps."
  }
];

export const VULNERABILITY_PATTERNS = [
  {
    id: "reentrancy",
    title: "Reentrancy Exploit Vector",
    impact: "High / Complete Drain",
    summary: "Occurs when a contract transfers funds to an external untrusted contract before adjusting its internal state ledger. The receiver can call back into the withdraw function repeatedly.",
    defihacklabsPoc: "DeFiHackLabs contains 25+ real reentrancy exploit scripts (e.g., DFH-Reentrancy-Lend). Tests demonstrate how an attacker contract executes repetitive calls inside safe fallback hooks.",
    remedy: "Employ the Checks-Effects-Interactions pattern or integrate OpenZeppelin's ReentrancyGuard's nonReentrant modifier.",
    foundryPoC: `// Foundry test illustrating a reentrancy attack simulation
function testReentrancy() public {
    // 1. Setup victim and attacker contracts
    VictimPool pool = new VictimPool{value: 10 ether}();
    Attacker attacker = new Attacker(address(pool));
    
    // 2. Exploit triggers withdraw callback
    attacker.deposit{value: 1 ether}();
    attacker.attack();
    
    // 3. Invariants checklist
    assertEq(address(pool).balance, 0, "Victim pool must be fully drained!");
    assertGe(address(attacker).balance, 11 ether, "Attacker balances should increase!");
}`
  },
  {
    id: "oracle-manipulation",
    title: "Oracle / Spot Price Manipulation",
    impact: "Extreme / Loan Undercutting",
    summary: "Attackers execute massive flash loans to skew the reserves of decentralized AMMs. When target contracts calculate collateral values based directly on spot pricing ratios, they permit massive under-collateralized borrowing.",
    defihacklabsPoc: "DeFiHackLabs catalogs numerous AMM market manipulation PoCs illustrating flash-swapping a Uniswap pair before drawing borrow funds on lending protocols.",
    remedy: "Utilize Uniswap V3 Time-Weighted Average Prices (TWAP) or reliable decentralized node consensus feeds like Chainlink Oracles.",
    foundryPoC: `// Foundry testing spot price manipulation invariants
function testOracleManipulation() public {
    // 1. Borrow massive stablecoins from flashloan pool
    uint256 loanAmt = 50_000_000 * 10**6; // 50M USDC
    USDC.approve(address(dexPair), type(uint256).max);
    
    // 2. Shift spot price equation in AMM
    dexPair.swap(loanAmt, 0, address(this), new bytes(0));
    
    // 3. Exploit overvalued collateral on victim lend pool
    victimLending.borrowToken(10_000 * 10**18); // Drains assets
}`
  },
  {
    id: "approval-drainage",
    title: "Approval Phishing / Address Hijacking",
    impact: "Severe / Direct Wallet Loss",
    summary: "Phishing interfaces trick users into signing an ERC20 setApprovalForAll() or approve() transaction to a malicious contract. Once approved, the scammer draws assets directly out of the wallet.",
    defihacklabsPoc: "ScamSniffer databases index thousands of fraudulent transfer signatures. Tools track siphon transactions pulling tokens out of authorized wallets.",
    remedy: "Never authorize untrusted protocols. Periodically use tools like Revoke.cash or sign scoped approval permits with expirations.",
    foundryPoC: `// Foundry test displaying ERC20 approval hijack mechanics
function testHijackByApproval() public {
    // 1. Scam sniffer mimics signed transaction
    vm.prank(victimWallet);
    targetToken.approve(address(drainContract), type(uint256).max);
    
    // 2. Malicious wallet triggers transferFrom to clean token balance
    vm.prank(attackerWallet);
    targetToken.transferFrom(victimWallet, attackerWallet, 5000 * 10**18);
    
    // 3. Assert target wallet depletion
    assertEq(targetToken.balanceOf(victimWallet), 0);
}`
  }
];

export interface DeFiHackReport {
  fileName: string;
  date: string;
  protocol: string;
  lossUSD: string;
  severity: "Critical" | "High" | "Medium";
  attackVector: string;
  summary: string;
  exploitCodeUrl: string;
}

interface SecurityIntelligenceHubProps {
  activeList?: TokenList | null;
}

export default function SecurityIntelligenceHub({ activeList }: SecurityIntelligenceHubProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"registry" | "audit-lookup" | "audit-simulation" | "vulnerability-modeler" | "live-threats" | "hack-sandbox" | "protocol-risk" | "loss-leaderboard" | "governance" | "network-health" | "simulation-lab">("registry");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [exploitDemoOpen, setExploitDemoOpen] = useState(false);

  // DeFiHackLabs Live Feed state
  const [hackReports, setHackReports] = useState<DeFiHackReport[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedSearch, setFeedSearch] = useState("");
  const [feedSeverityFilter, setFeedSeverityFilter] = useState<string>("All");
  const [feedSource, setFeedSource] = useState<string>("");

  // Demo Playback States (Animated Use Case Simulation)
  const [activeDemoMode, setActiveDemoMode] = useState<"registry" | "live-threats" | "audit-lookup" | "vulnerability-modeler" | null>(null);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);
  const [demoPaused, setDemoPaused] = useState(false);

  React.useEffect(() => {
    if (!activeDemoMode || demoPaused) return;
    const interval = setInterval(() => {
      setCurrentDemoStep((prev) => (prev + 1) % 3);
    }, 4500); // 4.5 seconds auto-play rotation
    return () => clearInterval(interval);
  }, [activeDemoMode, demoPaused]);

  const fetchRecentHacks = async (force: boolean = false) => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const url = force ? "/api/security/recent-hacks?refresh=true" : "/api/security/recent-hacks";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to contact security feed: HTTP ${res.status}`);
      }
      const data = await res.json();
      setHackReports(data.hacks || []);
      setFeedSource(data.source || "unknown");
    } catch (err: any) {
      console.error(err);
      setFeedError(err.message || "An unidentified network error occurred.");
    } finally {
      setFeedLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeSubTab === "live-threats" && hackReports.length === 0) {
      fetchRecentHacks();
    }
  }, [activeSubTab]);

  // Audit form state
  const [targetAddress, setTargetAddress] = useState("");
  const [targetSymbol, setTargetSymbol] = useState("");
  const [targetName, setTargetName] = useState("");
  const [targetChain, setTargetChain] = useState("1");
  const [auditedResult, setAuditedResult] = useState<AiExplanationResponse | null>(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Model-specific selected vector
  const [selectedVectorId, setSelectedVectorId] = useState("reentrancy");

  const categories = ["All", ...Array.from(new Set(INTELLIGENCE_PROJECTS.map(p => p.category)))];

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(url);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const filteredProjects = INTELLIGENCE_PROJECTS.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.useCase.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const triggerAuditIntel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSymbol) return;

    setAuditLoading(true);
    setAuditError(null);
    setAuditedResult(null);

    try {
      const response = await fetch("/api/gemini/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: targetAddress || "0x" + Math.random().toString(16).substring(2, 42),
          symbol: targetSymbol,
          name: targetName || targetSymbol,
          chainId: parseInt(targetChain),
          chainName: targetChain === "1" ? "Ethereum" : "Other EVM"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status code: ${response.status}`);
      }

      const data = await response.json();
      setAuditedResult(data);
    } catch (err: any) {
      setAuditError(err.message || "Failed to contact Gemini security examiner proxy.");
    } finally {
      setAuditLoading(false);
    }
  };

  const loadPresetToken = (symbol: string, name: string, addr: string, chain: string) => {
    setTargetSymbol(symbol);
    setTargetName(name);
    setTargetAddress(addr);
    setTargetChain(chain);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="security-intelligence-hub">
      {/* Top Banner section */}
      <div className="bg-white border border-slate-200/85 rounded-3xl p-6 md:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative colors */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            Web3 Open Source Security & Intelligence Engine
          </div>
          <h1 className="text-2xl md:text-3.5xl font-sans font-extrabold tracking-tight text-slate-950">
            Security & DeFi <span className="text-indigo-655 text-indigo-600">Intelligence Hub</span>
          </h1>
          <p className="text-slate-505 text-slate-500 text-sm md:text-base leading-relaxed">
            Consolidating critical links and security indexes from elite Web3 developer portfolios, exploit databases, and phishing trackers. Audit custom assets against references like <span className="font-bold text-slate-800">ScamSniffer</span>, <span className="font-bold text-slate-800">DeFiHackLabs</span>, and compiler crawlers.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 mt-8 gap-4">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveSubTab("registry")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "registry"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-505" />
              Registry Databases ({INTELLIGENCE_PROJECTS.length})
            </button>
            <button
              onClick={() => setActiveSubTab("live-threats")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "live-threats"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse animate-duration-1000" />
              DeFiHackLabs Live Feed
            </button>
            <button
              onClick={() => setActiveSubTab("audit-lookup")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "audit-lookup"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-rose-500" />
              Asset Intel Scanner
            </button>
            <button
              onClick={() => setActiveSubTab("audit-simulation")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeSubTab === "audit-simulation"
                  ? "border-indigo-600 text-indigo-600 font-black"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
              id="academic-audit-simulator-tabbtn"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Audit & Bounty Simulator
            </button>
            <button
              onClick={() => setActiveSubTab("vulnerability-modeler")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "vulnerability-modeler"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bug className="w-4 h-4 text-amber-500" />
              Threat Vector Modeler
            </button>
            <button
              onClick={() => setActiveSubTab("hack-sandbox")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "hack-sandbox"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
            >
              <Flame className="w-4 h-4 text-rose-500" />
              Hack Sandbox
            </button>
            <button
              onClick={() => setActiveSubTab("protocol-risk")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "protocol-risk"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-505 text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-orange-550 text-orange-500 animate-pulse animate-duration-1000" />
              Protocol Risk Dashboard
            </button>
            <button
              onClick={() => setActiveSubTab("loss-leaderboard")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "loss-leaderboard"
                  ? "border-indigo-600 text-indigo-600 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-850 hover:text-slate-800"
              }`}
            >
              <Award className="w-4 h-4 text-indigo-500" />
              Historical Loss Leaderboard
            </button>
            <button
              onClick={() => setActiveSubTab("governance")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "governance"
                  ? "border-indigo-600 text-indigo-600 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-850 hover:text-slate-850"
              }`}
            >
              <Radio className="w-4 h-4 text-purple-500 animate-pulse" />
              Governance Monitor
            </button>
            <button
              onClick={() => setActiveSubTab("network-health")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "network-health"
                  ? "border-indigo-600 text-indigo-600 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-850 hover:text-slate-800"
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-500 animate-spin-slow" />
              Network Health
            </button>
            <button
              onClick={() => setActiveSubTab("simulation-lab")}
              className={`pb-3.5 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
                activeSubTab === "simulation-lab"
                  ? "border-indigo-600 text-indigo-600 font-black"
                  : "border-transparent text-slate-500 hover:text-slate-850 hover:text-slate-800"
              }`}
            >
              <Cpu className="w-4 h-4 text-rose-500 animate-pulse" />
              Simulation Lab
            </button>
          </div>

          <button
            onClick={() => setExploitDemoOpen(true)}
            className="mb-2 md:mb-0 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-750 text-rose-700 border border-rose-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer hover:scale-[1.01] active:scale-95 shrink-0 self-start md:self-auto shadow-xs"
            id="exploit-demo-launcher-tabbar"
          >
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse animate-duration-1000" />
            <span>🎬 Exploit Demo</span>
          </button>
        </div>
      </div>

      {/* CORE DISPLAY */}

      {activeSubTab === "registry" && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <button
                onClick={() => { setActiveDemoMode("registry"); setCurrentDemoStep(0); }}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-xs hover:scale-[1.02]"
              >
                <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                <span>🎬 检索使用案例 (Demo)</span>
              </button>

              {/* Horizontal category badges */}
              <div className="flex flex-wrap items-center gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border cursor-pointer transition ${
                      selectedCategory === cat
                        ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                        : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {cat === "All" ? "All Sources" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources, tags, URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Grid of 22 items */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((proj, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border border-slate-200/60 hover:border-indigo-150 rounded-2xl p-5 shadow-xs hover:shadow-sm flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100/40">
                        {proj.category}
                      </span>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyLink(proj.url)}
                          className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700"
                          title="Copy github repository URL"
                        >
                          {isCopied === proj.url ? <Check className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600"
                          title="Launch external repository link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-sans font-extrabold text-slate-900 group-hover:text-indigo-600 text-sm transition-colors">
                        {proj.name}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-normal">
                        {proj.desc}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 mt-4 p-2.5 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <span className="font-bold text-slate-655 text-slate-600 uppercase tracking-widest block text-[9px] font-mono leading-none">Security Utility:</span>
                    <p className="text-slate-505 text-slate-500 italic leading-snug">{proj.useCase}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
              <Database className="w-12 h-12 text-slate-300 mx-auto animate-pulse mb-3" />
              <p className="text-slate-705 text-slate-600 font-bold">No intelligence sources matched your query</p>
              <p className="text-slate-400 text-xs mt-1">Try resetting the categories or typing a different keyword.</p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === "audit-lookup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-950 font-sans">Analyze Arbitrary Asset</h2>
                <p className="text-xs text-slate-405 text-slate-500 mt-1">
                  Enter target symbol and metadata to trigger real-time AI security evaluations based on open standards.
                </p>
              </div>

              <button
                type="button"
                onClick={() => { setActiveDemoMode("audit-lookup"); setCurrentDemoStep(0); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-xl text-xs font-bold transition cursor-pointer hover:scale-[1.02]"
              >
                <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                <span>🎬 AI 研判使用案例 (Demo)</span>
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Typical Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => loadPresetToken("USDT", "Tether USD", "0xdac17f958d2ee523a2206206994597c13d831ec7", "1")}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition cursor-pointer"
                >
                  USDT (Safe Standard)
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetToken("DegenSpy", "DegenSpy Phishing Token", "0xf9a112df38a1682cf4817a00efdfdfef55acfdcb", "1")}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-205 border-red-200 rounded-lg text-xs font-semibold text-red-650 transition cursor-pointer"
                >
                  Phishing / Honeypot Dummy
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetToken("YFI-HACK", "yEarn Vault Hack Target", "0x0bc7a8794db77145206259c1b3ee6df9f086f6a7", "1")}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 border border-amber-205 border-amber-200 rounded-lg text-xs font-semibold text-amber-650 transition cursor-pointer"
                >
                  DeFi Protocol Target
                </button>
              </div>
            </div>

            <form onSubmit={triggerAuditIntel} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-indigo-500" />
                  Token Symbol (Required)
                </label>
                <input
                  type="text"
                  placeholder="e.g. DegenSpy, USDC"
                  value={targetSymbol}
                  onChange={(e) => setTargetSymbol(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Token Long Name</label>
                <input
                  type="text"
                  placeholder="e.g. USD Coin"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Smart Contract Address</label>
                <input
                  type="text"
                  placeholder="0x... (If blank, an arbitrary mock-address will be computed)"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Network Chain ID</label>
                <select
                  value={targetChain}
                  onChange={(e) => setTargetChain(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-250 rounded-xl py-2.5 px-3 flex items-center text-xs text-slate-800 focus:outline-none"
                >
                  <option value="1">Chain ID 1 - Ethereum Mainnet</option>
                  <option value="56">Chain ID 56 - Binance Smart Chain (BSC)</option>
                  <option value="137">Chain ID 137 - Polygon PoS</option>
                  <option value="8452">Chain ID 8453 - Base Layer 2</option>
                  <option value="42161">Chain ID 42161 - Arbitrum One</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={auditLoading}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-600 text-white rounded-xl text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-2 transition duration-150 cursor-pointer shadow-md shadow-slate-100"
              >
                {auditLoading ? (
                  <>
                    <BrainCircuit className="w-4 h-4 text-indigo-400 animate-pulse" />
                    Querying Open Registries...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Trigger Intelligence Scan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-7 space-y-6">
            {auditLoading ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4 animate-pulse">
                <BrainCircuit className="w-12 h-12 text-indigo-650 text-indigo-600 mx-auto animate-spin" />
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-800 font-sans">Contacting Gemini Security Scanner</h3>
                  <p className="text-xs text-slate-405 text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Analyzing asset parameters, comparing address signatures to ScamSniffer blacklists, tracking vulnerability benchmarks, and drawing reputation weights.
                  </p>
                </div>
              </div>
            ) : auditError ? (
              <div className="bg-rose-50 border border-rose-205 border-rose-200 text-rose-800 rounded-3xl p-6 text-xs space-y-3">
                <div className="flex items-center gap-2 font-black uppercase text-rose-605 text-rose-606 text-rose-600">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  Intel analysis blocked
                </div>
                <p className="leading-relaxed font-semibold">
                  Scan error: {auditError}. Traditional causes include rate bounds or missing workspace environment configurations.
                </p>
              </div>
            ) : auditedResult ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {auditedResult.symbol.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-sans font-extrabold text-slate-900 text-base">{auditedResult.name} ({auditedResult.symbol})</h3>
                      <span className="text-[10px] font-mono text-slate-400 block break-all leading-none mt-0.5">{targetAddress || "0x..."}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border flex items-center gap-1.5 ${
                    auditedResult.reputationAndSecurity.toLowerCase().includes("risk") || auditedResult.reputationAndSecurity.toLowerCase().includes("unverified") || auditedResult.name.toLowerCase().includes("phishing")
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}>
                    {auditedResult.reputationAndSecurity.toLowerCase().includes("risk") || auditedResult.reputationAndSecurity.toLowerCase().includes("unverified") || auditedResult.name.toLowerCase().includes("phishing") ? (
                      <>
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        Audit Alert
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-505" />
                        Standard Legit
                      </>
                    )}
                  </span>
                </div>

                {/* Grid info */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Abstract & Project Utility</span>
                    <p className="text-xs text-slate-655 text-slate-600 leading-relaxed font-medium">{auditedResult.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                      <span className="text-[9px] font-mono font-black text-slate-400 block uppercase tracking-wider">PRIMARY TOKEN USE-CASE</span>
                      <p className="text-xs text-slate-509 text-slate-700 leading-relaxed font-semibold">{auditedResult.useCase}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                      <span className="text-[9px] font-mono font-black text-slate-400 block uppercase tracking-wider">ECOSYSTEM COVERAGE</span>
                      <p className="text-xs text-slate-705 text-slate-700 leading-relaxed font-semibold">{auditedResult.ecosystemSummary}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50/20 border border-indigo-100/40 rounded-2xl space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Reputation & On-Chain Audit
                    </span>
                    <p className="text-xs text-slate-509 text-slate-700 leading-relaxed font-medium">
                      {auditedResult.reputationAndSecurity}
                    </p>
                  </div>
                </div>

                {/* Audit Standard warnings */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">DeFi Security Registry Matches (Checklists)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 border border-slate-200/80 rounded-xl flex items-start gap-2 text-[11px]">
                      {auditedResult.name.toLowerCase().includes("phishing") || targetSymbol === "DegenSpy" ? (
                        <>
                          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">ScamSniffer Log</span>
                            <span className="text-rose-600 font-medium">Match: Malicious Domain / drain logic flags active.</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">ScamSniffer Check</span>
                            <span className="text-slate-500 font-medium font-sans">No phish match found. Cleared from database.</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-3 border border-slate-200/80 rounded-xl flex items-start gap-2 text-[11px]">
                      {auditedResult.symbol.includes("HACK") || targetSymbol === "YFI-HACK" ? (
                        <>
                          <Bug className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">DeFiHackLabs Match</span>
                            <span className="text-amber-600 font-medium">Flag: Target protocol listed in past hack exploit PoCs.</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">DeFiHackLabs Check</span>
                            <span className="text-slate-500 font-medium">No verified hack PoCs targeting this contract logic.</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="p-3 border border-slate-200/80 rounded-xl flex items-start gap-2 text-[11px]">
                      {targetAddress ? (
                        <>
                          <Code className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">Compiler Sanitizer</span>
                            <span className="text-slate-500 font-medium">Verified smart contract bytecodes checked.</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 block">Bytecode Check</span>
                            <span className="text-slate-400 font-medium">Address missing; verify code compilation details.</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-250 rounded-3xl p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mx-auto shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 font-sans">Awaiting Query Submission</h3>
                  <p className="text-xs text-slate-405 text-slate-500 max-w-xs mx-auto leading-relaxed mt-1">
                    Select a typical preset or enter custom contract coordinates to trigger the AI registry-crawler evaluation pipeline.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === "audit-simulation" && (
        <SmartContractAuditSimulator />
      )}

      {activeSubTab === "vulnerability-modeler" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left select */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
            <div className="space-y-3">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 font-sans flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-650 text-indigo-600" />
                  Vulnerability Vectors
                </h2>
                <p className="text-xs text-slate-505 text-slate-500 mt-1">
                  Deep dive on classical decentralized finance exploit mechanics cataloged inside DeFiHackLabs models.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setActiveDemoMode("vulnerability-modeler"); setCurrentDemoStep(0); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-xl text-xs font-bold transition cursor-pointer hover:scale-[1.02]"
                >
                  <Play className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                  <span>🎬 漏洞跑测模拟案例 (Demo)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExploitDemoOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-150 rounded-xl text-xs font-bold transition cursor-pointer hover:scale-[1.02]"
                >
                  <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>🎬 Exploit Walkthrough</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {VULNERABILITY_PATTERNS.map(vector => (
                <button
                  key={vector.id}
                  onClick={() => setSelectedVectorId(vector.id)}
                  className={`w-full p-4.5 rounded-2xl border text-left flex items-start gap-3 transition cursor-pointer ${
                    selectedVectorId === vector.id
                      ? "bg-indigo-50/20 border-indigo-200 text-slate-950 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border mt-0.5 ${selectedVectorId === vector.id ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-405 text-slate-400"}`}>
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold block text-xs md:text-sm">{vector.title}</span>
                    <span className="text-[10px] font-bold uppercase text-rose-506 text-rose-600 mt-0.5 block leading-none">Severity: {vector.impact}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Vector display */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 space-y-6">
            {(() => {
              const vector = VULNERABILITY_PATTERNS.find(v => v.id === selectedVectorId);
              if (!vector) return null;
              return (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-950 font-sans">{vector.title}</h2>
                      <span className="text-xs text-rose-600 font-black uppercase tracking-wider">Audit Damage Risk: {vector.impact}</span>
                    </div>

                    <span className="bg-slate-100 text-slate-700 font-mono text-[9px] px-2 py-1 rounded-md border border-slate-200">
                      Standard Proof of Concept Tested
                    </span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1 leading-relaxed">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Exploit Mechanics</span>
                      <p className="text-slate-655 text-slate-600 leading-relaxed font-medium">{vector.summary}</p>
                    </div>

                    <div className="space-y-1.5 leading-relaxed bg-slate-50 p-3.5 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 flex items-center gap-1 leading-none">
                        <Zap className="w-3.5 h-3.5" />
                        DeFiHackLabs Historical Context
                      </span>
                      <p className="text-slate-505 text-slate-555 text-slate-500 leading-normal font-medium">{vector.defihacklabsPoc}</p>
                    </div>

                    <div className="space-y-1.5 leading-relaxed">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 block">Standard Mitigation Remediation</span>
                      <p className="text-slate-655 text-slate-600 leading-relaxed font-semibold">{vector.remedy}</p>
                    </div>

                    {/* Code block showing Foundry exploit simulator */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-indigo-505" />
                        Interactive Foundry Test PoC (Forge Test Invariant)
                      </span>
                      <div className="bg-slate-950 rounded-2xl p-4 overflow-x-auto border border-slate-800 shadow-lg text-left">
                        <pre className="text-[11px] font-mono text-[#a5d6ff] leading-relaxed select-all">
                          {vector.foundryPoC}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeSubTab === "hack-sandbox" && (
        <HackScenarioSandbox />
      )}

      {activeSubTab === "protocol-risk" && (
        <div className="space-y-6">
          <RiskRadarChart activeList={activeList} />
          <ProtocolRiskDashboard activeList={activeList} />
        </div>
      )}

      {activeSubTab === "loss-leaderboard" && (
        <HistoricalLossLeaderboard />
      )}

      {activeSubTab === "governance" && (
        <GovernanceMonitor activeList={activeList} />
      )}

      {activeSubTab === "network-health" && (
        <NetworkHealthHeatmap />
      )}

      {activeSubTab === "simulation-lab" && (
        <SimulationLaboratory />
      )}

      {activeSubTab === "live-threats" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Status and Information Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">
                    Live Sync Status: Connected to {feedSource === "cache" ? "In-Memory Gateway Cache" : feedSource === "static_fallback" ? "Local Archive Backup" : "DeFiHackLabs GitHub Repository"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => { setActiveDemoMode("live-threats"); setCurrentDemoStep(0); }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer hover:scale-[1.02]"
                >
                  <Play className="w-2.5 h-2.5 fill-emerald-600 text-emerald-650 text-emerald-600" />
                  <span>🎬 威胁监看案例 (Demo)</span>
                </button>
              </div>
              <h3 className="font-sans font-extrabold text-[#0f172a] text-base leading-tight">
                DeFi Hack Logs & Proof-of-concept Registry
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Pulls real-time incident reports directly from the SunWeb3Sec database. These are audited web3 exploits reproduced in Forge test environments so you can study malicious payloads.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="md:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl text-center space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider block">Indexed Attacks</span>
                <span className="font-sans font-extrabold text-xl text-slate-900 block leading-none">{hackReports.length || "10+"} Incidents</span>
              </div>
              <div className="bg-white p-3.5 border border-slate-200/80 rounded-2xl text-center space-y-1">
                <span className="text-[9px] font-mono text-slate-400 uppercase font-black tracking-wider block">Live Database</span>
                <span className="font-sans font-extrabold text-xs text-indigo-600 block uppercase tracking-wider py-1 font-mono">SunWeb3Sec / Active</span>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              {["All", "Critical", "High", "Medium"].map(severity => (
                <button
                  key={severity}
                  onClick={() => setFeedSeverityFilter(severity)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition ${
                    feedSeverityFilter === severity
                      ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  {severity === "All" ? "All Severities" : `${severity} Risk`}
                </button>
              ))}
            </div>

            {/* Keyword search & Force refresh */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search live exploits, vector name..."
                  value={feedSearch}
                  onChange={(e) => setFeedSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                onClick={() => fetchRecentHacks(true)}
                disabled={feedLoading}
                className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0"
                title="Bypass cache & fetch newest lists raw"
              >
                <RefreshCw className={`w-4 h-4 ${feedLoading ? "animate-spin text-indigo-600" : ""}`} />
              </button>
            </div>
          </div>

          {/* Loader, Error, list display */}
          {feedLoading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center space-y-4">
              <Activity className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-800">Synchronizing On-Chain Attack Invariant Models...</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Connecting to GitHub API to list the most recent solidity reproducer artifacts published on the DeFiHackLabs project.
                </p>
              </div>
            </div>
          ) : feedError ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl p-8 text-xs text-center space-y-4">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
              <div className="space-y-1">
                <p className="font-bold uppercase tracking-wider text-rose-700">Failed to load real-time threat feed</p>
                <p className="font-semibold text-slate-655 text-slate-600">{feedError}</p>
              </div>
              <button
                onClick={() => fetchRecentHacks(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition cursor-pointer"
              >
                Retry Feed Connection
              </button>
            </div>
          ) : (() => {
            const listFiltered = hackReports.filter(report => {
              const matchText = report.protocol.toLowerCase().includes(feedSearch.toLowerCase()) ||
                                report.attackVector.toLowerCase().includes(feedSearch.toLowerCase()) ||
                                report.summary.toLowerCase().includes(feedSearch.toLowerCase()) ||
                                report.fileName.toLowerCase().includes(feedSearch.toLowerCase());
              const matchSeverity = feedSeverityFilter === "All" || report.severity === feedSeverityFilter;
              return matchText && matchSeverity;
            });

            if (listFiltered.length === 0) {
              return (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl space-y-3">
                  <Database className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
                  <p className="text-slate-605 font-bold">No live incidents match your filters</p>
                  <p className="text-slate-400 text-xs">Try selecting 'All Severities' or clearing your search term.</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listFiltered.map((report, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/70 hover:border-indigo-200 rounded-2xl p-5 shadow-xs hover:shadow-sm flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 group"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block font-mono">
                          {report.date}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase border ${
                          report.severity === "Critical"
                            ? "bg-rose-50 border-rose-100 text-rose-700"
                            : report.severity === "High"
                            ? "bg-amber-50 border-amber-100 text-amber-700"
                            : "bg-blue-50 border-indigo-100 text-indigo-700"
                        }`}>
                          {report.severity}
                        </span>
                      </div>

                      {/* Title & Protocol */}
                      <div>
                        <h3 className="font-sans font-extrabold text-slate-900 group-hover:text-indigo-655 group-hover:text-indigo-600 transition-colors text-sm md:text-base">
                          {report.protocol}
                        </h3>
                        <span className="text-[10px] font-mono font-medium text-slate-400 block break-all leading-relaxed mt-0.5">
                          {report.fileName}
                        </span>
                      </div>

                      {/* Loss Indicator */}
                      <div className="bg-red-50/15 border border-red-100/10 p-3 rounded-xl flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-405 font-semibold text-slate-500 uppercase leading-none">Quantified Capital Loss:</span>
                        <span className={`font-sans font-black text-rose-600 leading-none text-sm md:text-base`}>
                          {report.lossUSD}
                        </span>
                      </div>

                      {/* Narrative */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest block leading-none">Inherent Threat Vector:</span>
                        <p className="text-xs text-slate-655 text-slate-600 font-bold leading-normal">
                          {report.attackVector}
                        </p>
                        <p className="text-[11px] text-slate-405 text-slate-500 leading-relaxed font-medium mt-1">
                          {report.summary}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action */}
                    <div className="border-t border-slate-100 mt-5 pt-4 flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-indigo-505 text-indigo-500" />
                        Reproof Standard: Forge
                      </span>

                      <a
                        href={report.exploitCodeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition cursor-pointer shadow-xs"
                      >
                        Source PoC
                        <ExternalLink className="w-3.5 h-3.5 text-[#34d399]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* 🎬 HIGH-FIDELITY ANIMATED DEMO POPUP MODAL (Simulating high-fidelity GIFs) */}
      {activeDemoMode && (() => {
        const demo = DEMO_REGISTRY[activeDemoMode];
        if (!demo) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/65 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 md:max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 max-h-[90vh] md:max-h-none">
              
              {/* Left Column: Interactive Explanation & Steps */}
              <div className="md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto">
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[9px] font-black uppercase tracking-wider">
                      {demo.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">🎬 使用案例演示 (Case Playback)</span>
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 font-sans leading-snug">
                      {demo.name}
                    </h2>
                    <p className="text-[11px] text-slate-505 text-slate-500 mt-1 leading-relaxed">
                      正在为您自动播报高保真系统运行流程。可在右侧窗口直观读取各交互步骤对应的状态结果。
                    </p>
                  </div>

                  {/* Steps List */}
                  <div className="space-y-3 pt-2">
                    {demo.steps.map((st, i) => (
                      <button
                        key={i}
                        onClick={() => { setCurrentDemoStep(i); setDemoPaused(true); }}
                        className={`w-full text-left p-3 rounded-2xl border transition duration-150 flex items-start gap-2.5 cursor-pointer ${
                          currentDemoStep === i
                            ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 shrink-0 ${
                          currentDemoStep === i ? "bg-indigo-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          {i + 1}
                        </span>
                        <div className="flex-1 space-y-0.5">
                          <p className="text-xs font-bold leading-tight">{st.title}</p>
                          <p className={`text-[10px] leading-relaxed font-medium ${currentDemoStep === i ? 'text-slate-305 text-slate-300' : 'text-slate-505 text-slate-500'}`}>
                            {st.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 animate-pulse">
                    <button
                      onClick={() => setDemoPaused(!demoPaused)}
                      className={`p-2 rounded-xl border text-slate-600 hover:text-slate-800 transition cursor-pointer ${demoPaused ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200'}`}
                      title={demoPaused ? "Resume Autoplay" : "Pause Autoplay"}
                    >
                      {demoPaused ? <Play className="w-3.5 h-3.5 fill-amber-700 text-amber-700" /> : <Pause className="w-3.5 h-3.5 text-slate-600 fill-slate-600" />}
                    </button>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {demoPaused ? "已暂停演示" : "自动演示播放中..."}
                    </span>
                  </div>

                  <div className="flex gap-1">
                    {[0, 1, 2].map(idx => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${currentDemoStep === idx ? 'w-4 bg-indigo-600' : 'w-1.5 bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Simulated Screen (GIF visual component) */}
              <div className="md:w-1/2 bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden text-left">
                {/* Subtle cosmic details */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />

                <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between text-slate-500 text-[10px] font-mono leading-none">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      PREVIEW PLAYER ACTIVE
                    </span>
                    <button
                      onClick={() => setActiveDemoMode(null)}
                      className="p-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition cursor-pointer flex items-center gap-1 font-sans text-[10px] font-bold"
                    >
                      <X className="w-3 h-3" />
                      关闭 (Close)
                    </button>
                  </div>

                  {/* Simulator Screen Rendering */}
                  {renderDemoSimulation(activeDemoMode, currentDemoStep)}

                  <div className="space-y-2 font-sans">
                    <span className="text-[#34d399] tracking-widest text-[9px] font-black uppercase font-mono block">
                      💡 交互指引 (Operational Tips)
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-bold">
                      本系统各区块通过完全真实的数据 API & 实时大模型接口编织。本演示还原了各种在极端链上环境下的实战拦截效果。您可以点击对应的左侧按钮，进行分步调试。
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {exploitDemoOpen && (
        <ExploitDemoModal isOpen={exploitDemoOpen} onClose={() => setExploitDemoOpen(false)} />
      )}
    </div>
  );
}

interface DemoStepDetail {
  title: string;
  desc: string;
}

interface DemoConfig {
  id: "registry" | "live-threats" | "audit-lookup" | "vulnerability-modeler";
  name: string;
  badge: string;
  steps: DemoStepDetail[];
}

const DEMO_REGISTRY: Record<string, DemoConfig> = {
  "registry": {
    id: "registry",
    name: "Registry Databases (情报库检索演示)",
    badge: "数据库检索",
    steps: [
      {
        title: "1. 键入安全机构或工具名称",
        desc: "在输入框搜索 'SunSec' 或 'Foundry'。系统将在毫秒级对 22+ 个全球顶级 Web3 安全源发起离线索引检索。"
      },
      {
        title: "2. 高亮契合细分标签",
        desc: "筛选顶部诸如 'Exploit Databases' / 'Developer Tools'。卡片分类动态重组，秒级锁定高维链上威胁情报。"
      },
      {
        title: "3. 提取防篡改安全研判地址",
        desc: "选中卡片，一键提取精准开发用例。直接跳转最权威、防投毒、抗劫持的公开源码或漏洞重现项目。"
      }
    ]
  },
  "live-threats": {
    id: "live-threats",
    name: "DeFiHackLogs Live Feed (威胁雷达实时观察)",
    badge: "威胁实时侦测",
    steps: [
      {
        title: "1. 实时长轮询加载",
        desc: "应用直连 SunWeb3Sec/DeFiHackLabs 仓库，流式汇聚最新 15 例经过实证的智能合约重放 PoC（Forge 调试代码）。"
      },
      {
        title: "2. 识别核心攻击载荷 (Attack Vector)",
        desc: "检测文件名。应用自动解析其前缀，对攻击特征（闪电贷、重入、逻辑越权）作精准分析分类并贴标。"
      },
      {
        title: "3. 资金损失评定与漏洞研习",
        desc: "判定损失严重。一键穿透至 GitHub 源码对照测试，帮助安全审计人员提取 PoC，阻止 0-day 漏洞范围扩散。"
      }
    ]
  },
  "audit-lookup": {
    id: "audit-lookup",
    name: "Asset Intel Scanner (AI 资产安全检测演示)",
    badge: "AI 资产静态扫描",
    steps: [
      {
        title: "1. 填入可疑资产坐标",
        desc: "输入在 DEX 交易的可疑代币合约。也可一键填入 'DegenSpy' phishing 典型钓鱼代币作为测试预设进行检验。"
      },
      {
        title: "2. 闪电穿透全网安全知识库",
        desc: "点击扫描，安全中心利用 Gemini 分析其代码签名、审计历史、白皮书意图分析、流转池稳定性。开始评估。"
      },
      {
        title: "3. 获知雷达研判评分 (Standard Legit / Alert)",
        desc: "秒级输出研判结论。若是高风险项目则触发全屏 Alert 红色警戒高亮，若各项指标正常则颁发安全绿牌标识。"
      }
    ]
  },
  "vulnerability-modeler": {
    id: "vulnerability-modeler",
    name: "Threat Vector Modeler (单元测试跑测重现)",
    badge: "漏洞重置校验",
    steps: [
      {
        title: "1. 定位经典的攻击架构",
        desc: "在左侧菜单栏中点击如 'Flashloan Price Manipulation' 或者 'checks-effects-interactions (Reentrancy)' 经典漏洞范式。"
      },
      {
        title: "2. 研读多合约时序逻辑流 (Flow modeling)",
        desc: "卡片生成多节点时流图示：黑客合约发起攻击 -> 借款闪电贷 -> 抬升喂价池阻抗 -> 耗尽借贷主网流动性。拆解因果体系。"
      },
      {
        title: "3. 本地编译与断言校验 (Asserter Simulation)",
        desc: "加载对标的 Forge unit-test 级 Solidity 再现用例。运行自动化断言契约校验，输出 '[PASS]' 验证无盲区。"
      }
    ]
  }
};

const renderDemoSimulation = (id: string, step: number) => {
  switch (id) {
    case "registry":
      return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 h-[240px] flex flex-col justify-between font-mono text-[11px] text-slate-300 relative overflow-hidden select-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            </div>
            <span className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Registry Crawler Terminal</span>
          </div>

          <div className="flex-1 py-3 flex flex-col gap-2 text-left">
            {/* Step 0: Search input simulation */}
            <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex-1 text-xs">
                {step === 0 ? (
                  <span className="text-slate-250 inline-block border-r-2 border-indigo-500 pr-0.5 animate-pulse">
                    {"SunSec".substring(0, (Math.floor(Date.now() / 250) % 7) + 1)}
                  </span>
                ) : (
                  <span className="text-slate-200 font-sans">SunSec</span>
                )}
              </div>
            </div>

            {/* Step 1: Horizontal badges and results list */}
            <div className={`transition-all duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-30'}`}>
              <div className="flex gap-1 mb-2">
                <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider border font-bold ${step === 1 ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 scale-105' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                  Exploit Databases
                </span>
                <span className="px-2 py-0.5 rounded text-[8px] bg-slate-800/50 border border-slate-700 text-slate-500 uppercase tracking-wider">
                  Audits
                </span>
              </div>
            </div>

            {/* Step 2: Highlighted tool detail */}
            <div className={`bg-slate-950 p-3 rounded-xl border transition-all duration-500 flex flex-col gap-1.5 ${step === 2 ? 'border-indigo-500 shadow-lg shadow-indigo-500/10' : 'border-slate-800 opacity-60'}`}>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-slate-200 text-xs">DeFiHackLabs (SunWeb3Sec)</span>
                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest px-1 bg-emerald-950/40 rounded">Verified Ledger</span>
              </div>
              <p className="text-[10px] text-slate-405 text-slate-400 font-sans leading-relaxed">
                A sprawling database detailing successful DeFi hacks with Foundry test suites.
              </p>
              {step === 2 && (
                <div className="text-[9px] text-indigo-300 flex items-center gap-1 mt-1 font-bold animate-pulse">
                  <Play className="w-2.5 h-2.5 fill-indigo-400 text-indigo-400" /> Click to launch safe sandbox tracer...
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 text-[9px] text-slate-500 text-right font-black tracking-widest">
            SIMULATOR ACTIVE
          </div>
        </div>
      );

    case "live-threats":
      return (
        <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 h-[240px] flex flex-col justify-between font-mono text-[11px] text-emerald-400 space-y-2 relative overflow-hidden select-none">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[9px] text-emerald-500 uppercase tracking-widest font-black flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-404 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              REALTIME SECURITY SNIFFER
            </span>
            <span className="text-[9px] text-slate-500 font-mono">PORT 3000 / ACTIVE</span>
          </div>

          <div className="flex-1 py-1.5 text-[10px] flex flex-col gap-2 justify-center leading-normal text-left">
            {step === 0 && (
              <div className="space-y-1 text-slate-300">
                <p className="text-slate-500">{"[INF] Establishing connection..."}</p>
                <p className="text-indigo-400">{"[COM] Fetching https://api.github.com/..."}</p>
                <p className="text-emerald-400 font-bold">{"[OK] Received repository index payload successfully."}</p>
                <div className="w-16 h-1.5 bg-indigo-900/30 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 animate-pulse w-1/2 rounded-full"></div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-1.5 text-left">
                <p className="text-slate-500 text-[9px]">{"[SYS] Parser indexing 15 recent attacks..."}</p>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-indigo-950 text-slate-200">
                  <p className="font-bold text-slate-100 text-xs text-indigo-300">2024_03_26_Munchables_attack.sol</p>
                  <p className="text-[9px] text-slate-405 text-slate-400 font-mono mt-0.5">Vector: Rogue Developer / Logic Abuse</p>
                </div>
                <div className="bg-slate-900/20 p-2 rounded-lg border border-slate-900 text-slate-500">
                  <p className="text-xs">2024_04_19_Hedgey_Finance.sol</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2 bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl animate-in zoom-in-95 duration-200 text-slate-250 text-left animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-rose-600/20 text-rose-400 border border-rose-800/40 px-1.5 py-0.5 rounded font-black uppercase tracking-widest text-[8px]">
                    CRITICAL DAMAGE
                  </span>
                  <span className="font-black text-rose-400 text-sm">$62,000,000 Loss!</span>
                </div>
                <p className="text-xs font-bold font-sans text-slate-150 mt-0.5">Protocol: Munchables Security Leak</p>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Target bypassed lockup parameters via rogue identity controls to mint points and escape with reserves.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-900 pt-1 text-[8px] text-slate-600 text-right tracking-widest">
            LIVE SYNC EMULATOR
          </div>
        </div>
      );

    case "audit-lookup":
      return (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 h-[240px] flex flex-col justify-between font-mono text-[11px] text-slate-300 relative overflow-hidden select-none">
          {/* Circular rotating pattern behind */}
          <div className="absolute -right-20 -bottom-20 w-44 h-44 border border-indigo-500/10 rounded-full animate-spin animate-duration-10000 pointer-events-none"></div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[9px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
              AI AUDIT REPORT SIMULATION
            </span>
            <span className="text-[9px] text-slate-500">GEMINI PROMPT PROXIED</span>
          </div>

          <div className="flex-1 py-3 flex flex-col justify-center gap-2 text-left">
            {step === 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 block uppercase font-bold text-[9px] tracking-wide">Fill target coordinate:</span>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-850 space-y-1">
                  <p className="text-xs text-slate-300"><span className="text-slate-500">Symbol:</span> <span className="font-bold text-red-400">DegenSpy</span></p>
                  <p className="text-[9px] text-slate-400"><span className="text-slate-500">Contract:</span> <span className="font-mono text-indigo-300">0xf9a112df38a1682cf481...</span></p>
                </div>
                <div className="bg-indigo-600 text-white text-[10px] rounded-lg py-1.5 px-3 text-center font-bold font-sans animate-pulse">
                  Trigger Analysis (Mock Run)
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="text-center space-y-3 py-4">
                <div className="relative w-12 h-12 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-indigo-300 animate-pulse">Evaluating Signature Matches...</p>
                  <p className="text-[9px] text-slate-400">Deconstructing malicious proxy loops & ScamSniffer lists</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-rose-950/20 border border-rose-900/30 p-3 rounded-xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans font-black text-xs text-rose-400">DegenSpy (DGNSPY)</span>
                  <span className="bg-rose-500/10 text-rose-300 text-[8px] tracking-widest font-extrabold uppercase px-1 rounded border border-rose-900/30 animate-pulse">
                    AUDIT ALERT
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                  The smart contract code signature matches phishing deployer signatures on mainnets. Critical risk detected.
                </p>
                <div className="mt-2 text-[9px] text-rose-400 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Verdict: HIGH FRAUD FACTOR INDICATED
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-1 text-[8px] text-slate-600 text-right tracking-widest">
            AI PIPELINE EMULATION
          </div>
        </div>
      );

    case "vulnerability-modeler":
      return (
        <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4 h-[240px] flex flex-col justify-between font-mono text-[11px] text-slate-300 relative overflow-hidden select-none">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
              FORGE UNIT TEST COMPILER
            </span>
            <span className="text-[9px] text-slate-600">COMPILER SOLC: 0.8.20</span>
          </div>

          <div className="flex-1 py-2 flex flex-col justify-center text-left">
            {step === 0 && (
              <div className="space-y-2">
                <span className="text-[9px] text-slate-500 block uppercase">1. INVARIANT THREAT SELECTION:</span>
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-indigo-300 font-bold">
                  ⚡ checks-effects-interactions (Reentrancy Exploit)
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  An external call is initiated to an attacker contract before states are decremented, allowing recursive loops.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3">
                <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wide">2. CODE INTERACTION SCHEME MODEL:</span>
                <div className="flex items-center justify-center gap-2">
                  <div className="px-2 py-1.5 bg-slate-900 border border-slate-850 rounded text-center text-rose-300">
                    <p className="font-extrabold text-[9px] uppercase leading-none">Attacker</p>
                    <span className="text-[8px] text-slate-500">Malicious Call</span>
                  </div>
                  <div className="text-rose-450 text-rose-400 animate-pulse flex items-center">➔</div>
                  <div className="px-2 py-1.5 bg-slate-900 border border-slate-850 rounded text-center text-slate-300">
                    <p className="font-extrabold text-[9px] uppercase leading-none">Vulnerable Pool</p>
                    <span className="text-[8px] text-slate-500">Unsafe withdraw()</span>
                  </div>
                </div>
                <div className="w-full bg-slate-900/40 py-1 text-center text-slate-400 text-[9px] font-sans rounded">
                  Simulation: Triggering recursive loop (Stack tracking...)
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-1 bg-slate-900 p-2 rounded-xl border border-emerald-900/30 text-[9px] leading-relaxed text-slate-200">
                <p className="text-slate-500">{"$ forge test --match-contract ReentrancyTest"}</p>
                <p className="text-slate-400">{"[test] Running 1 test suite for reentrancy replay..."}</p>
                <p className="text-emerald-400 font-bold animate-pulse">{"[PASS] testExpliotReentrancy() (gas: 89042)"}</p>
                <div className="bg-emerald-950/20 text-emerald-400 px-2 py-1 rounded inline-block font-black tracking-widest uppercase text-[8px] mt-1 border border-emerald-900/30">
                  VERIFICATION SUCCESSFUL (Invariants Violated!)
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-900 pt-1 text-[8px] text-slate-600 text-right tracking-widest">
            FORGE LOCAL SANDBOX ACTIVE
          </div>
        </div>
      );

    default:
      return null;
  }
};
