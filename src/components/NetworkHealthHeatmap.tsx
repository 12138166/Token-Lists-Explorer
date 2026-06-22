import React, { useMemo, useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { 
  Activity, 
  Info, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Gauge, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  Moon,
  Sun,
  ShieldCheck,
  TrendingDown,
  Compass
} from "lucide-react";
import GasTrendMonitor from "./GasTrendMonitor";

interface HeatmapDataPoint {
  day: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  hour: number; // 0 to 23
  avgGas: number; // Gwei
  volatility: number; // 0 to 100
  percentageChange: number; // relative deviation from average
}

type ChainType = "ethereum" | "arbitrum" | "optimism" | "polygon" | "bnb";

export default function NetworkHealthHeatmap() {
  const [selectedChain, setSelectedChain] = useState<ChainType>("ethereum");
  const [timezone, setTimezone] = useState<"UTC" | "Local">("UTC");
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentGasPrice, setCurrentGasPrice] = useState<number>(28);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulated live Gas tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentGasPrice(prev => {
        const delta = (Math.random() - 0.5) * 4;
        const base = selectedChain === "ethereum" ? 26 : selectedChain === "polygon" ? 38 : 1.2;
        const next = Math.max(base * 0.5, prev + delta);
        return parseFloat(next.toFixed(selectedChain === "ethereum" ? 1 : 3));
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [selectedChain]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setCurrentGasPrice(prev => {
        const base = selectedChain === "ethereum" ? 27 : selectedChain === "polygon" ? 40 : 1.4;
        return parseFloat((base + (Math.random() - 0.5) * 6).toFixed(selectedChain === "ethereum" ? 1 : 3));
      });
    }, 600);
  };

  const chainsInfo = {
    ethereum: { name: "Ethereum Mainnet", unit: "Gwei", baseGas: 28, speedMultiplier: 1.0 },
    arbitrum: { name: "Arbitrum One L2", unit: "Gwei", baseGas: 0.12, speedMultiplier: 0.3 },
    optimism: { name: "Optimism OP Mainnet L2", unit: "Gwei", baseGas: 0.08, speedMultiplier: 0.35 },
    polygon: { name: "Polygon PoS", unit: "Gwei", baseGas: 42.0, speedMultiplier: 1.5 },
    bnb: { name: "BNB Smart Chain (BSC)", unit: "Gwei", baseGas: 3.1, speedMultiplier: 0.8 }
  };

  // Generate heatmap data based on chosen chain characteristics
  const heatmapData = useMemo(() => {
    const data: HeatmapDataPoint[] = [];
    const base = chainsInfo[selectedChain].baseGas;
    const mult = chainsInfo[selectedChain].speedMultiplier;

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        // Base values vary by day of week (weekdays Monday-Friday are busier)
        const isWeekend = day === 0 || day === 6;
        let dayWeight = isWeekend ? 0.65 : 1.15;
        if (day === 2 || day === 3) dayWeight = 1.3; // Tues, Wed are busiest

        // Base values vary by hour of day (US/EU afternoon hours are busier, night is quiet)
        // Peak is around 13:00 to 20:00 UTC
        let hourWeight = 1.0;
        if (hour >= 13 && hour <= 20) {
          hourWeight = 1.5;
        } else if (hour >= 1 && hour <= 7) {
          hourWeight = 0.55;
        } else if (hour >= 21 || hour < 1) {
          hourWeight = 0.85;
        }

        // Add small cyclic noise
        const noise = Math.sin((hour / 24) * 2 * Math.PI) * 0.1 + Math.cos((day / 7) * 2 * Math.PI) * 0.05;

        const avgGas = Math.max(0.001, base * dayWeight * hourWeight * (1 + noise));
        
        // Volatility is higher during peak transitional hours (e.g. market open or block congestion)
        let volatilityBase = 15;
        if (!isWeekend) {
          if (hour === 13 || hour === 14 || hour === 15) volatilityBase = 75; // market open transition
          else if (hour >= 16 && hour <= 20) volatilityBase = 55;
          else if (hour === 8 || hour === 9) volatilityBase = 40; // European open transition
        } else {
          volatilityBase = 22; // quiet weekend state
        }
        
        const volatility = Math.min(100, Math.max(5, volatilityBase + (Math.sin(hour) * 8)));
        // relative percentage change from base
        const percentageChange = Math.round(((avgGas - base) / base) * 100);

        data.push({
          day,
          hour,
          avgGas: parseFloat(avgGas.toFixed(selectedChain === "ethereum" ? 1 : 3)),
          volatility: Math.round(volatility),
          percentageChange
        });
      }
    }
    return data;
  }, [selectedChain]);

  const daysLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const shortDaysLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hoursLabels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

  // Heatmap dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgWidth, setSvgWidth] = useState(720);
  const height = 280;
  const paddingLeft = 55;
  const paddingRight = 10;
  const paddingTop = 30;
  const paddingBottom = 40;

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setSvgWidth(Math.max(500, entry.contentRect.width));
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Compute layout scales
  const cellWidth = (svgWidth - paddingLeft - paddingRight) / 24;
  const cellHeight = (height - paddingTop - paddingBottom) / 7;

  // Volatility color scale
  // We want: High volatility = Rose Red/Orange, Medium = Amber, Low = Clean Emerald Green
  const colorScale = useMemo(() => {
    return d3.scaleLinear<string>()
      .domain([10, 35, 60, 90])
      .range(["#10b981", "#fbbf24", "#f97316", "#ef4444"])
      .interpolate(d3.interpolateHcl);
  }, []);

  const getSafetyRecommendation = (vol: number, val: number) => {
    const chainUnit = chainsInfo[selectedChain].unit;
    if (vol >= 70) {
      return {
        title: "High Risk / Extreme Congestion",
        text: `Gas spike threshold breached. Postpone recursive multisig calls or delicate arbitrage transactions. Highly susceptible to transaction front-running, gas wars, or sandwich exploits. Expected fee standard is elevated.`,
        color: "text-rose-700 bg-rose-50 border-rose-200",
        indicator: "bg-rose-500",
        action: "POSTPONE SENSITIVE CODE CALLS"
      };
    } else if (vol >= 45) {
      return {
        title: "Moderate Volatility Warning",
        text: `Normal protocol activity is safe, but optimize slippage parameters up to 1.5% if processing large AMM pool redemptions or flashloan mints to prevent execution reversions.`,
        color: "text-amber-700 bg-amber-50 border-amber-200",
        indicator: "bg-amber-500",
        action: "PROCEED WITH CAUTION / SLIPPAGE GATES"
      };
    } else {
      return {
        title: "Optimal Safe Clearance",
        text: `Low congestion, minimal gas deviation. Preferred execution phase for structural contract interactions (e.g. multisig parameters updates, administrative pool redeploys, or custom upgradability upgrades). Gas cost is highly predictable.`,
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
        indicator: "bg-emerald-500",
        action: "OPTIMAL TIME WINDOW FOR SENSITIVE CODE EXECUTION"
      };
    }
  };

  const handleCellHover = (e: React.MouseEvent<SVGRectElement>, cell: HeatmapDataPoint) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setHoverPosition({
        x: rect.left - containerRect.left + cellWidth / 2,
        y: rect.top - containerRect.top - 12
      });
      setHoveredCell(cell);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    setHoverPosition(null);
  };

  // Find overall stats for selected chain
  const heatmapStats = useMemo(() => {
    const prices = heatmapData.map(d => d.avgGas);
    const vols = heatmapData.map(d => d.volatility);

    const minVal = prices.length > 0 ? Math.min(...prices) : 0;
    const maxVal = prices.length > 0 ? Math.max(...prices) : 0;
    const avgVal = prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const avgVolVal = vols.length > 0 ? (vols.reduce((a, b) => a + b, 0) / vols.length) : 0;

    return {
      minPrice: parseFloat(minVal.toFixed(selectedChain === "ethereum" ? 1 : 3)),
      maxPrice: parseFloat(maxVal.toFixed(selectedChain === "ethereum" ? 1 : 3)),
      avgPrice: parseFloat(avgVal.toFixed(selectedChain === "ethereum" ? 1 : 3)),
      avgVol: Math.round(avgVolVal)
    };
  }, [heatmapData, selectedChain]);

  // Current chain active suggestion
  const activeCellRecommendation = hoveredCell 
    ? getSafetyRecommendation(hoveredCell.volatility, hoveredCell.avgGas)
    : getSafetyRecommendation(heatmapStats.avgVol, heatmapStats.avgPrice);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6" id="network-health-heatmap-dashboard">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-650 text-indigo-600 animate-spin-slow" />
            <h2 className="text-lg font-sans font-extrabold text-slate-900">Network Health Volatility Center</h2>
          </div>
          <p className="text-xs text-slate-500">
            D3-powered real-time temporal heatmap indexing hourly gas congestion and network speed spikes for highly sensitive on-chain admin calls.
          </p>
        </div>

        {/* Live Ticker and Refresh controls */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2 flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 font-sans font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500 font-extrabold text-[10px] uppercase">Gwei Live:</span>
              <span className="font-mono text-slate-900 font-extrabold text-xs">
                {currentGasPrice} {chainsInfo[selectedChain].unit}
              </span>
            </div>
          </div>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition text-slate-500 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid Controls (Chain Selection and Timezone) */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-150">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Blockchain Network:</span>
          {(Object.keys(chainsInfo) as ChainType[]).map((c) => (
            <button
              key={c}
              onClick={() => setSelectedChain(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedChain === c
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 hover:text-slate-900 border-slate-200/60 hover:bg-slate-50"
              }`}
            >
              {chainsInfo[c].name.replace("Mainnet", "").replace("L2", "")}
            </button>
          ))}
        </div>

        {/* Timezone configuration */}
        <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Time Reference:</span>
          <div className="bg-white border rounded-xl p-0.5 flex gap-1">
            {(["UTC", "Local"] as const).map((tz) => (
              <button
                key={tz}
                onClick={() => setTimezone(tz)}
                className={`px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-tight transition cursor-pointer ${
                  timezone === tz ? "bg-indigo-650 bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tz}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Heatmap Visual & Interactive stats block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Heatmap Graphic (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative bg-slate-50/20 border border-slate-200/60 rounded-3xl p-5" ref={containerRef}>
            <div className="overflow-x-auto min-w-full">
              <svg width={svgWidth} height={height} className="select-none overflow-visible min-w-[580px]">
                {/* Heatmap cells */}
                <g transform={`translate(${paddingLeft}, ${paddingTop})`}>
                  {heatmapData.map((d, index) => {
                    const x = d.hour * cellWidth;
                    const y = d.day * cellHeight;
                    const color = colorScale(d.volatility);
                    const isHovered = hoveredCell?.day === d.day && hoveredCell?.hour === d.hour;

                    return (
                      <rect
                        key={`${d.day}-${d.hour}-${index}`}
                        x={x}
                        y={y}
                        width={cellWidth - 1}
                        height={cellHeight - 1}
                        rx={3}
                        ry={3}
                        fill={color}
                        className="transition-all duration-100 cursor-help"
                        style={{
                          opacity: hoveredCell ? (isHovered ? 1.0 : 0.45) : 0.9,
                          stroke: isHovered ? "#0f172a" : "none",
                          strokeWidth: isHovered ? 1.5 : 0
                        }}
                        onMouseEnter={(e) => handleCellHover(e, d)}
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </g>

                {/* Day of the Week Y-Axis Labels */}
                <g transform={`translate(${paddingLeft - 8}, ${paddingTop})`}>
                  {daysLabels.map((dayLabel, i) => (
                    <text
                      key={dayLabel}
                      x={0}
                      y={i * cellHeight + cellHeight / 2 + 3}
                      textAnchor="end"
                      className="fill-slate-400 font-sans font-black text-[9px] uppercase tracking-tighter"
                    >
                      {shortDaysLabels[i]}
                    </text>
                  ))}
                </g>

                {/* Hour X-Axis Labels */}
                <g transform={`translate(${paddingLeft}, ${paddingTop - 8})`}>
                  {hoursLabels.map((hourLabel, i) => {
                    // Only render every 3 hours to avoid text collision
                    if (i % 3 !== 0) return null;
                    const x = i * cellWidth + cellWidth / 2;
                    return (
                      <text
                        key={hourLabel}
                        x={x}
                        y={0}
                        textAnchor="middle"
                        className="fill-slate-400 font-mono text-[9px] font-bold"
                      >
                        {hourLabel}
                      </text>
                    );
                  })}
                </g>

                {/* Legend gradient line */}
                <g transform={`translate(${paddingLeft}, ${height - paddingBottom + 12})`}>
                  <text x={0} y={11} className="fill-slate-444 fill-slate-400 font-sans text-[8px] font-black uppercase tracking-wider">
                    Volatility Indicator Spectrum:
                  </text>
                  <g transform="translate(140, 0)">
                    {/* Interpolated color spectrum */}
                    {Array.from({ length: 6 }, (_, i) => {
                      const v = 10 + i * 16;
                      const rectX = i * 28;
                      return (
                        <g key={i}>
                          <rect
                            x={rectX}
                            y={1.5}
                            width={26}
                            height={11}
                            rx={1.5}
                            fill={colorScale(v)}
                          />
                          <text
                            x={rectX + 13}
                            y={20}
                            textAnchor="middle"
                            className="fill-slate-400 font-mono text-[7px]"
                          >
                            {v}%
                          </text>
                        </g>
                      );
                    })}
                    <text x={-6} y={10} textAnchor="end" className="fill-slate-400 font-sans font-bold text-[8px] uppercase">
                      Safe
                    </text>
                    <text x={175} y={10} textAnchor="start" className="fill-slate-400 font-sans font-bold text-[8px] uppercase">
                      Critical
                    </text>
                  </g>
                </g>
              </svg>
            </div>

            {/* Custom Interactive Floating Tooltip */}
            {hoveredCell && hoverPosition && (
              <div
                className="absolute bg-slate-950 text-white rounded-xl p-3 shadow-xl z-50 text-left pointer-events-none text-[10px] w-48 space-y-1 border border-white/10 animate-in fade-in duration-75"
                style={{
                  left: hoverPosition.x,
                  top: hoverPosition.y,
                  transform: "translate(-50%, -100%)"
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-slate-300">
                    {daysLabels[hoveredCell.day]}
                  </span>
                  <span className="font-mono text-indigo-300 font-bold">
                    {String(hoveredCell.hour).padStart(2, "0")}:00 {timezone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Gas Fee:</span>
                  <span className="font-mono font-black text-white">
                    {hoveredCell.avgGas} {chainsInfo[selectedChain].unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Volatility Rate:</span>
                  <span className={`font-mono font-black ${
                    hoveredCell.volatility >= 70 ? "text-rose-400" :
                    hoveredCell.volatility >= 45 ? "text-orange-400" : "text-emerald-400"
                  }`}>
                    {hoveredCell.volatility}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deviation:</span>
                  <span className={`font-mono font-black ${hoveredCell.percentageChange >= 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {hoveredCell.percentageChange >= 0 ? "+" : ""}{hoveredCell.percentageChange}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Analytics & Suggestions (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Average metrics overview card */}
          <div className="bg-slate-50 border border-slate-200/85 p-4 rounded-2xl grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-slate-150 rounded-xl">
              <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wide">Historical Avg</span>
              <span className="text-base font-black text-slate-900 mt-1 block">
                {heatmapStats.avgPrice} <span className="text-[10px] text-slate-400 font-bold">{chainsInfo[selectedChain].unit}</span>
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-150 rounded-xl">
              <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wide">Min-Max range</span>
              <span className="text-xs font-black text-slate-700 mt-1 block font-mono">
                {heatmapStats.minPrice} - {heatmapStats.maxPrice}
              </span>
            </div>

            <div className="p-3 bg-white border border-slate-150 rounded-xl col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-black uppercase text-slate-400 block tracking-wide">Volatility Profile</span>
                <span className="text-sm font-black text-slate-800 mt-0.5 block">
                  {heatmapStats.avgVol}% Average Deviation
                </span>
              </div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-widest ${
                heatmapStats.avgVol >= 50 ? "bg-orange-100 text-orange-850" : "bg-emerald-100 text-emerald-800"
              }`}>
                {heatmapStats.avgVol >= 50 ? "Feverish" : "Controlled"}
              </span>
            </div>
          </div>

          {/* Action Recommendation Callout */}
          <div className={`p-5 rounded-2xl border ${activeCellRecommendation.color} space-y-3`}>
            <div className="flex items-center gap-1.5 border-b border-current/10 pb-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeCellRecommendation.indicator} shrink-0`} />
              <h4 className="text-xs font-sans font-extrabold uppercase tracking-wide">
                {hoveredCell ? "Hover Window Verdict" : "Average Network Profile"}
              </h4>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black block">{activeCellRecommendation.title}</span>
              <p className="text-[10px] leading-relaxed opacity-90">{activeCellRecommendation.text}</p>
            </div>

            <div className="pt-2 border-t border-current/10 text-right">
              <span className="text-[8px] font-mono font-black border border-current bg-white/5 py-1 px-2.5 rounded-md uppercase inline-block">
                {activeCellRecommendation.action}
              </span>
            </div>
          </div>

          {/* Safety Checklist Card */}
          <div className="border border-slate-200 bg-white p-4 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Gas-Safe Interaction Guidelines
            </h4>
            <div className="space-y-2.5 text-[10px] text-slate-655 text-slate-600 leading-normal">
              <div className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Never run admin multi-sig upgrades or parameter re-calibrations on peak congestion hours (13:00 - 20:00 UTC weekdays). Code updates executed under high volatility are prone to failure and expensive debug states.</span>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Observe the deviation percentage. Negative values (e.g. green hour slots) offer the absolute lowest memory load costs for high-variable state writes.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Gas Price Trend Monitor */}
      <GasTrendMonitor />
    </div>
  );
}
