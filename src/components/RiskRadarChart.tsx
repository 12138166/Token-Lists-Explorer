import React, { useMemo, useState } from "react";
import * as d3 from "d3";
import { TokenInfo, TokenList } from "../types";
import { evaluateTokenRisk, SCAM_DATABASE_SIGNATURES } from "../lib/securityScore";
import { Shield, ShieldAlert, Sparkles, AlertCircle, RefreshCw, BarChart2, Info, CheckCircle } from "lucide-react";

interface RiskRadarChartProps {
  activeList?: TokenList | null;
}

interface RadarFeature {
  axis: string;
  key: "reentrancy" | "oracle" | "phishing" | "tax" | "upgradability";
  value: number; // 0 to 100 representing safety rating
  description: string;
}

export default function RiskRadarChart({ activeList }: RiskRadarChartProps) {
  const [selectedTokenAddr, setSelectedTokenAddr] = useState<string | null>(null);

  // Get evaluated tokens
  const evaluatedTokens = useMemo(() => {
    if (!activeList || !activeList.tokens || activeList.tokens.length === 0) {
      return [];
    }
    return activeList.tokens.map((t) => {
      const risk = evaluateTokenRisk(t);
      // Let's derive a custom upgradability/centralization rating
      const hasUpgradabilityIssue = risk.matchedSignatures.some(s => s.id === "sig_centralized_unlimited_mint");
      const upgradabilityRating = hasUpgradabilityIssue ? 45 : 95;
      
      return {
        ...risk,
        upgradabilityRating
      };
    });
  }, [activeList]);

  // Set default selected token to the first one if not set
  const currentToken = useMemo(() => {
    if (evaluatedTokens.length === 0) return null;
    if (selectedTokenAddr) {
      const found = evaluatedTokens.find(et => et.token.address === selectedTokenAddr);
      if (found) return found;
    }
    return evaluatedTokens[0];
  }, [evaluatedTokens, selectedTokenAddr]);

  // Calculate the portfolio baseline averages
  const listAverages = useMemo(() => {
    if (evaluatedTokens.length === 0) {
      return {
        reentrancy: 85,
        oracle: 80,
        phishing: 90,
        tax: 95,
        upgradability: 88,
        riskScore: 15
      };
    }
    const count = evaluatedTokens.length;
    const reentrancySum = evaluatedTokens.reduce((acc, current) => acc + current.reentrancyRating, 0);
    const oracleSum = evaluatedTokens.reduce((acc, current) => acc + current.oracleRating, 0);
    const phishingSum = evaluatedTokens.reduce((acc, current) => acc + current.phishingRating, 0);
    const taxSum = evaluatedTokens.reduce((acc, current) => acc + current.taxRating, 0);
    const upgradabilitySum = evaluatedTokens.reduce((acc, current) => acc + current.upgradabilityRating, 0);
    const riskSum = evaluatedTokens.reduce((acc, current) => acc + current.riskScore, 0);

    return {
      reentrancy: Math.round(reentrancySum / count),
      oracle: Math.round(oracleSum / count),
      phishing: Math.round(phishingSum / count),
      tax: Math.round(taxSum / count),
      upgradability: Math.round(upgradabilitySum / count),
      riskScore: Math.round(riskSum / count)
    };
  }, [evaluatedTokens]);

  const radarAxes: Array<{ label: string; key: keyof typeof listAverages; desc: string }> = [
    { label: "Reentrancy Protection", key: "reentrancy", desc: "Immunity to recursive call hijacking." },
    { label: "Oracle Robustness", key: "oracle", desc: "Reliability of price feeds & TWAP buffers." },
    { label: "Phishing Immunity", key: "phishing", desc: "Clean approvals (anti-drainer signatures)." },
    { label: "Tax & Honeypot Safeties", key: "tax", desc: "Absence of dynamic fee mutations or honeypots." },
    { label: "Upgrade Sanity", key: "upgradability", desc: "Timelock setups and decentralization of admin rights." }
  ];

  // Radar dimensions
  const width = 340;
  const height = 340;
  const margin = 45;
  const radius = Math.min(width, height) / 2 - margin;
  const cx = width / 2;
  const cy = height / 2;

  // D3 Scales & Angle helpers
  const rScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, radius]);

  const angleScale = d3.scaleLinear()
    .domain([0, radarAxes.length])
    .range([0, 2 * Math.PI]);

  // Generate background circles & rings
  const rings = [20, 40, 60, 80, 100];

  // Radar logic generator helper
  const getCoordinates = (ratings: { reentrancy: number; oracle: number; phishing: number; tax: number; upgradability: number }) => {
    return radarAxes.map((axe, i) => {
      const val = ratings[axe.key] || 0;
      const angle = angleScale(i) - Math.PI / 2; // Offset by 90 degrees to point straight up
      const r = rScale(val);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        label: axe.label,
        value: val
      };
    });
  };

  const baselinePoints = useMemo(() => {
    return getCoordinates(listAverages);
  }, [listAverages]);

  const tokenPoints = useMemo(() => {
    if (!currentToken) return [];
    return getCoordinates({
      reentrancy: currentToken.reentrancyRating,
      oracle: currentToken.oracleRating,
      phishing: currentToken.phishingRating,
      tax: currentToken.taxRating,
      upgradability: currentToken.upgradabilityRating
    });
  }, [currentToken]);

  // Convert points to SVG path syntax
  const generatePathData = (points: Array<{ x: number; y: number }>) => {
    if (points.length === 0) return "";
    const generator = d3.line<{ x: number; y: number }>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveLinearClosed);
    return generator(points) || "";
  };

  const baselinePath = useMemo(() => generatePathData(baselinePoints), [baselinePoints]);
  const tokenPath = useMemo(() => generatePathData(tokenPoints), [tokenPoints]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6" id="security-radar-cockpit">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Shield className="w-5 h-5 text-indigo-650 text-indigo-600 animate-pulse" />
            <h3 className="text-base font-sans font-extrabold text-slate-900">Portfolio Security Radar</h3>
          </div>
          <p className="text-xs text-slate-500">
            D3-powered multi-vector visual safety envelope comparing list averages to individual token layers.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 font-sans font-bold rounded-xl text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500/25 border border-indigo-600" />
            <span className="text-slate-500">List Average</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500/25 border border-emerald-600" />
            <span className="text-slate-500">Selected Token</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar Graphic (Col 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="relative bg-slate-50/50 border border-slate-200/60 rounded-3xl p-4 shadow-inner max-w-full overflow-visible">
            <svg width={width} height={height} className="overflow-visible select-none max-w-full">
              {/* Background circular web lines & grid markers */}
              {rings.map((ringValue, idx) => {
                const r = rScale(ringValue);
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray={ringValue === 100 ? "0" : "3 3"}
                  />
                );
              })}

              {/* Radial spoke lines with labels */}
              {radarAxes.map((axe, i) => {
                const angle = angleScale(i) - Math.PI / 2;
                const outerX = cx + rScale(100) * Math.cos(angle);
                const outerY = cy + rScale(100) * Math.sin(angle);
                
                // Label positions
                const labelOffset = 22;
                const labelX = cx + (rScale(100) + labelOffset) * Math.cos(angle);
                const labelY = cy + (rScale(100) + labelOffset) * Math.sin(angle);

                let textAnchor = "middle";
                if (Math.cos(angle) > 0.1) textAnchor = "start";
                else if (Math.cos(angle) < -0.1) textAnchor = "end";

                return (
                  <g key={i}>
                    {/* Spoke line */}
                    <line
                      x1={cx}
                      y1={cy}
                      x2={outerX}
                      y2={outerY}
                      stroke="#cbd5e1"
                      strokeWidth="1.2"
                    />

                    {/* Spoke axis text labels */}
                    <text
                      x={labelX}
                      y={labelY + 3}
                      textAnchor={textAnchor}
                      className="fill-slate-500 font-sans font-black tracking-tight text-[9px] uppercase"
                    >
                      {axe.label}
                    </text>
                  </g>
                );
              })}

              {/* Scale percentage indicators along top vertical spoke (90 deg) */}
              {rings.map((v, i) => (
                <text
                  key={i}
                  x={cx - 6}
                  y={cy - rScale(v) + 3}
                  className="fill-slate-400 font-mono text-[7px] font-black text-right"
                >
                  {v}%
                </text>
              ))}

              {/* 1. PORTFOLIO BASELINE PATH (Indigo Web) */}
              {baselinePath && (
                <path
                  d={baselinePath}
                  fill="rgba(99, 102, 241, 0.08)"
                  stroke="#4f46e5"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              )}

              {/* Baseline data-dot points for feedback */}
              {baselinePoints.map((pt, i) => (
                <circle
                  key={`base-dot-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={3}
                  fill="#4f46e5"
                  className="hover:scale-125 transition duration-150"
                  title={`${pt.label}: ${pt.value}% safety`}
                />
              ))}

              {/* 2. SELECTED ACTIVE TOKEN PATH (Emerald / Glowing overlay) */}
              {tokenPath && currentToken && (
                <path
                  d={tokenPath}
                  fill={currentToken.riskLevel === "Critical" || currentToken.riskLevel === "High" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.10)"}
                  stroke={currentToken.riskLevel === "Critical" || currentToken.riskLevel === "High" ? "#ef4444" : "#10b981"}
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                  className="transition-all duration-300"
                />
              )}

              {/* Token data-dot points for feedback */}
              {tokenPoints.map((pt, i) => (
                <circle
                  key={`tok-dot-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={4}
                  fill={currentToken?.riskLevel === "Critical" || currentToken?.riskLevel === "High" ? "#ef4444" : "#10b981"}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Selected Token Security Dashboard Details (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Token Selector selector dropdown/pills */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Evaluate Token Shield Layer:</span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-2">
              {evaluatedTokens.map((et, i) => {
                const isSelected = currentToken?.token.address === et.token.address;
                const riskBadge = 
                  et.riskLevel === "Critical" ? "border-rose-300 text-rose-700 bg-rose-50" :
                  et.riskLevel === "High" ? "border-orange-300 text-orange-700 bg-orange-50" :
                  et.riskLevel === "Medium" ? "border-amber-300 text-amber-700 bg-amber-50" :
                  "border-emerald-300 text-emerald-700 bg-emerald-50";

                return (
                  <button
                    key={`${et.token.address}-${i}`}
                    onClick={() => setSelectedTokenAddr(et.token.address)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition cursor-pointer select-none ${
                      isSelected 
                        ? "bg-slate-900 border-slate-900 text-white" 
                        : "bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{et.token.symbol}</span>
                    <span className={`text-[8px] px-1 py-0.1 select-none leading-none rounded font-black border ${isSelected ? "bg-white/20 text-white border-transparent" : riskBadge}`}>
                      {et.riskScore}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {currentToken ? (
            <div className="space-y-4 border border-slate-200 bg-slate-50/50 p-5 rounded-2xl">
              {/* Token Summary Block */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-sans font-extrabold text-slate-900 flex items-center gap-2">
                    {currentToken.token.name}
                    <span className="text-[10px] font-mono text-slate-405 text-slate-400">({currentToken.token.symbol})</span>
                  </h4>
                  <p className="text-[10px] font-mono font-bold text-slate-400 break-all">{currentToken.token.address}</p>
                </div>
                
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-0.5 rounded border ${
                    currentToken.riskLevel === "Critical" ? "bg-rose-100 border-rose-300 text-rose-800" :
                    currentToken.riskLevel === "High" ? "bg-orange-100 border-orange-300 text-orange-850 text-orange-800" :
                    currentToken.riskLevel === "Medium" ? "bg-amber-100 border-amber-300 text-amber-900" :
                    "bg-emerald-100 border-emerald-300 text-emerald-800"
                  }`}>
                    {currentToken.riskLevel} Risk
                  </span>
                </div>
              </div>

              {/* Multi-Vector Analysis Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white border border-slate-150 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Reentrancy Shield</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-black ${currentToken.reentrancyRating > 80 ? "text-emerald-700" : "text-rose-600"}`}>
                      {currentToken.reentrancyRating}%
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">({listAverages.reentrancy}% avg)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Oracle Feeds</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-black ${currentToken.oracleRating > 80 ? "text-emerald-700" : "text-rose-600"}`}>
                      {currentToken.oracleRating}%
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">({listAverages.oracle}% avg)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Anti-Phishing</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-black ${currentToken.phishingRating > 80 ? "text-emerald-700" : "text-rose-600"}`}>
                      {currentToken.phishingRating}%
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">({listAverages.phishing}% avg)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Tax Whitelist</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-black ${currentToken.taxRating > 80 ? "text-emerald-700" : "text-rose-600"}`}>
                      {currentToken.taxRating}%
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">({listAverages.tax}% avg)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Admin Upgrades</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-black ${currentToken.upgradabilityRating > 80 ? "text-emerald-700" : "text-rose-600"}`}>
                      {currentToken.upgradabilityRating}%
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">({listAverages.upgradability}% avg)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 p-2 rounded-xl">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Combined Risk</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`font-black ${currentToken.riskScore > 35 ? "text-rose-600" : "text-emerald-700"}`}>
                      {currentToken.riskScore}%
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">({listAverages.riskScore}% avg)</span>
                  </div>
                </div>
              </div>

              {/* Exploit Vulnerability Status Flag */}
              {currentToken.matchedSignatures.length > 0 ? (
                <div className="p-3 bg-rose-50 border border-rose-150 border-rose-100 text-rose-800 rounded-xl flex items-start gap-2.5 text-[11px] leading-relaxed">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-extrabold block mb-0.5 text-rose-900Header">Code Vulnerability Signal Flagged:</span>
                    {currentToken.matchedSignatures.map(sig => (
                      <span key={sig.id} className="block text-rose-700">
                        <strong>[{sig.type}]</strong> {sig.description}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-55 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center gap-2 text-[11px] font-bold border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No severe vulnerability signatures detected in sanctuary pattern comparison logs.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-6 bg-slate-50 border border-dashed rounded-2xl text-slate-400 font-bold text-xs">
              List contains zero tokens to evaluate. Upload a curated JSON list or choose an active schema.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
