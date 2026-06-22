import React, { useState, useEffect } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Flame, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingDown, 
  Lock, 
  Unlock, 
  Terminal,
  Layers,
  HelpCircle
} from "lucide-react";

export interface ScenarioStep {
  title: string;
  description: string;
  codeSnippet?: string;
  attackerGain: number;
}

export interface ExploitScenario {
  id: string;
  name: string;
  targetAsset: string;
  baseLoss: number; // USD terms
  icon: any;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  vectorType: string;
  patchLabel: string;
  patchDescription: string;
  scenarioSummary: string;
  howItWorks: string;
  steps: ScenarioStep[];
  patchedSteps: ScenarioStep[];
}

const EXPLOIT_SCENARIOS: ExploitScenario[] = [
  {
    id: "reentrancy",
    name: "Reentrancy Vault Drain",
    targetAsset: "WETH Yield Vault",
    baseLoss: 35000, // 10 ETH
    icon: Flame,
    difficulty: "Beginner",
    vectorType: "Recursive Contract Call",
    patchLabel: "ReentrancyGuard (Mutex)",
    patchDescription: "Enforce standard OpenZeppelin nonReentrant modifiers, locking contract re-entry during executing states.",
    scenarioSummary: "A vulnerable vault contract transfers native/EVM assets prior to executing state balance updates, permitting malicious actors to trigger recursive withdrawal iterations that extract the entire vault's balance.",
    howItWorks: "The exploit utilizes a helper contract containing a custom fallback() handler. When the vault returns the initial withdrawal of tokens, the fallback() intercepts that transaction and loops another withdraw() request prior to the server executing the internal debit instruction.",
    steps: [
      {
        title: "Malicious Contract Deployment",
        description: "Hacker registers an Exploit Contract on-chain with a custom native fallback payable handler.",
        codeSnippet: "contract ExploitContract { \n    IVault target;\n    fallback() external payable { \n        if(address(target).balance > 0) target.withdraw(1 ether);\n    }\n}",
        attackerGain: 0
      },
      {
        title: "Initial Seeding Deposit",
        description: "Attacker seeds 1 ether into the Yield Vault, gaining an authorized 1 ether withdraw claim entitlement.",
        codeSnippet: "target.deposit{value: 1 ether}();",
        attackerGain: 0
      },
      {
        title: "Trigger First Withdraw",
        description: "Exploit contract launches withdraw(1 ether). The Vault verify checks suffice and authorizes the native coin dispatch.",
        codeSnippet: "target.withdraw(1 ether);",
        attackerGain: 3500
      },
      {
        title: "Recursive Capture Re-entry",
        description: "Vault releases 1 WETH. Upon receiving, fallback() re-enters withdraw(1 ether) before WETH updates its internal ledger balances.",
        codeSnippet: "target.withdraw() was re-called recursively!",
        attackerGain: 17500
      },
      {
        title: "Siphoning Completion",
        description: "The recursive withdrawals recursively drain the yield vault down to 0, completely wiping your 10 WETH deposit pool.",
        codeSnippet: "// Vault state balance total: 0 ETH\n// Attacker balance absolute: 11 ETH Total",
        attackerGain: 35000
      }
    ],
    patchedSteps: [
      {
        title: "Secure Verification Attempt",
        description: "Attacker initiates withdraw(1 ether). Loop verification establishes target security criteria.",
        codeSnippet: "target.withdraw(1 ether);",
        attackerGain: 0
      },
      {
        title: "Mutex Lock Prevention",
        description: "The nonReentrant modifier establishes active status flags. Recursive call triggers a immediate transactional revert.",
        codeSnippet: "require(_status != _ENTERED, 'ReentrancyGuard: reentrant call');\n// TRANSACTION REVERTED SUCCESSFULLY",
        attackerGain: 0
      }
    ]
  },
  {
    id: "oracle",
    name: "Oracle Manipulation / Liquidation",
    targetAsset: "USDC Collateral Pool",
    baseLoss: 25000, 
    icon: Zap,
    difficulty: "Advanced",
    vectorType: "Flash Loan Arbitrage",
    patchLabel: "Chainlink Multi-feed TWAP Oracle",
    patchDescription: "Migrate from vulnerable spot DEX pricing pools to 30-minute Time-Weighted Average Price (TWAP) and decentralized Chainlink feeds.",
    scenarioSummary: "Attacker manipulates low-liquidity spot price pools on an AMM using massive flash loans, temporarily driving down asset valuation indices to force systemic liquidations of healthy collateral wallets.",
    howItWorks: "DeFi lending platforms rely on price oracles in order to value user collateral positions. Manipulating spot AMM markets triggers instantaneous synthetic market crashes. The lending platform falsely triggers liquidation rules, seizing the collateral at a giant discount.",
    steps: [
      {
        title: "Acquire Deep Flash Loan Liquidity",
        description: "Attacker borrows $50,000,000 USDC in a single flash loan block from dYdX pool without any collateral.",
        codeSnippet: "dydxdLendingPool.flashLoan(50_000_000_1e6);",
        attackerGain: 0
      },
      {
        title: "Massive Spot Swap Dump",
        description: "Attacker swaps $50M USDC directly into a low-liquidity USDC/ETH spot price pool, suppressing spot price to $0.15 USDC.",
        codeSnippet: "uniswapV2SpotPool.swapUSDCForETH(50_000_000);",
        attackerGain: 0
      },
      {
        title: "Faulty Liquidation Appraisal",
        description: "Lending pool queries Uniswap spot price for loan wellness audits. It evaluates User's 25,000 USDC collateral as only worth $3,750.",
        codeSnippet: "uint255 faultyPrice = uniswapV2SpotPool.getPrice(); \n// Spot Price reports: $0.15 instead of $1.00",
        attackerGain: 0
      },
      {
        title: "Liquidation Execution",
        description: "Asset liquidation rules are triggered. Attacker buys user's 25,000 USDC collateral on discount for scrap value.",
        codeSnippet: "lendingHub.liquidatePosition(userWallet);",
        attackerGain: 20000
      },
      {
        title: "Flash Loan Repayment",
        description: "Attacker repays the $50M borrow within the same transactional block, logging $20,000 in pure liquid profit which results in total USDC liquidation loss.",
        codeSnippet: "aavePool.repayFlashLoan(50_000_000);",
        attackerGain: 25000
      }
    ],
    patchedSteps: [
      {
        title: "Deep Spot Manipulate Swap",
        description: "Attacker triggers identical spot-dump pushing spot price index down to $0.15.",
        codeSnippet: "uniswapV2SpotPool.swapUSDCForETH(50_000_000);",
        attackerGain: 0
      },
      {
        title: "Stable Price Query",
        description: "The decentralized Chainlink TWAP Oracle ignores temporary spot abnormalities and reports true USDC pricing of $0.9998.",
        codeSnippet: "uint255 stablePrice = chainlinkFeed.latestRoundData();\n// Reported price = $1.00 (Collateral maintains normal ratio)",
        attackerGain: 0
      },
      {
        title: "Liquidation Intercepted",
        description: "Lending pool blocks the liquidation attempt as the position remains well collateralized. Exploitation halted.",
        codeSnippet: "require(positionHealthy, 'Cannot liquidate healthy position');\n// ATTACK BLOCKED",
        attackerGain: 0
      }
    ]
  },
  {
    id: "slippage",
    name: "AMM Mempool Frontrun/Sandwich",
    targetAsset: "Wallet Swap Reserves",
    baseLoss: 5000,
    icon: Layers,
    difficulty: "Intermediate",
    vectorType: "Mempool MEV Slippage",
    patchLabel: "Enforce max 0.5% Slippage Limits",
    patchDescription: "Specify exact minAmountOut limits matching strict real-time chain pricing instead of submitting 'any output' parameters.",
    scenarioSummary: "Mempool MEV bots detect user transactions hoping to execute high-volume swaps and frontrun them by pumping prices, forcing users into highly disadvantageous market matches.",
    howItWorks: "Standard AMMs will execute orders at whatever spot rate matches transaction arrival. Attacker buys the target asset first to inflate the value, lets the user's high-volume swap proceed at the bloated price, then dumps their tokens to cash out on MEV slippage margins.",
    steps: [
      {
        title: "Mempool Transaction Sniffing",
        description: "Attacker MEV bot detects user's pending swap of $5,000 USDT for ETH with no slippage constraints in public mempool.",
        codeSnippet: "mempool.scanPendingTXs(filter: 'swap');",
        attackerGain: 0
      },
      {
        title: "MEV Frontrun Buy Order",
        description: "Hacker pays a higher gas fee to prioritize their transaction, buying ETH ahead of the user to inflate pricing.",
        codeSnippet: "amm.swapUSDTForETH{gasPrice: 250 gwei}(100_000);",
        attackerGain: 0
      },
      {
        title: "User Swaps at Inflated Rate",
        description: "The user's swap is executed next at extremely bloated rates, obtaining only 0.4 ETH (worth $1,400) instead of expected 1.42 ETH.",
        codeSnippet: "amm.swapUSDTForETH(5_000); // executed at terrible price",
        attackerGain: 3600
      },
      {
        title: "Hacker Arbitrage Sell-off",
        description: "Hacker immediately dumps the pre-bought ETH back to the pool, pocketing the $3,600 difference in USDT.",
        codeSnippet: "amm.swapETHForUSDT(100_000);\n// Profit: $3,600 siphoned from swap margin",
        attackerGain: 5000
      }
    ],
    patchedSteps: [
      {
        title: "Audit Swap Constraints",
        description: "User submits $5,000 swap establishing a strict minimum limit: `minAmountOut = 1.38 ETH`.",
        codeSnippet: "amm.swapExactTokensForTokens(5000, 1.38 /* minAmountOut */);",
        attackerGain: 0
      },
      {
        title: "MEV Attempt Blocked",
        description: "Attacker frontruns the trade to bloat the rate, but when the user's transaction runs, the spot price yields only 0.4 ETH. The trade fails and reverts under slippage limits.",
        codeSnippet: "require(amountOut >= minAmountOut, 'Slippage limit breached');\n// TRANSACTION SAFELY REVERTED",
        attackerGain: 0
      }
    ]
  },
  {
    id: "phishing",
    name: "Phishing Infinite ERC20 Siphon",
    targetAsset: "Direct Wallet USDT",
    baseLoss: 5000,
    icon: ShieldAlert,
    difficulty: "Beginner",
    vectorType: "Signature Approval Hijack",
    patchLabel: "Dynamic ERC20 Spend Approval Caps",
    patchDescription: "Enforce dynamic limited spender caps matching exact order checkout prices rather than granting default unlimited permissions.",
    scenarioSummary: "A fraudulent promotion trick users into signing standard approval signatures that grant unlimited wallet token controls, enabling automated scripts to sweep remaining coin balances.",
    howItWorks: "Hacker deploys a replica dApp offering dynamic free claims. When users claim, the site triggers the ERC20 approve() method naming a malicious address. Once signed, the hacker sweeps the victim's wallet.",
    steps: [
      {
        title: "Phishing Interface Load",
        description: "Attacker lures the victim to a counterfeit promotional site using phishing ads.",
        codeSnippet: "iframe.src = 'https://clalmaplatform-rewards.secure-auth.net';",
        attackerGain: 0
      },
      {
        title: "Unlimited Signature Consent",
        description: "The platform claims a free premium wallet upgrade. It requests approval of USDT spending with unlimited allowance.",
        codeSnippet: "usdtToken.approve(maliciousContract, 1157920892373161954235... /* max */);",
        attackerGain: 0
      },
      {
        title: "Victim Approves Payload",
        description: "Believing it to be a harmless transaction checkout signature, the user confirms approval in their browser.",
        codeSnippet: "// Allowance of maliciousContract set to UNLIMITED",
        attackerGain: 0
      },
      {
        title: "Automated Wallet Wipe",
        description: "Attacker script monitors the approval and triggers transferFrom to wipe the user's wallet of all USDT assets.",
        codeSnippet: "usdtToken.transferFrom(userWallet, hkrWallet, 5000);",
        attackerGain: 5000
      }
    ],
    patchedSteps: [
      {
        title: "Targeted Signature Security",
        description: "User signs with transaction firewalls enabled. Spender authorizations are audited.",
        codeSnippet: "usdtToken.approve(target, exactlyRequestedValue);",
        attackerGain: 0
      },
      {
        title: "Limited Spender Blockade",
        description: "Spender threshold values are restricted to identical transaction volume limits ($0). Attacker attempts to siphon assets, but is instantly blocked.",
        codeSnippet: "require(allowance >= amount, 'Transfer exceeds approval limits');\n// TRANSACTION REVERTED SAFELY",
        attackerGain: 0
      }
    ]
  }
];

export default function HackScenarioSandbox() {
  const [walletUSDT, setWalletUSDT] = useState(5000);
  const [vaultETH, setVaultETH] = useState(10); // in ETH
  const [lendingUSDC, setLendingUSDC] = useState(25050);

  // Computed starting total valuation
  const ethPrice = 3500;
  const startingNAV = walletUSDT + (vaultETH * ethPrice) + lendingUSDC;

  const [activeScenarioId, setActiveScenarioId] = useState<string>("reentrancy");
  const [isPatched, setIsPatched] = useState(false);
  
  // Game Playback states
  const [simState, setSimState] = useState<"idle" | "running" | "ended">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [lootSiphoned, setLootSiphoned] = useState(0);
  const [simSpeed, setSimSpeed] = useState<number>(1800); // ms per step

  // Reset complete virtual state
  const handleResetPortfolio = () => {
    setWalletUSDT(5000);
    setVaultETH(10);
    setLendingUSDC(25000);
    setSimState("idle");
    setCurrentStep(0);
    setLogs(["Virtual transaction system initialized.", "Portfolio assets set to default values."]);
    setLootSiphoned(0);
  };

  const currentScenario = EXPLOIT_SCENARIOS.find(s => s.id === activeScenarioId) || EXPLOIT_SCENARIOS[0];
  const stepsList = isPatched ? currentScenario.patchedSteps : currentScenario.steps;

  // On scenario change or patch switch, reset sandbox playback
  useEffect(() => {
    setSimState("idle");
    setCurrentStep(0);
    setLootSiphoned(0);
    setLogs([
      `Selected scenario: ${currentScenario.name}`,
      `Security Countermeasure: [${currentScenario.patchLabel}] is ${isPatched ? "✅ ENABLED" : "❌ DISABLED"}.`,
      "Ready to deploy simulation environment."
    ]);
  }, [activeScenarioId, isPatched]);

  // Simulated auto-play loop
  useEffect(() => {
    if (simState !== "running") return;

    const timer = setTimeout(() => {
      const nextIndex = currentStep + 1;
      
      if (nextIndex < stepsList.length) {
        const step = stepsList[nextIndex];
        setCurrentStep(nextIndex);
        setLootSiphoned(step.attackerGain);
        
        // Add realistic EVM code logging items
        const newLogs = [...logs];
        newLogs.push(`[STEP ${nextIndex}] Executing: "${step.title}"`);
        newLogs.push(`> Action: ${step.description}`);
        if (step.codeSnippet) {
          newLogs.push(`> EVM Core Payload: \n${step.codeSnippet}`);
        }
        setLogs(newLogs);
      } else {
        // Simulation ending
        setSimState("ended");
        const newLogs = [...logs];
        if (isPatched) {
          newLogs.push(`🏆 SIMULATION COMPLETE: Attack successfully NEUTRALIZED!`);
          newLogs.push(`🛡️ The threat was blocked via decentralized ${currentScenario.patchLabel}. Zero asset loss detected.`);
        } else {
          newLogs.push(`🚨 EXPLOIT DETECTED: Assets siphoned successfully!`);
          newLogs.push(`💸 Attacker drained $${currentScenario.baseLoss.toLocaleString()} equivalent in ${currentScenario.targetAsset} reserves.`);
        }
        setLogs(newLogs);
      }
    }, simSpeed);

    return () => clearTimeout(timer);
  }, [simState, currentStep, stepsList, isPatched]);

  const handleStartSim = () => {
    setSimState("running");
    setCurrentStep(0);
    setLootSiphoned(0);
    
    const initialStep = stepsList[0];
    setLogs([
      "⚡ Initializing Sandbox EVM VM instance...",
      `⚡ Sandbox Seed Contract target: ${currentScenario.targetAsset}`,
      `[STEP 0] Executing: "${initialStep.title}"`,
      `> Action: ${initialStep.description}`
    ]);
  };

  // Live calculated NAV values based on simulator results
  const currentLossUSD = simState === "ended" && !isPatched ? currentScenario.baseLoss : lootSiphoned;
  
  // Real-time values during simulation
  let displayWalletUSDT = walletUSDT;
  let displayVaultETH = vaultETH;
  let displayLendingUSDC = lendingUSDC;

  if (!isPatched) {
    if (activeScenarioId === "reentrancy") {
      // Reentrancy drains WETH Yield Vault
      const percentageDrained = currentLossUSD / currentScenario.baseLoss;
      displayVaultETH = Math.max(0, vaultETH * (1 - percentageDrained));
    } else if (activeScenarioId === "oracle") {
      // Oracle drains USDC Collateral Pool
      const percentageDrained = currentLossUSD / currentScenario.baseLoss;
      displayLendingUSDC = Math.max(0, lendingUSDC * (1 - percentageDrained));
    } else if (activeScenarioId === "slippage") {
      // Slippage drains Wallet USDT balance
      const percentageDrained = currentLossUSD / currentScenario.baseLoss;
      displayWalletUSDT = Math.max(0, walletUSDT * (1 - percentageDrained));
    } else if (activeScenarioId === "phishing") {
      // Phishing drains Wallet USDT balance
      const percentageDrained = currentLossUSD / currentScenario.baseLoss;
      displayWalletUSDT = Math.max(0, walletUSDT * (1 - percentageDrained));
    }
  }

  const currentNAV = displayWalletUSDT + (displayVaultETH * ethPrice) + displayLendingUSDC;
  const netLossPercent = ((startingNAV - currentNAV) / startingNAV) * 100;

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-8" id="hack-scenario-sandbox">
      
      {/* Header and intro */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 text-rose-550 text-rose-600 animate-pulse" />
            Live Vulnerability Sandbox
          </div>
          <h2 className="text-xl md:text-2xl font-sans font-extrabold text-slate-900 tracking-tight">
            DeFi Exploit Simulator & Sandbox
          </h2>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Configure a virtual portfolio allocation, toggle professional security patches, and trigger standard Web3 exploits to see state modifications and transaction events execute in real-time.
          </p>
        </div>

        {/* Reset button */}
        <button 
          onClick={handleResetPortfolio}
          className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Portfolio Setup
        </button>
      </div>

      {/* Grid Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROL INTERFACE (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Virtual Portfolio Balance widget */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              Your Virtual Portfolio
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              {/* Direct wallet */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">Direct Wallet</span>
                <span className="font-mono text-xs text-slate-800 font-bold block">
                  ${displayWalletUSDT.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">USDT Cash</span>
              </div>

              {/* Yield Vault */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">WETH Vault</span>
                <span className="font-mono text-xs text-slate-800 font-bold block">
                  {displayVaultETH.toFixed(1)} WETH
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">
                  ~${(displayVaultETH * ethPrice).toLocaleString()}
                </span>
              </div>

              {/* Collateral pool */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">USDC Collateral</span>
                <span className="font-mono text-xs text-slate-800 font-bold block">
                  ${displayLendingUSDC.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 font-medium block">Lending Pool</span>
              </div>
            </div>

            {/* Total Balance and Loss summary */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Net Asset Value (NAV)</span>
                <span className="font-mono text-lg font-extrabold text-slate-900">
                  ${currentNAV.toLocaleString()}
                </span>
              </div>
              
              {currentLossUSD > 0 && (
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 justify-end">
                    <TrendingDown className="w-3 h-3" />
                    -{netLossPercent.toFixed(1)}% Loss
                  </span>
                  <span className="font-mono text-xs font-bold text-rose-600 block">
                    -${currentLossUSD.toLocaleString()}
                  </span>
                </div>
              )}
              {simState === "ended" && isPatched && (
                <div className="text-right">
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Patched Secure
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-600 block">
                    $0 Lost
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Select Exploit Scenario */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Select Exploit Scenario
            </h3>
            
            <div className="space-y-2.5">
              {EXPLOIT_SCENARIOS.map(sc => {
                const isSelected = activeScenarioId === sc.id;
                const Icon = sc.icon;
                return (
                  <button
                    key={sc.id}
                    disabled={simState === "running"}
                    onClick={() => setActiveScenarioId(sc.id)}
                    className={`w-full text-left p-4 rounded-xl border transition cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? "bg-white border-indigo-500 ring-2 ring-indigo-50" 
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    } ${simState === "running" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-start gap-3.5 relative z-10">
                      <div className={`p-2.5 rounded-lg ${
                        isSelected ? "bg-indigo-50 text-indigo-650 text-indigo-600" : "bg-slate-105 bg-slate-100 text-slate-500"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-extrabold text-sm text-slate-900 block leading-tight">
                            {sc.name}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            sc.difficulty === "Beginner" 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                              : sc.difficulty === "Intermediate"
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {sc.difficulty}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                          {sc.scenarioSummary}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] text-slate-400 font-medium">
                            Target: <span className="font-bold text-slate-600">{sc.targetAsset}</span>
                          </span>
                          <span className="text-slate-300 text-[10px]">•</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Exposure: <span className="font-bold text-rose-600">${sc.baseLoss.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Security Countermeasures patches */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 shadow-sm border border-slate-800">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Security patches & countermeasure
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-semibold text-indigo-400 block tracking-wider mb-1">
                  Available defense patch
                </span>
                <span className="font-sans font-bold text-sm text-slate-100 block">
                  {currentScenario.patchLabel}
                </span>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  {currentScenario.patchDescription}
                </p>
              </div>

              {/* Toggle design */}
              <div className="bg-slate-850/50 bg-slate-800 p-3 rounded-xl flex items-center justify-between border border-slate-700/60 transition">
                <div className="flex items-center gap-2">
                  {isPatched ? (
                    <Lock className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-tight">
                    {isPatched ? "Active Defense Patch: ENABLED" : "Active Defense Patch: DISABLED"}
                  </span>
                </div>

                <button
                  onClick={() => setIsPatched(!isPatched)}
                  disabled={simState === "running"}
                  className={`w-12 h-6.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 outline-none ${
                    isPatched ? "bg-emerald-500" : "bg-slate-700"
                  } ${simState === "running" ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform duration-200 ease-in-out ${
                    isPatched ? "translate-x-5.5" : "translate-x-0"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Trigger Simulation Button */}
          <button
            onClick={handleStartSim}
            disabled={simState === "running"}
            className={`w-full py-3.5 rounded-xl font-sans font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition shrink-0 shadow-xs cursor-pointer ${
              simState === "running"
                ? "bg-slate-200 border border-slate-200 text-slate-400 cursor-not-allowed"
                : isPatched
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01]"
                  : "bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.01]"
            }`}
          >
            {simState === "running" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulation in progress...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Run Exploit Simulation ({isPatched ? "Patched" : "Vulnerable"})</span>
              </>
            )}
          </button>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL EXPLORER & TERMINAL (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Transfer and Flow chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-[230px] relative overflow-hidden">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              Dynamic Transfer Topology Graph
            </h3>

            {/* Dynamic Interactive Diagram */}
            <div className="flex items-center justify-center gap-6 md:gap-10 my-4 py-2 relative z-10">
              
              {/* User portfolio wallet */}
              <div className="flex flex-col items-center space-y-1.5 w-24">
                <div className={`relative p-3 rounded-full border-2 bg-slate-50 transition-all duration-300 ${
                  simState === "running" && !isPatched ? "border-amber-400 animate-pulse" : "border-slate-200"
                }`}>
                  <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  <div className="absolute -top-1 -right-1 bg-indigo-100 text-indigo-700 text-[8px] px-1 font-bold rounded">USER</div>
                </div>
                <span className="text-[10px] font-bold text-slate-800 text-center uppercase tracking-tight block truncate w-full">
                  Your Balance
                </span>
              </div>

              {/* Arrow and status indicators */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-1 relative">
                {simState === "running" ? (
                  <>
                    <span className={`text-[9px] font-bold uppercase tracking-tight text-center block ${
                      isPatched ? "text-emerald-600" : "text-rose-550 text-rose-600"
                    }`}>
                      {isPatched ? "Defense Triggered" : "Token Drain!"}
                    </span>
                    
                    <div className="w-full flex items-center justify-center text-slate-400">
                      <div className="w-full h-[2px] bg-slate-200 relative overflow-hidden">
                        <div className={`absolute top-0 bottom-0 w-1/3 rounded-full ${
                          isPatched ? "bg-emerald-400 translate-x-0" : "bg-rose-500 animate-[marquee_1s_linear_infinite]"
                        }`} />
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 absolute right-2 ${isPatched ? "text-emerald-500" : "text-rose-500"}`} />
                    </div>
                  </>
                ) : simState === "ended" ? (
                  <>
                    <span className={`text-[10px] font-bold uppercase ${
                      isPatched ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {isPatched ? "Halt Secure!" : "Exploited"}
                    </span>
                    <div className={`w-full h-[2px] ${isPatched ? "bg-slate-200" : "bg-rose-100"}`} />
                  </>
                ) : (
                  <>
                    <span className="text-[9px] font-semibold text-slate-400 uppercase">Idle Standing</span>
                    <div className="w-full h-[2px] bg-slate-200" />
                  </>
                )}
              </div>

              {/* Target vault / pool */}
              <div className="flex flex-col items-center space-y-1.5 w-24">
                <div className="p-3 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 relative shrink-0">
                  <Layers className="w-6 h-6 text-slate-500" />
                  <div className="absolute -top-1 -right-1 bg-slate-200 text-slate-700 text-[8px] px-1 font-bold rounded">VAULT</div>
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center truncate block w-full uppercase">
                  {currentScenario.targetAsset}
                </span>
              </div>

              {/* Arrow and path to hacker */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-1 relative">
                {simState === "running" && !isPatched ? (
                  <>
                    <span className="text-[9px] font-bold text-rose-600 uppercase">Loot Trace</span>
                    <div className="w-full h-[2px] bg-rose-100 relative overflow-hidden">
                      <div className="absolute top-0 bottom-0 bg-rose-555 bg-rose-500 w-1/3 animate-[marquee_1.2s_linear_infinite]" />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-[2px] bg-slate-150 bg-slate-200" />
                )}
              </div>

              {/* Hacker adversary */}
              <div className="flex flex-col items-center space-y-1.5 w-24">
                <div className={`p-3 rounded-full border-2 transition-colors duration-300 ${
                  simState === "running" && !isPatched ? "border-rose-500 bg-rose-50" : "border-slate-300 bg-slate-50"
                }`}>
                  <Flame className={`w-6 h-6 ${simState === "running" && !isPatched ? "text-rose-600 animate-bounce" : "text-slate-400"}`} />
                  <div className="absolute -top-1 -right-1 bg-slate-800 text-white text-[8px] px-1 font-bold rounded">ATTACKER</div>
                </div>
                <span className="text-[10px] font-bold text-slate-800 text-center uppercase tracking-tight block truncate w-full">
                  Explot Contract
                </span>
              </div>

            </div>

            {/* Exploit details block */}
            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-tight">Active Exploit Signature</span>
                <p className="text-xs text-slate-700 font-medium">
                  {isPatched ? (
                    <span className="text-emerald-700 font-bold">Successfully barricaded. The system reverts loop executions on-chain.</span>
                  ) : (
                    <span>Vector exploits contract vulnerabilities to redirect siphoned token liquidity.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* SIMULATOR STEPS TIMELINE (Interactive steps) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Simulation Execution Steps ({stepsList.length})
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[9px] before:w-0.5 before:bg-slate-200">
              {stepsList.map((st, idx) => {
                const isActive = idx === currentStep;
                const isPassed = idx < currentStep;
                const isFuture = idx > currentStep;
                
                return (
                  <div 
                    key={idx}
                    className={`relative transition duration-200 ${
                      isActive ? "opacity-100" : isPassed ? "opacity-60" : "opacity-40"
                    }`}
                  >
                    {/* Circle bullet */}
                    <div className={`absolute -left-[23px] top-1.5 w-[13px] h-[13px] rounded-full border-2 transition-colors ${
                      isActive 
                        ? (isPatched ? "bg-emerald-500 border-emerald-500 ring-4 ring-emerald-50" : "bg-indigo-600 border-indigo-600 ring-4 ring-indigo-50")
                        : isPassed 
                          ? "bg-slate-200 border-slate-200" 
                          : "bg-white border-slate-300"
                    }`} />

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">
                        Phase {idx + 1}
                      </span>
                      <span className="font-sans font-extrabold text-sm text-slate-900 block">
                        {st.title}
                      </span>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                        {st.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CODE TERMINAL LOG OUTPUT */}
          <div className="bg-slate-950 text-slate-100 font-mono text-xs rounded-2xl overflow-hidden shadow-md flex flex-col">
            <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] tracking-wider uppercase font-extrabold text-slate-400">
                  Interactive Dev VM Core Out Logs
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Terminal console text */}
            <div className="p-4 h-[200px] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log, index) => {
                let textClass = "text-slate-300";
                if (log.startsWith("🚨") || log.startsWith("💸") || log.includes("EXPLOIT")) {
                  textClass = "text-rose-455 text-rose-500 font-bold";
                } else if (log.startsWith("🏆") || log.startsWith("🛡️") || log.includes("COMPLETE") || log.includes("REREVERTED")) {
                  textClass = "text-emerald-400 font-bold";
                } else if (log.startsWith("[STEP")) {
                  textClass = "text-indigo-400 font-bold";
                } else if (log.startsWith(">")) {
                  textClass = "text-slate-400 pl-4";
                } else if (log.startsWith("⚡")) {
                  textClass = "text-yellow-400";
                } else if (log.includes("contract") || log.includes("function") || log.includes("require")) {
                  textClass = "text-amber-300 pl-4 bg-slate-900/40 p-2 border-l border-amber-450 block rounded-r-lg my-1.5 whitespace-pre leading-relaxed";
                }
                
                return (
                  <div key={index} className={`leading-relaxed tracking-tight ${textClass}`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Educational countermeasures summary */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-tight text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Comprehensive Countermeasure Explanation
            </h4>
            <div className="text-xs text-slate-650 text-slate-600 leading-relaxed space-y-2">
              <p>
                In the Web3 decentralized ecosystem, preventing exploits requires shifting security checks away from the client or spot-pool states and instead enforcing them directly at the 스마트 계약 (Smart Contract) execution level.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <span className="font-bold text-slate-800">Checks-Effects-Interactions Pattern</span>: Always update internal state ledger parameters (like subtracting balances) <span className="font-semibold text-rose-600">prior</span> to dispatching actual tokens/ether out to recipient addresses.
                </li>
                <li>
                  <span className="font-bold text-slate-850 text-slate-800">Dynamic Slippage bounds</span>: MEV sandiwch attacks depend on sloppy target parameters. Submitting non-zero minAmountOut limits makes frontrunning unprofitable because transaction price shifts trigger instant reverts.
                </li>
                <li>
                  <span className="font-bold text-slate-850 text-slate-800">Oracle Resilience</span>: Avoid spot liquidity pools since spot rates are extremely cheap to shift over flash loans. Choose decentralized Oracles like <span className="font-bold">Chainlink</span> utilizing time-weighted moving averagers.
                </li>
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
