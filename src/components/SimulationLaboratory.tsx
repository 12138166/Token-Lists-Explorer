import React, { useState, useMemo, useEffect, useRef } from "react";
import * as d3 from "d3";
import { 
  Play, 
  Pause, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Code2, 
  Server, 
  Coins, 
  Wallet, 
  Cpu, 
  HelpCircle, 
  Info, 
  AlertTriangle, 
  Gauge, 
  Flame, 
  Dribbble, 
  Skull,
  TrendingUp,
  LineChart,
  Grid,
  Zap,
  CheckCircle2,
  Lock
} from "lucide-react";

interface SimulationStep {
  title: string;
  description: string;
  activeCaller: "attacker" | "vault" | "oracle" | "none";
  activeTarget: "attacker" | "vault" | "oracle" | "none";
  activeMethod: string;
  gasSpentGwei: number;
  highlightLines: number[]; // lines to highlight in solidity view
  solidityCode: string;
  states: {
    vaultBalanceETH: number;
    attackerMappingETH: number;
    attackerWalletETH: number;
    oraclePriceUSD?: number;
    uniswapReserveTokens?: number;
    uniswapReserveStable?: number;
    insolvencyStatus?: string;
  };
}

interface ExploitSimulation {
  id: string;
  name: string;
  vulnType: string;
  severity: "Critical" | "High" | "Medium";
  lossEstimate: string;
  realWorldCounterpart: string;
  contractLanguage: string;
  solidityTemplate: string;
  steps: SimulationStep[];
}

const HISTORICAL_SIMULATIONS: ExploitSimulation[] = [
  {
    id: "reentrancy",
    name: "Decentralized Vault Reentrancy",
    vulnType: "Reentrancy (SWC-107)",
    severity: "Critical",
    lossEstimate: "$15.5M USD",
    realWorldCounterpart: "The DAO Hack / Cream Finance incident",
    contractLanguage: "Solidity ^0.8.0",
    solidityTemplate: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract EtherVault {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0, "No balance");

        // VULNERABILITY: State check is performed, but transfer occurs BEFORE adjusting balance mapping
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }
}

contract AttackerContract {
    EtherVault public vault;

    constructor(address _vaultAddress) {
        vault = EtherVault(_vaultAddress);
    }

    // Fallback function is invoked when Ether is received
    receive() external payable {
        if (address(vault).balance >= 10 ether) {
            vault.withdraw(); // RE-ENTER CALL VECTOR!
        }
    }

    function attack() external payable {
        require(msg.value >= 10 ether);
        vault.deposit{value: 10 ether}();
        vault.withdraw();
    }
}`,
    steps: [
      {
        title: "Simulation Initial State Setup",
        description: "The EtherVault currently holds 100 ETH deposited by general protocol users. The Attacker has deployed their malicious contract with 10 ETH in start capital.",
        activeCaller: "none",
        activeTarget: "none",
        activeMethod: "INIT",
        gasSpentGwei: 0,
        highlightLines: [4, 5, 6],
        solidityCode: "balances[msg.sender] += msg.value;",
        states: {
          vaultBalanceETH: 100,
          attackerMappingETH: 0,
          attackerWalletETH: 10
        }
      },
      {
        title: "Deposit Attack Trigger",
        description: "The Attacker calls attack() invoking vault.deposit{value: 10 ETH}(). The vault credits the Attacker's address inside the internal balance map, taking the vault to 110 ETH.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "deposit{value: 10 ETH}()",
        gasSpentGwei: 45000,
        highlightLines: [7, 8, 9],
        solidityCode: "function deposit() public payable {\n    balances[msg.sender] += msg.value;\n}",
        states: {
          vaultBalanceETH: 110,
          attackerMappingETH: 10,
          attackerWalletETH: 0
        }
      },
      {
        title: "Withdraw Trigger & State Lock Bypass",
        description: "Attacker's contract calls vault.withdraw(). Vault checks require(balances[msg.sender] > 0) which succeeds. It proceeds to invoke the low-level call() transfer.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "withdraw()",
        gasSpentGwei: 21000,
        highlightLines: [11, 12, 13, 15],
        solidityCode: "function withdraw() public {\n    uint bal = balances[msg.sender];\n    require(bal > 0, \"No balance\");",
        states: {
          vaultBalanceETH: 110,
          attackerMappingETH: 10,
          attackerWalletETH: 0
        }
      },
      {
        title: "Call Execution & Mid-State Interception",
        description: "Vault sends 10 ETH back to Attacker via msg.sender.call(). This shifts the Vault balance to 100 ETH, but CRITICALLY, balances[msg.sender] is still 10 ETH because Solidity line 18 has not run yet!",
        activeCaller: "vault",
        activeTarget: "attacker",
        activeMethod: "call{value: bal}(\"\")",
        gasSpentGwei: 35000,
        highlightLines: [15, 16],
        solidityCode: "(bool sent, ) = msg.sender.call{value: bal}(\"\");",
        states: {
          vaultBalanceETH: 100,
          attackerMappingETH: 10,
          attackerWalletETH: 10
        }
      },
      {
        title: "Fallback Re-entrancy Loop Start",
        description: "The 10 ETH landing triggers the Attacker contract's receive() fallback function. Attacker sees the Vault still holds 100 ETH and re-enters, calling withdraw() again before line 18 can resolve.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "withdraw() [RE-ENTER 1]",
        gasSpentGwei: 65000,
        highlightLines: [32, 33, 34, 35],
        solidityCode: "receive() external payable {\n    if (address(vault).balance >= 10 ether) {\n        vault.withdraw();\n    }\n}",
        states: {
          vaultBalanceETH: 100,
          attackerMappingETH: 10,
          attackerWalletETH: 10
        }
      },
      {
        title: "Vault Secondary Balance Execution",
        description: "The vault processes the re-entered withdraw() call. It reads balances[msg.sender] which is still 10 ETH! It sends another 10 ETH to the attacker, dropping vault resources to 90 ETH.",
        activeCaller: "vault",
        activeTarget: "attacker",
        activeMethod: "call{value: bal}(\"\") [LOOP 2]",
        gasSpentGwei: 58000,
        highlightLines: [12, 13, 15, 16],
        solidityCode: "(bool sent, ) = msg.sender.call{value: bal}(\"\");",
        states: {
          vaultBalanceETH: 90,
          attackerMappingETH: 10,
          attackerWalletETH: 20
        }
      },
      {
        title: "Fallback Re-entrancy Loop 3",
        description: "Attacker receive() catches the second payout and re-enters again. This process repeats recursively until the target vault is fully dried of capital.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "withdraw() [RE-ENTER 2]",
        gasSpentGwei: 84000,
        highlightLines: [34],
        solidityCode: "vault.withdraw(); // RE-ENTER CALL VECTOR!",
        states: {
          vaultBalanceETH: 20,
          attackerMappingETH: 10,
          attackerWalletETH: 90
        }
      },
      {
        title: "Vulnerability Payload Final Sweep",
        description: "The loop terminates. Only now does control flow fall back to line 18 in each recursive stack, writing balances[msg.sender] = 0. However, the vault is completely empty. Attacker successfully extracted 110 ETH.",
        activeCaller: "attacker",
        activeTarget: "none",
        activeMethod: "EXIT",
        gasSpentGwei: 105000,
        highlightLines: [18],
        solidityCode: "balances[msg.sender] = 0;",
        states: {
          vaultBalanceETH: 0,
          attackerMappingETH: 0,
          attackerWalletETH: 110
        }
      }
    ]
  },
  {
    id: "oracle_manipulation",
    name: "AMM Price Oracle Manipulation",
    vulnType: "Oracle Manipulation (Spot Price Hijack)",
    severity: "High",
    lossEstimate: "$4.1M USD",
    realWorldCounterpart: "Harvest Finance / Mango Markets",
    contractLanguage: "Solidity ^0.8.0",
    solidityTemplate: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IUniswapV2Pair {
    function getReserves() external view returns (uint112, uint112, uint32);
    function swap(uint amount0In, uint amount1Out, address to, bytes calldata data) external;
}

contract LendingPlatform {
    IUniswapV2Pair public pair; // Low-liquidity pool used as spot price feed
    mapping(address => uint) public locks;

    constructor(address _pair) {
        pair = IUniswapV2Pair(_pair);
    }

    // Vulnerable function estimating asset value directly from spot DEX reserves
    function getAssetPrice() public view returns (uint) {
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();
        return (uint(reserve1) * 1e18) / uint(reserve0);
    }

    // Mint protocol synthetics using target token as collateral
    function mintSynths() public payable {
        uint price = getAssetPrice();
        uint perceivedValue = (msg.value * price) / 1e18;
        // Allows minting synthetic stable debt 1:1 to collateral value
        require(perceivedValue > 1000 * 1e18, "Insufficient collateral value");
        _mint(msg.sender, perceivedValue);
    }
}`,
    steps: [
      {
        title: "DEX Pool Normal Reserves",
        description: "The low-liquidity spot Uniswap pool contains 10,000 DummyTokens and 10,000 USDC. The Oracle price of 1 DummyToken is perceived as exactly $1.00 USD.",
        activeCaller: "none",
        activeTarget: "none",
        activeMethod: "INIT",
        gasSpentGwei: 0,
        highlightLines: [16, 17, 18],
        solidityCode: "return (uint(reserve1) * 1e18) / uint(reserve0);",
        states: {
          vaultBalanceETH: 0,
          attackerMappingETH: 0,
          attackerWalletETH: 10,
          oraclePriceUSD: 1,
          uniswapReserveTokens: 10000,
          uniswapReserveStable: 10000
        }
      },
      {
        title: "Large Spot Market Buying Pulse",
        description: "The Attacker uses their wallet funds to sweep the pool, swapping 9,500 USDC for DummyTokens on the DEX. This shifts the Uniswap pool reserves to 950 DummyTokens and 19,500 USDC.",
        activeCaller: "attacker",
        activeTarget: "oracle",
        activeMethod: "swap(USDC -> Dummy)",
        gasSpentGwei: 165000,
        highlightLines: [5, 6],
        solidityCode: "function swap(uint amount0In, uint amount1Out, address to, bytes calldata data) external;",
        states: {
          vaultBalanceETH: 0,
          attackerMappingETH: 0,
          attackerWalletETH: 0.5,
          oraclePriceUSD: 20.5, // 19500 / 950
          uniswapReserveTokens: 950,
          uniswapReserveStable: 19500
        }
      },
      {
        title: "Oracle State Congestion Update",
        description: "Because the LendingPlatform reads spot reserves directly via getAssetPrice() rather than using a Time-Weighted Average Price (TWAP), the spot price of DummyToken is now reported to the vault as $20.52 USD!",
        activeCaller: "oracle",
        activeTarget: "vault",
        activeMethod: "getAssetPrice()",
        gasSpentGwei: 12000,
        highlightLines: [16, 17, 18, 19],
        solidityCode: "(uint112 reserve0, uint112 reserve1, ) = pair.getReserves();",
        states: {
          vaultBalanceETH: 0,
          attackerMappingETH: 0,
          attackerWalletETH: 0.5,
          oraclePriceUSD: 20.5,
          uniswapReserveTokens: 950,
          uniswapReserveStable: 19500
        }
      },
      {
        title: "Vault Collateral Mint Exploitation",
        description: "The Attacker locks a small collateral of 1,000 DummyTokens in the LendingPlatform. The platform's vulnerable oracle estimates this collateral value to be worth $20,520 USD (instead of actual $1,000)! It lets the attacker mint 20,520 Synthetic Dollars.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "mintSynths() with skewed collateral",
        gasSpentGwei: 95000,
        highlightLines: [22, 23, 24, 25, 26, 27],
        solidityCode: "uint price = getAssetPrice();\nuint perceivedValue = (msg.value * price) / 1e18;",
        states: {
          vaultBalanceETH: 0,
          attackerMappingETH: 20520, // Synthetics debt minted
          attackerWalletETH: 0.5,
          oraclePriceUSD: 20.5,
          uniswapReserveTokens: 950,
          uniswapReserveStable: 19500
        }
      },
      {
        title: "Unbacked Synth Payout & Insolvency Lock",
        description: "The Attacker immediately exits by swapping the unbacked 20,520 synthetic dollars back to USDC on a separate stable pool, causing a massive protocol deficit. The spot reserves reset but the lending app is left bankrupt.",
        activeCaller: "attacker",
        activeTarget: "none",
        activeMethod: "EXIT",
        gasSpentGwei: 48000,
        highlightLines: [26, 27],
        solidityCode: "require(perceivedValue > 1000 * 1e18, \"Insufficient collateral value\");",
        states: {
          vaultBalanceETH: 0,
          attackerMappingETH: 20520,
          attackerWalletETH: 20520.5,
          oraclePriceUSD: 1.0, // Resets on normal arbitrage
          uniswapReserveTokens: 10000,
          uniswapReserveStable: 10000,
          insolvencyStatus: "Platform Deficit: -$19,520 USD"
        }
      }
    ]
  },
  {
    id: "flash_loan_manipulation",
    name: "Flash Loan Arbitrage & Yield Siphon",
    vulnType: "Flash Loan Attack (Liquidity Drainage)",
    severity: "Critical",
    lossEstimate: "$28.0M USD",
    realWorldCounterpart: "Mango Markets / dYdX custom flashloans",
    contractLanguage: "Solidity ^0.8.0",
    solidityTemplate: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract FlashLendingPool {
    IERC20 public rewardToken;

    function flashLoan(uint amount, address tokenAddress, bytes calldata data) external {
        uint balanceBefore = IERC20(tokenAddress).balanceOf(address(this));
        require(balanceBefore >= amount, "Not enough pool funds");

        // Transfer loan to malicious attacker
        IERC20(tokenAddress).transfer(msg.sender, amount);

        // Execute attacker's arbitrary logic callback
        (bool ok, ) = msg.sender.call(abi.encodeWithSignature("executeAction(uint256)", amount));
        require(ok, "Attacker execution failed");

        // Validate complete repayment
        uint balanceAfter = IERC20(tokenAddress).balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "Flash loan must be repaid in same block");
    }
}`,
    steps: [
      {
        title: "High-Volume Uncollateralized State",
        description: "The FlashLendingPool holds 1,000,000 USDC available for instant flash borrowing. No wallet collateral is locked yet.",
        activeCaller: "none",
        activeTarget: "none",
        activeMethod: "INIT",
        gasSpentGwei: 0,
        highlightLines: [10],
        solidityCode: "function flashLoan(uint amount, address tokenAddress, bytes calldata data) external {",
        states: {
          vaultBalanceETH: 1000000,
          attackerMappingETH: 0,
          attackerWalletETH: 15
        }
      },
      {
        title: "Borrow Flash Loan Phase",
        description: "The Attacker triggers executeAction() borrowing 500,000 USDC without locking any capital upfront. Attacker's active contract wallet gets the funds.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "flashLoan(500,000 USDC)",
        gasSpentGwei: 185000,
        highlightLines: [11, 12, 15],
        solidityCode: "IERC20(tokenAddress).transfer(msg.sender, amount);",
        states: {
          vaultBalanceETH: 500000,
          attackerMappingETH: 0,
          attackerWalletETH: 500015
        }
      },
      {
        title: "Yield Protocol Pool Siphoning",
        description: "The Attacker routes the borrowed 500,000 USDC to double-leveraged yield farm deposits, extracting $35,000 USDC in instant rewards and interest buffers using the liquidity injection.",
        activeCaller: "attacker",
        activeTarget: "none",
        activeMethod: "executeAction() callback arbitrage",
        gasSpentGwei: 390000,
        highlightLines: [18],
        solidityCode: "(bool ok, ) = msg.sender.call(abi.encodeWithSignature(\"executeAction(uint255)\", amount));",
        states: {
          vaultBalanceETH: 500000,
          attackerMappingETH: 0,
          attackerWalletETH: 535015 // Extracted reward tokens + base loan
        }
      },
      {
        title: "Repayment validation checks",
        description: "The Attacker repays the base 500,000 USDC loan back to the FlashLendingPool before the block completes. The pool satisfies require(balanceAfter >= balanceBefore) and closes transaction.",
        activeCaller: "attacker",
        activeTarget: "vault",
        activeMethod: "transfer() Repay Loan",
        gasSpentGwei: 72000,
        highlightLines: [21, 22, 23],
        solidityCode: "uint balanceAfter = IERC20(tokenAddress).balanceOf(address(this));\nrequire(balanceAfter >= balanceBefore, \"must repay\");",
        states: {
          vaultBalanceETH: 1000000,
          attackerMappingETH: 0,
          attackerWalletETH: 35015 // Clean, risk-free profit kept in wallet!
        }
      }
    ]
  }
];

export default function SimulationLaboratory() {
  const [selectedExploitId, setSelectedExploitId] = useState<string>("reentrancy");
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const d3ContainerRef = useRef<SVGSVGElement | null>(null);

  // Auto Play timing handler
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIdx((prev) => {
          const activeExploit = HISTORICAL_SIMULATIONS.find(s => s.id === selectedExploitId);
          if (!activeExploit) return prev;
          if (prev >= activeExploit.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 4200);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, selectedExploitId]);

  const activeExploit = useMemo(() => {
    return HISTORICAL_SIMULATIONS.find(s => s.id === selectedExploitId) || HISTORICAL_SIMULATIONS[0];
  }, [selectedExploitId]);

  const currentStep = useMemo(() => {
    return activeExploit.steps[currentStepIdx] || activeExploit.steps[0];
  }, [activeExploit, currentStepIdx]);

  // Handle Exploit Switch
  const handleExploitChange = (id: string) => {
    setSelectedExploitId(id);
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  // Step Controllers
  const nextStep = () => {
    if (currentStepIdx < activeExploit.steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const resetSim = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  // Net gas calculation for the steps so far
  const totalGasSpentSoFar = useMemo(() => {
    let sum = 0;
    for (let i = 0; i <= currentStepIdx; i++) {
      sum += activeExploit.steps[i].gasSpentGwei;
    }
    return sum;
  }, [activeExploit, currentStepIdx]);

  // Re-draw D3 network interactive transition diagram when step changes
  useEffect(() => {
    if (!d3ContainerRef.current) return;

    const svg = d3.select(d3ContainerRef.current);
    svg.selectAll("*").remove();

    const width = 460;
    const height = 240;

    // Node locations
    const nodes = [
      { id: "attacker", label: "Attacker Contract", x: 80, y: 120, color: "#ef4444", icon: "💀" },
      { id: "vault", label: "DeFi Target Vault", x: 380, y: 120, color: "#6366f1", icon: "🏦" },
      { id: "oracle", label: "Uniswap AMM Feed", x: 230, y: 40, color: "#fbbf24", icon: "📡" }
    ];

    // Helper checking active roles
    const activeCaller = currentStep.activeCaller;
    const activeTarget = currentStep.activeTarget;

    // Draw grid mesh pattern background
    svg.append("defs")
      .append("pattern")
      .attr("id", "grid-pattern")
      .attr("width", 20)
      .attr("height", 20)
      .attr("patternUnits", "userSpaceOnUse")
      .append("circle")
      .attr("cx", 2)
      .attr("cy", 2)
      .attr("r", 1)
      .attr("fill", "#f1f5f9");

    svg.append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "url(#grid-pattern)");

    // Define arrowhead marker
    svg.append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#cbd5e1");

    // Define glowing arrowhead marker for active transactions
    svg.append("defs")
      .append("marker")
      .attr("id", "active-arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#ef4444");

    // Connectors/Edges
    const edges = [
      { source: "attacker", target: "vault", label: "Call / Withdraw" },
      { source: "vault", target: "attacker", label: "Payer transfer" },
      { source: "attacker", target: "oracle", label: "Liquidity Sweep" },
      { source: "oracle", target: "vault", label: "Spot Price broadcast" }
    ];

    // Render underlying connector lines
    edges.forEach((edge) => {
      const srcNode = nodes.find(n => n.id === edge.source);
      const destNode = nodes.find(n => n.id === edge.target);

      if (srcNode && destNode) {
        const isActiveLink = activeCaller === edge.source && activeTarget === edge.target;
        
        // Offset curves for bi-directional paths to prevent layering overlapping
        const isBidirectional = (edge.source === "attacker" && edge.target === "vault") || (edge.source === "vault" && edge.target === "attacker");
        const offsetMultiplier = edge.source === "attacker" ? 18 : -18;

        const startX = srcNode.x;
        const startY = srcNode.y + (isBidirectional ? offsetMultiplier : 0);
        const endX = destNode.x;
        const endY = destNode.y + (isBidirectional ? offsetMultiplier : 0);

        svg.append("line")
          .attr("x1", startX)
          .attr("y1", startY)
          .attr("x2", endX)
          .attr("y2", endY)
          .attr("stroke", isActiveLink ? "#ef4444" : "#cbd5e1")
          .attr("stroke-width", isActiveLink ? 3 : 1.5)
          .attr("stroke-dasharray", isActiveLink ? "none" : "3 3")
          .attr("marker-end", `url(${isActiveLink ? "#active-arrowhead" : "#arrowhead"})`)
          .style("transition", "all 0.3s ease-in-out");

        if (isActiveLink) {
          // Add pulse particles along edge path
          svg.append("circle")
            .attr("cx", startX)
            .attr("cy", startY)
            .attr("r", 5)
            .attr("fill", "#ef4444")
            .style("opacity", 0.8)
            .transition()
            .duration(1200)
            .ease(d3.easeLinear)
            .attr("cx", endX)
            .attr("cy", endY)
            .remove();
        }

        // Add method action tooltip label above active text vectors
        if (isActiveLink) {
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2 - 10;

          const containerBg = svg.append("g")
            .attr("transform", `translate(${midX}, ${midY})`);

          containerBg.append("rect")
            .attr("x", -70)
            .attr("y", -11)
            .attr("width", 140)
            .attr("height", 16)
            .attr("rx", 4)
            .attr("fill", "#0f172a")
            .style("opacity", 0.9);

          containerBg.append("text")
            .attr("text-anchor", "middle")
            .attr("y", 1)
            .attr("fill", "#ffffff")
            .attr("class", "font-mono font-bold text-[8px]")
            .text(currentStep.activeMethod);
        }
      }
    });

    // Draw Nodes
    const nodeGroups = svg.selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x}, ${d.y})`);

    // Outer glow for active focus node in current simulation step
    nodeGroups.each(function(d) {
      const g = d3.select(this);
      const isFocused = activeCaller === d.id || activeTarget === d.id;

      if (isFocused) {
        g.append("circle")
          .attr("r", 28)
          .attr("fill", "none")
          .attr("stroke", d.color)
          .attr("stroke-width", 2)
          .style("opacity", 0.4)
          .attr("class", "animate-pulse");

        g.append("circle")
          .attr("r", 22)
          .attr("fill", "none")
          .attr("stroke", d.color)
          .attr("stroke-width", 1.5)
          .style("opacity", 0.8);
      }

      // Base circle
      g.append("circle")
        .attr("r", 18)
        .attr("fill", isFocused ? d.color : "#ffffff")
        .attr("stroke", isFocused ? "#1e293b" : "#cbd5e1")
        .attr("stroke-width", 2)
        .style("transition", "all 0.3s")
        .style("cursor", "pointer");

      // Node Icon
      g.append("text")
        .attr("text-anchor", "middle")
        .attr("y", 4)
        .text(d.icon)
        .style("font-size", "14px");

      // Text Header Label
      g.append("text")
        .attr("y", 28)
        .attr("text-anchor", "middle")
        .attr("class", "font-sans font-black text-[9px] uppercase tracking-tight")
        .attr("fill", isFocused ? "#0f172a" : "#64748b")
        .text(d.label);
    });

  }, [currentStep, selectedExploitId]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6" id="simulation-lab-shell">
      {/* Visual Title Header block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-650 text-indigo-600 animate-pulse" />
            <h2 className="text-lg font-sans font-extrabold text-slate-900">Virtual EVM Simulation Laboratory</h2>
          </div>
          <p className="text-xs text-slate-500">
            Interactive, step-by-step debugger tracking EVM state changes during historic exploits. Observe Solidity variables rewrite vectors on execution.
          </p>
        </div>

        {/* Highlight Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-2.5 text-xs font-bold shrink-0">
            <Gauge className="w-4 h-4 text-indigo-500 animate-spin-slow" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold leading-none">Simulation Gas Expended:</span>
              <span className="font-mono text-slate-800 font-extrabold block mt-0.5">
                {totalGasSpentSoFar.toLocaleString()} Gwei
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exploit Target Selector pills */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-150">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mr-1">Choose Attack Script:</span>
        {HISTORICAL_SIMULATIONS.map((sim) => (
          <button
            key={sim.id}
            onClick={() => handleExploitChange(sim.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-2 ${
              selectedExploitId === sim.id
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-950 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{sim.name}</span>
            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${
              sim.severity === "Critical" ? "bg-red-50 text-red-700 border-red-250" : "bg-amber-50 text-amber-700 border-amber-250"
            }`}>
              {sim.severity}
            </span>
          </button>
        ))}
      </div>

      {/* Main split dashboard: left console (7 cols), right controller/table (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Solidty Interactive Code & Flow Pointer State */}
        <div className="lg:col-span-7 flex flex-col justify-between border border-slate-250/80 bg-slate-900 rounded-3xl overflow-hidden shadow-inner">
          
          {/* Virtual code header tab */}
          <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-350 text-slate-300">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>{activeExploit.vulnType}</span>
              <span className="text-[9px] font-mono text-slate-400 bg-slate-800/60 font-bold px-1.5 py-0.5 rounded leading-none border border-slate-700">
                {activeExploit.contractLanguage}
              </span>
            </div>
            
            <div className="text-[10px] text-slate-500 font-bold font-mono">
              IP: {currentStepIdx + 1} / {activeExploit.steps.length}
            </div>
          </div>

          {/* Interactive Code Window Container */}
          <div className="p-5 font-mono text-[11px] leading-relaxed select-all max-h-96 overflow-y-auto bg-slate-950/70 text-slate-300 scrollbar-thin">
            <pre className="space-y-0.5 pointer-events-none">
              {activeExploit.solidityTemplate.split("\n").map((line, idx) => {
                const lineNum = idx + 1;
                const isHighlighted = currentStep.highlightLines.includes(lineNum);
                return (
                  <div
                    key={idx}
                    className={`flex items-start rounded px-2 transition-all duration-300 ${
                      isHighlighted 
                        ? "bg-rose-500/15 border-l-2 border-rose-500 text-white font-black" 
                        : "opacity-65"
                    }`}
                  >
                    <span className="text-[9px] text-slate-600 block w-6 select-none leading-normal">
                      {lineNum}
                    </span>
                    <span className="leading-normal block whitespace-pre-wrap">{line}</span>
                  </div>
                );
              })}
            </pre>
          </div>

          {/* Exploit vector explanation box */}
          <div className="bg-slate-950 p-5 border-t border-slate-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-rose-450 text-rose-400">
                <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
                <span>ACTIVE SOLDIER CALLS TRACEHAND</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                {currentStep.activeMethod}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{currentStep.description}</p>
          </div>
        </div>

        {/* Right Side: Step Navigation controller, D3 visualization network, virtual EVM ledger */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          
          {/* Debug controllers */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tight">Active Step Controller</h4>
                <p className="text-[10px] text-slate-500 font-bold">{currentStep.title}</p>
              </div>

              {/* Progress counter pill */}
              <span className="text-[10px] px-2.5 py-1 rounded-xl bg-slate-200 text-slate-700 font-black">
                {currentStepIdx + 1} of {activeExploit.steps.length}
              </span>
            </div>

            {/* Simulated progress wire bar */}
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300" 
                style={{ width: `${((currentStepIdx + 1) / activeExploit.steps.length) * 100}%` }}
              />
            </div>

            {/* Stepper utility button tray */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={prevStep}
                disabled={currentStepIdx === 0}
                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-55 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Previous step"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`col-span-2 px-3 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                  isPlaying 
                    ? "bg-amber-120 bg-amber-500 hover:bg-amber-600 text-white" 
                    : "bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-white" />
                    <span>Pause Loop</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-white" />
                    <span>Auto-Play</span>
                  </>
                )}
              </button>

              <button
                onClick={nextStep}
                disabled={currentStepIdx === activeExploit.steps.length - 1}
                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-55 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                title="Next step"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Reset simulator */}
            <button
              onClick={resetSim}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset State Variables</span>
            </button>
          </div>

          {/* D3 network transaction topology visualizer */}
          <div className="border border-slate-200 bg-slate-50/50 rounded-3xl p-5 relative overflow-hidden flex flex-col items-center">
            <span className="absolute top-3 left-3 text-[8px] font-black uppercase text-slate-400 tracking-wider">
              EVM Callgraph topology visualizer
            </span>
            <svg 
              ref={d3ContainerRef} 
              width="460" 
              height="240" 
              className="max-w-full rounded-2xl border border-slate-150 bg-white shadow-inner overflow-hidden" 
            />
          </div>

          {/* Virtual EVM ledger variables table */}
          <div className="border border-slate-200 bg-white rounded-3xl p-5 space-y-4">
            <h4 className="text-[10px] font-sans font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-2">
              Virtual EVM Storage Mapping Ledger State:
            </h4>

            {/* Variables and balance tracks */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-600">vault.balance</span>
                </div>
                <div className="font-mono text-xs font-black text-slate-900">
                  {currentStep.states.vaultBalanceETH.toLocaleString()}{" "}
                  <span className="text-[9px] text-slate-400 font-bold">
                    {activeExploit.id === "oracle_manipulation" ? "USDC" : "ETH"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center gap-2 col-span-1">
                  <Server className="w-4 h-4 text-slate-500" />
                  <span className="text-[11px] font-bold text-slate-600">balances[attacker_contract]</span>
                </div>
                <div className="font-mono text-xs font-black text-rose-600">
                  {currentStep.states.attackerMappingETH.toLocaleString()}{" "}
                  <span className="text-[9px] text-slate-400 font-bold">
                    {activeExploit.id === "oracle_manipulation" ? "Debt Mint" : "ETH"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span className="text-[11px] font-bold text-slate-600">attacker_contract.wallet</span>
                </div>
                <div className="font-mono text-xs font-black text-emerald-700">
                  {currentStep.states.attackerWalletETH.toLocaleString()}{" "}
                  <span className="text-[9px] text-slate-400 font-bold">
                    {activeExploit.id === "oracle_manipulation" ? "USDC" : "ETH"}
                  </span>
                </div>
              </div>

              {/* Dynamic properties dependent on the simulation mode */}
              {currentStep.states.oraclePriceUSD !== undefined && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold text-slate-600">Uniswap Spot Price</span>
                  </div>
                  <div className="font-mono text-xs font-black text-amber-700">
                    ${currentStep.states.oraclePriceUSD.toFixed(2)} USD
                  </div>
                </div>
              )}

              {currentStep.states.uniswapReserveStable !== undefined && currentStep.states.uniswapReserveTokens !== undefined && (
                <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-indigo-400" />
                    <span className="text-[11px] font-bold text-slate-600">Uniswap Reserves Pool</span>
                  </div>
                  <div className="font-mono text-[10px] font-black text-slate-700">
                    {currentStep.states.uniswapReserveTokens} T / {currentStep.states.uniswapReserveStable} USDC
                  </div>
                </div>
              )}

              {/* Insolvency alert badge */}
              {currentStep.states.insolvencyStatus && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-bounce">
                  <Skull className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{currentStep.states.insolvencyStatus}</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Guide explanation banner */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-655 text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-900 block mb-0.5">EVM Simulation Methodology Detail:</span>
          Each debugger vector is strictly modelled off authentic web3 hacks (The DAO reentrancy, Mango Markets oracle skewing, flash-loan yield pools). Notice how EVM storage update sequences are abused. To mitigate these risks, protocols implement reentrancy guards (<code className="bg-slate-200/60 px-1 rounded text-red-600">nonReentrant</code> modifiers), use Decentralized Oracles (Chainlink TWAP feeds) instead of single spot reserves, and strictly isolate borrowed collateral pools.
        </div>
      </div>
    </div>
  );
}
