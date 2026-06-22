import React, { useState, useEffect } from "react";
import { ShieldCheck as ShieldIcon, ShieldAlert, AlertTriangle, CheckSquare, Sparkles, BrainCircuit, Landmark } from "lucide-react";
import { TokenList, AiAuditResponse } from "../types";

interface AiAssistantProps {
  list: TokenList;
  isOpen: boolean;
  onClose: () => void;
}

export default function AiAssistant({
  list,
  isOpen,
  onClose
}: AiAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiAuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tokens = list.tokens || [];

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/gemini/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: list.name,
          description: list.name + " " + (list.keywords || []).join(" "),
          tokens: tokens,
          keywords: list.keywords || []
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error code ${res.status}`);
      }

      const parsed = await res.json();
      setData(parsed);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to complete AI token security audit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleAudit();
    }
  }, [isOpen, list]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      id="ai-assistant-panel"
    >
      <div
        className="bg-white border border-slate-205 border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top visual glow arches */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between relative z-10 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100">
              <Sparkles className="w-5 h-5 text-indigo-605 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-sans font-extrabold text-slate-950">AI List Security Audit</h2>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5 font-sans">
                Scanning List: {list.name} &bull; {tokens.length} coins
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-655 text-slate-600 hover:text-slate-950 px-3 py-1.5 bg-slate-50 border border-slate-205 border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold transition cursor-pointer"
            id="close-audit-btn"
          >
            Close Report
          </button>
        </div>

        {/* Report Content Body */}
        <div className="p-6 overflow-y-auto flex-1 relative z-10 space-y-6">
          {loading ? (
            <div className="text-center py-20 space-y-4">
              <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
                <BrainCircuit className="w-10 h-10 text-indigo-600 animate-pulse" />
                <div className="absolute inset-0 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-950 font-extrabold text-sm font-sans">Validating assets reputation</p>
                <p className="text-[11px] text-slate-405 text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
                  Gemini is running crosscheck heuristic algorithms on listed contract parameters, looking for honey-pots, wash indicators, spoof risk layers, and bridged dependencies...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-205 border-rose-200 rounded-3xl text-rose-800 text-xs text-left space-y-3 shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-rose-605 text-rose-605 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                Security scanner error
              </div>
              <p className="leading-relaxed text-rose-700 font-medium">
                Could not perform real-time security list review: {error}. Traditional causes include unconfigured system workspace secrets or RPC request rate bounds.
              </p>
              <div className="pt-2 text-indigo-605 text-indigo-600 font-extrabold text-[11px] cursor-pointer hover:underline" onClick={handleAudit}>
                Click here to retry scanning the list. &rarr;
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Score card widget */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50 p-5 border border-slate-100 rounded-3xl shadow-xs">
                <div className="md:col-span-4 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">RELIABILITY INDEX</span>
                  <div className="text-4xl font-sans font-black text-slate-950 mt-1.5 flex items-baseline">
                    {data.score}
                    <span className="text-xs text-slate-405 text-slate-400 font-bold">/100</span>
                  </div>
                  <span className={`inline-block mt-2.5 px-3 py-1 text-[10px] font-extrabold font-sans rounded-full ${getRiskBadgeStyle(data.overallRisk)}`}>
                    {data.overallRisk} Risk
                  </span>
                </div>

                <div className="md:col-span-8 text-xs text-slate-655 text-slate-600 leading-relaxed md:pl-3 space-y-1">
                  <h4 className="font-extrabold text-slate-950 text-sm">Security Summary</h4>
                  <p className="text-slate-505 text-slate-500 font-medium leading-relaxed">{data.summary}</p>
                </div>
              </div>

              {/* Collapsed list findings */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-slate-505 text-slate-500 uppercase tracking-wide">
                  Key Findings
                </h3>

                <div className="space-y-2.5">
                  {data.findings.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200/80 rounded-2xl text-xs space-y-1 flex items-start gap-3 shadow-xs"
                    >
                      <div className="shrink-0 mt-0.5">
                        {item.type === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                        ) : item.type === "success" ? (
                          <ShieldIcon className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Landmark className="w-4 h-4 text-indigo-650 text-indigo-600" /> // Standard Info
                        )}
                      </div>

                      <div className="space-y-0.5 font-sans">
                        <div className="font-extrabold text-slate-950">{item.title}</div>
                        <p className="text-[11px] text-slate-505 text-slate-400 leading-normal font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable wallet rules */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-extrabold text-slate-505 text-slate-555 text-slate-500 uppercase tracking-wide">
                  Actionable Wallet Recommendations
                </h3>

                <ul className="space-y-1.5 pr-2">
                  {data.safetyRecommendations.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2 text-slate-600">
                      <CheckSquare className="w-3.5 h-3.5 text-indigo-605 text-indigo-600 shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function getRiskBadgeStyle(risk: string): string {
  switch (risk) {
    case "Low":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Medium":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "High":
      return "bg-rose-50 text-rose-705 text-rose-700 border border-rose-200";
    default:
      return "bg-slate-100 text-slate-500 border border-slate-200";
  }
}
