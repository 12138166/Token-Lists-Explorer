export interface TokenInfo {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
  extensions?: Record<string, any>;
}

export interface TokenListVersion {
  major: number;
  minor: number;
  patch: number;
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: TokenListVersion;
  logoURI?: string;
  keywords?: string[];
  tags?: Record<string, { name: string; description: string }>;
  tokens: TokenInfo[];
}

export interface CuratedTokenList {
  id: string;
  name: string;
  desc: string;
  logoURI: string;
  url: string;
  author: string;
  recommendationType: "Core" | "Aggregator" | "Ecosystem" | "Custom";
}

export interface ListValidationError {
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ListValidationResult {
  isValid: boolean;
  errors: ListValidationError[];
  tokenCount: number;
  detectedChains: number[];
}

export interface AiExplanationResponse {
  name: string;
  symbol: string;
  description: string;
  useCase: string;
  ecosystemSummary: string;
  reputationAndSecurity: string;
}

export interface AiAuditResponse {
  overallRisk: "Low" | "Medium" | "High";
  score: number; // 0 to 100
  summary: string;
  findings: Array<{
    title: string;
    type: "warning" | "info" | "success";
    description: string;
  }>;
  safetyRecommendations: string[];
}

export interface LineageStep {
  generation: number;
  contractName: string;
  evolutionType: string;
  approximateDate: string;
  description: string;
  codeDivergenceBrief: string;
  blockNumber?: number;
}

export interface CodeComparison {
  fileName: string;
  methodName: string;
  parentCode: string;
  childCode: string;
  differenceExplanation: string;
}

export interface AncestorTraceResponse {
  ancestorName: string;
  ancestorAddress: string;
  ancestorDescription: string;
  lineageSteps: LineageStep[];
  codeComparisons: CodeComparison[];
  reputationRating: string;
  evolutionAnalysis: string;
}

export interface LineDiff {
  lineNumber: number;
  type: "added" | "removed" | "unchanged";
  code: string;
}

export interface CodeDiffCompare {
  fileName: string;
  className: string;
  similarityPercentage: number;
  explanation: string;
  diffLines: LineDiff[];
}

export interface BytecodeSegmentDiff {
  offset: string;
  token1Bytecode: string;
  token2Bytecode: string;
  type: "match" | "mismatch" | "missing";
  instructionInterpretation: string;
}

export interface ContractCompareResponse {
  token1Name: string;
  token2Name: string;
  similarityScore: number;
  generalComparisonSummary: string;
  sourceCodeDiffs: CodeDiffCompare[];
  bytecodeSegments: BytecodeSegmentDiff[];
  evolutionaryVerdict: string;
}

export interface DecompileFunction {
  name: string;
  signature: string;
  solidityEquivalent: string;
  logicOverview: string;
}

export interface DecompileStorageSlot {
  slot: string;
  variableName: string;
  type: string;
  description: string;
}

export interface DecompileResponse {
  contractName: string;
  address: string;
  chainId: number;
  bytecode: string;
  opcodes: string;
  pseudocode: string;
  summary: string;
  functions: DecompileFunction[];
  storageSlots: DecompileStorageSlot[];
}



