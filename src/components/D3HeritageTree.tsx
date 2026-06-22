import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import {
  GitBranch,
  Info,
  Layers,
  Sparkles,
  HelpCircle,
  Maximize2,
  Minimize2,
  Calendar,
  Code
} from "lucide-react";
import { TokenInfo, AncestorTraceResponse } from "../types";

interface D3HeritageTreeProps {
  traceData: AncestorTraceResponse;
  sameArchetypeTokens: TokenInfo[];
  selectedTokenSymbol: string;
}

interface HeritageNodeData {
  id: string;
  name: string;
  subtitle?: string;
  type: "ancestor" | "evolution" | "sibling" | "current" | "branch_root";
  description?: string;
  date?: string;
  divergence?: string;
  children?: HeritageNodeData[];
}

export default function D3HeritageTree({
  traceData,
  sameArchetypeTokens,
  selectedTokenSymbol
}: D3HeritageTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 400 });
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<HeritageNodeData | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // set height proportionally or with a minimum
        const calculatedHeight = Math.max(380, Math.min(500, width * 0.55));
        setDimensions({
          width: Math.max(450, width),
          height: calculatedHeight
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Build the hierarchical tree data structure
  const treeData: HeritageNodeData = React.useMemo(() => {
    // Root is the identified common ancestor
    const root: HeritageNodeData = {
      id: "ancestor-root",
      name: traceData.ancestorName,
      subtitle: traceData.ancestorAddress !== "N/A Standard Template" ? traceData.ancestorAddress : "Standard Spec Template",
      type: "ancestor",
      description: traceData.ancestorDescription,
      children: []
    };

    // Branch A: Evolution stages leading to the current active deployed contract
    const lineageBranches: HeritageNodeData[] = [];
    
    // Sort tracing steps by generation
    const sortedSteps = [...traceData.lineageSteps].sort((a, b) => a.generation - b.generation);
    
    if (sortedSteps.length > 0) {
      // Build a chain of nodes or a single subtree
      // To represent a sequential timeline, we can nest them sequentially or place them under an evolution branch.
      // Nesting them sequentially is extremely elegant: Step 0 -> Step 1 -> Deployed Final (Current)
      let currentChainParent: HeritageNodeData | null = null;
      let chainRoot: HeritageNodeData | null = null;

      sortedSteps.forEach((step, idx) => {
        const isLastStep = idx === sortedSteps.length - 1;
        const node: HeritageNodeData = {
          id: `step-${step.generation}`,
          name: step.contractName,
          subtitle: step.evolutionType,
          type: isLastStep ? "current" : "evolution",
          description: step.description,
          date: step.approximateDate,
          divergence: step.codeDivergenceBrief,
          children: []
        };

        if (!chainRoot) {
          chainRoot = node;
          currentChainParent = node;
        } else if (currentChainParent) {
          currentChainParent.children = [node];
          currentChainParent = node;
        }
      });

      if (chainRoot) {
        lineageBranches.push(chainRoot);
      }
    } else {
      // Fallback if no steps: add current token directly as daughter branch
      lineageBranches.push({
        id: "current-fallback",
        name: `${selectedTokenSymbol} Deployed`,
        subtitle: "Production Contract",
        type: "current",
        description: traceData.evolutionAnalysis,
        date: "Current"
      });
    }

    // Branch B: Related lists of contracts sharing the same ancestor template
    const siblingNodes: HeritageNodeData[] = sameArchetypeTokens.map((token, i) => ({
      id: `sibling-${i}`,
      name: token.symbol,
      subtitle: `${token.name} Fork`,
      type: "sibling",
      description: `Discovered sister implementation sharing ${traceData.ancestorName} standard definitions list. Active code is deployed on Chain ID ${token.chainId}.`,
      date: "Shared Ancestry Reference"
    }));

    // Put them together
    root.children = [];
    
    // Push the interactive lineage chain
    if (lineageBranches.length > 0) {
      root.children.push({
        id: "lineage-branch-connector",
        name: "Active Evolution Path",
        subtitle: "Step-by-step mutations",
        type: "branch_root",
        description: "The historical compiler forks and custom mutations applied to build the current deployed address.",
        children: lineageBranches
      });
    }

    // Push sisters list under a separate branch
    if (siblingNodes.length > 0) {
      root.children.push({
        id: "siblings-branch-connector",
        name: "Sister Implementations",
        subtitle: `Other standard forks in list (${siblingNodes.length})`,
        type: "branch_root",
        description: "Other tokens loaded in this tracker database that are detected to share the same abstract smart contract family blueprint.",
        children: siblingNodes
      });
    } else {
      // Add a placeholder sibling node explaining the uniqueness
      root.children.push({
        id: "siblings-empty",
        name: "Unique Deployment",
        subtitle: "No other list matches",
        type: "sibling",
        description: `This list only contains a single token matching the "${traceData.ancestorName}" blueprint standard specification.`
      });
    }

    return root;
  }, [traceData, sameArchetypeTokens, selectedTokenSymbol]);

  // Set initial selected node details
  useEffect(() => {
    setSelectedNodeDetails(treeData);
  }, [treeData]);

  // D3 Tree Rendering Engine
  useEffect(() => {
    if (!svgRef.current || !dimensions.width || !dimensions.height) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Margins
    const margin = { top: 30, right: 120, bottom: 30, left: 130 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Container for zooming/panning
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Setup zoom
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        // Calculate dynamic zoom percentage for preview
        const roundedZoom = Math.round(event.transform.k * 100);
        setZoomLevel(roundedZoom);
      });

    // Handle resetting zoom or double click zoom safely as standard D3 zoom behavior
    svg.call(zoomBehavior);

    // Tree layout
    const treeLayout = d3.tree<HeritageNodeData>().size([innerHeight, innerWidth]);

    // Construct hierarchy
    const rootNodes = d3.hierarchy<HeritageNodeData>(treeData);
    treeLayout(rootNodes);

    // Define colors for nodes
    const getColor = (type: string) => {
      switch (type) {
        case "ancestor":
          return "#4f46e5"; // Indigo-600
        case "evolution":
          return "#0284c7"; // Sky-600
        case "current":
          return "#e11d48"; // Rose-600 (Main highlight)
        case "sibling":
          return "#059669"; // Emerald-600
        case "branch_root":
          return "#64748b"; // Slate-500
        default:
          return "#94a3b8"; // Slate-400
      }
    };

    // Setup D3 Link Generator
    const linkGenerator = d3.linkHorizontal<any, d3.HierarchyPointNode<HeritageNodeData>>()
      .x((d) => d.y)
      .y((d) => d.x);

    // Draw connection lines (links) with curved Beziers, starting collapsed at parent's coordinate
    const link = g.selectAll(".link")
      .data(rootNodes.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", (d) => {
        return d.target.data.type === "current" ? "url(#rose-grad)" : "#e2e8f0";
      })
      .attr("stroke-width", (d) => {
        return d.target.data.type === "current" ? 3 : 2;
      })
      .attr("stroke-dasharray", (d) => {
        return d.target.data.type === "sibling" ? "4,4" : "none";
      })
      .style("opacity", 0)
      .attr("d", (d) => {
        // Start completely collapsed at the source node's position
        const sourcePoint = { x: d.source.x, y: d.source.y };
        return linkGenerator({ source: sourcePoint, target: sourcePoint } as any);
      });

    // Animate curved links growing out from their parent nodes and fading in
    link.transition()
      .duration(1000)
      .delay((d) => d.target.depth * 150)
      .ease(d3.easeCubicOut)
      .style("opacity", 1)
      .attr("d", (d) => linkGenerator(d as any));

    // Create gradient definitions inside defs
    const defs = svg.append("defs");
    const roseGrad = defs.append("linearGradient")
      .attr("id", "rose-grad")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    roseGrad.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1");
    roseGrad.append("stop").attr("offset", "100%").attr("stop-color", "#f43f5e");

    // Add nodes g, starting clustered at key parent coordinates
    const node = g.selectAll(".node")
      .data(rootNodes.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .style("opacity", 0)
      .attr("transform", (d) => {
        // Cluster initially at parent coordinate for a cohesive organic growth feeling
        const parentY = d.parent ? d.parent.y : d.y;
        const parentX = d.parent ? d.parent.x : d.x;
        return `translate(${parentY},${parentX})`;
      })
      .on("click", (event, d) => {
        setSelectedNodeDetails(d.data);
        
        // Highlight logic in D3: temporarily pulse selected circle scale elegantly with transitions
        d3.selectAll(".node-circle")
          .transition()
          .duration(200)
          .attr("r", (nodeD: any) => {
            if (nodeD.data.type === "ancestor") return 8;
            if (nodeD.data.type === "current") return 8;
            return 6;
          });
        
        const targetRadius = d.data.type === "ancestor" || d.data.type === "current" ? 11 : 9;
        d3.select(event.currentTarget)
          .select(".node-circle")
          .transition()
          .duration(200)
          .attr("r", targetRadius);
      });

    // Translate node groups smoothly to their final structured coordinates while fading in
    node.transition()
      .duration(1000)
      .delay((d) => d.depth * 150)
      .ease(d3.easeCubicInOut)
      .attr("transform", (d) => `translate(${d.y},${d.x})`)
      .style("opacity", 1);

    // Draw node backgrounds/halo circles on hover
    node.append("circle")
      .attr("class", "node-circle-glow")
      .attr("r", 12)
      .attr("fill", (d) => getColor(d.data.type))
      .attr("opacity", 0)
      .on("mouseover", function() {
        d3.select(this).transition().duration(200).attr("opacity", 0.15);
      })
      .on("mouseleave", function() {
        d3.select(this).transition().duration(200).attr("opacity", 0);
      });

    // Draw primary node circle with standard overshotted bounce
    const nodeCircle = node.append("circle")
      .attr("class", "node-circle")
      .attr("r", 0) // start at 0
      .attr("fill", "#ffffff")
      .attr("stroke", (d) => getColor(d.data.type))
      .attr("stroke-width", (d) => {
        if (d.data.type === "ancestor" || d.data.type === "current") return 3;
        return 2;
      });

    nodeCircle.transition()
      .duration(1100)
      .delay((d) => d.depth * 150 + 250) // delay so they bloom right as they settle
      .ease(d3.easeBackOut)
      .attr("r", (d) => {
        if (d.data.type === "ancestor") return 8;
        if (d.data.type === "current") return 8;
        return 6;
      });

    // Place elegant standard labels with a gentle delayed fade-in to prevent initial visual noise
    const nodeText = node.append("text")
      .attr("dy", ".31em")
      .attr("x", (d) => (d.children ? -12 : 12))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => d.data.name)
      .style("font-family", '"Inter", ui-sans-serif, system-ui, sans-serif')
      .style("font-size", (d) => {
        if (d.data.type === "ancestor" || d.data.type === "current") return "11px";
        return "10px";
      })
      .style("font-weight", (d) => {
        if (d.data.type === "ancestor" || d.data.type === "current") return "800";
        if (d.data.type === "branch_root") return "600";
        return "500";
      })
      .style("fill", (d) => {
        if (d.data.type === "current") return "#be123c"; // Darker rose for contrast
        return "#1e293b"; // Slate-800
      })
      .style("opacity", 0);

    nodeText.transition()
      .duration(800)
      .delay((d) => d.depth * 150 + 400)
      .style("opacity", 1);

    // Subtitle annotation block (e.g. Generation or type name)
    const nodeSubtitle = node.append("text")
      .attr("dy", "1.4em")
      .attr("x", (d) => (d.children ? -12 : 12))
      .attr("text-anchor", (d) => (d.children ? "end" : "start"))
      .text((d) => {
        if (!d.data.subtitle) return "";
        const maxLen = 18;
        return d.data.subtitle.length > maxLen 
          ? d.data.subtitle.substring(0, maxLen) + "..." 
          : d.data.subtitle;
      })
      .style("font-family", "monospace")
      .style("font-size", "8px")
      .style("fill", "#64748b")
      .style("font-weight", "400")
      .style("opacity", 0);

    nodeSubtitle.transition()
      .duration(800)
      .delay((d) => d.depth * 150 + 450)
      .style("opacity", 1);

    // Center viewport initially after positioning
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(30, 20).scale(0.95));

  }, [dimensions, treeData]);

  // Node type labels helper
  const getNodeTypeBadge = (type: string) => {
    switch (type) {
      case "ancestor":
        return {
          label: "Root Ancestor Spec Component",
          class: "bg-indigo-50 border-indigo-200 text-indigo-700"
        };
      case "evolution":
        return {
          label: "Intermediate Compiler Fork Mutation",
          class: "bg-sky-50 border-sky-200 text-sky-700"
        };
      case "current":
        return {
          label: "Selected Token Final Deployment",
          class: "bg-rose-50 border-rose-200 text-rose-700"
        };
      case "sibling":
        return {
          label: "Sister Contract Blueprint sharing Ancestor",
          class: "bg-emerald-50 border-emerald-200 text-emerald-700"
        };
      case "branch_root":
        return {
          label: "Lineage Flow Grouping",
          class: "bg-slate-50 border-slate-200 text-slate-700"
        };
      default:
        return {
          label: "Contract Node",
          class: "bg-slate-100 border-slate-200 text-slate-700"
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-0" id="d3-heritage-tree-widget">
      {/* Visual Title / Tool panel */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
            <Layers className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 font-sans uppercase tracking-wider">
              Smart Contract Evolutionary Genealogy Tree
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold font-sans">
              Powered by D3.js &bull; Drag to Pan &bull; Scroll to Zoom &bull; Click Node to Inspect
            </p>
          </div>
        </div>

        {/* Legend block */}
        <div className="flex flex-wrap items-center gap-2 text-[9px] font-sans">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            <span className="text-slate-500 font-bold">Ancestor</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span className="text-slate-500 font-bold">Evolution Step</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-500 font-bold">{selectedTokenSymbol} (New)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-500 font-bold">Sister Fork</span>
          </div>
          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            Zoom: {zoomLevel}%
          </span>
        </div>
      </div>

      {/* Render layout view */}
      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        
        {/* D3 canvas area */}
        <div className="md:col-span-8 bg-slate-50/40 relative overflow-hidden flex flex-col justify-between" ref={containerRef}>
          {/* Main D3 canvas SVG */}
          <svg
            ref={svgRef}
            width="100%"
            height={dimensions.height}
            className="block select-none"
            style={{ minHeight: "350px" }}
          />

          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-100 px-2.5 py-1.5 rounded-xl text-[10px] text-slate-500 pointer-events-none font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            Interactive Map: Click any circular handle coordinate above
          </div>
        </div>

        {/* Interactive detail sidebar panel */}
        <div className="md:col-span-4 p-5 space-y-4 bg-white self-stretch flex flex-col justify-between">
          {selectedNodeDetails ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <span className={`inline-block border text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider font-sans ${getNodeTypeBadge(selectedNodeDetails.type).class}`}>
                  {getNodeTypeBadge(selectedNodeDetails.type).label}
                </span>
                
                <h4 className="text-sm font-black text-slate-900 font-mono tracking-tight flex items-center gap-1">
                  {selectedNodeDetails.name}
                </h4>
                
                {selectedNodeDetails.subtitle && (
                  <p className="text-[10px] font-mono text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100 break-all leading-relaxed">
                    {selectedNodeDetails.subtitle}
                  </p>
                )}
              </div>

              {selectedNodeDetails.description && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase text-slate-400 font-sans block">
                    Historical Record & Purpose
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                    {selectedNodeDetails.description}
                  </p>
                </div>
              )}

              {/* Specific metadata context blocks */}
              {(selectedNodeDetails.date || selectedNodeDetails.divergence) && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl space-y-2">
                  {selectedNodeDetails.date && (
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="text-[10px] uppercase font-bold text-slate-400">Era/Launch:</span>
                      <span className="text-indigo-950 font-bold text-[10px]">{selectedNodeDetails.date}</span>
                    </div>
                  )}

                  {selectedNodeDetails.divergence && (
                    <div className="flex items-start gap-2 text-xs">
                      <Code className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-1">Divergence delta:</span>
                        <p className="text-slate-800 font-semibold font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-100">
                          {selectedNodeDetails.divergence}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Info className="w-8 h-8 text-slate-350 mx-auto mb-2" />
              Select a genealogy timeline coordinate to examine technical characteristics.
            </div>
          )}

          {/* Quick interactive tips helper */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2 text-[10px] text-slate-400 leading-normal font-sans">
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Smart Contract Genealogy Info:</strong> Every Solidity compile has an underlying signature standard pattern. Tracing back lets researchers study copycats, security audits, and hidden backdoors.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
