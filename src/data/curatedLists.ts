import { CuratedTokenList, TokenInfo } from "../types";

export const CURATED_LISTS: CuratedTokenList[] = [
  {
    id: "uniswap",
    name: "Uniswap Default",
    desc: "The standard list of popular, reputable assets supported by the Uniswap protocol.",
    logoURI: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Uniswap_Logo.svg",
    url: "https://tokens.uniswap.org",
    author: "Uniswap",
    recommendationType: "Core"
  },
  {
    id: "coingecko",
    name: "CoinGecko All",
    desc: "A comprehensive list of active tokens verified and indexed by CoinGecko.",
    logoURI: "https://assets.coingecko.com/coingecko/brand/Gecko-White-Briefcase_sm.png",
    url: "https://tokens.coingecko.com/uniswap/all.json",
    author: "CoinGecko",
    recommendationType: "Aggregator"
  },
  {
    id: "1inch",
    name: "1inch Token List",
    desc: "Optimized token list dynamically curated for 1inch router's liquidity aggregated sources.",
    logoURI: "https://app.1inch.io/assets/images/logo.png",
    url: "https://tokens.1inch.eth.link",
    author: "1inch Network",
    recommendationType: "Aggregator"
  },
  {
    id: "optimism",
    name: "Optimism Gateway",
    desc: "Official tokens bridged and standard-linked across the Optimism L2 ecosystem.",
    logoURI: "https://raw.githubusercontent.com/ethereum-optimism/brand-assets/main/assets/OP-Logo-Color.svg",
    url: "https://static.optimism.io/optimism.tokenlist.json",
    author: "Optimism Foundation",
    recommendationType: "Ecosystem"
  },
  {
    id: "arbitrum",
    name: "Arbitrum Bridge List",
    desc: "The official token gateway registrar for the Arbitrum One Rollup network.",
    logoURI: "https://bridge.arbitrum.io/logo.png",
    url: "https://bridge.arbitrum.io/token-list-42161.json",
    author: "Offchain Labs",
    recommendationType: "Ecosystem"
  },
  {
    id: "aave",
    name: "Aave Market List",
    desc: "Interoperable borrow-lend assets compatible with the Aave V2/V3 liquidity pools.",
    logoURI: "https://app.aave.com/icons/tokens/aave.svg",
    url: "https://tokenlist.aave.eth.link",
    author: "Aave Lending",
    recommendationType: "Core"
  },
  {
    id: "compound",
    name: "Compound Finance",
    desc: "Assets accepted as collateral and borrow reserves in the Compound V2/V3 markets.",
    logoURI: "https://app.compound.finance/images/favicon.ico",
    url: "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
    author: "Compound Labs",
    recommendationType: "Core"
  }
];

export interface ChainMetadata {
  id: number;
  name: string;
  symbol: string;
  color: string;
  explorer: string;
}

export const CHAINS_MAP: Record<number, ChainMetadata> = {
  1: {
    id: 1,
    name: "Ethereum",
    symbol: "ETH",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    explorer: "https://etherscan.io"
  },
  10: {
    id: 10,
    name: "Optimism",
    symbol: "OP",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    explorer: "https://optimistic.etherscan.io"
  },
  56: {
    id: 56,
    name: "BSC",
    symbol: "BNB",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    explorer: "https://bscscan.com"
  },
  137: {
    id: 137,
    name: "Polygon",
    symbol: "POL",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    explorer: "https://polygonscan.com"
  },
  8453: {
    id: 8453,
    name: "Base",
    symbol: "BASE",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    explorer: "https://basescan.org"
  },
  42161: {
    id: 42161,
    name: "Arbitrum",
    symbol: "ARB",
    color: "bg-sky-50 text-sky-700 border-sky-200",
    explorer: "https://arbiscan.io"
  },
  43114: {
    id: 43114,
    name: "Avalanche",
    symbol: "AVAX",
    color: "bg-red-50 text-red-700 border-red-200",
    explorer: "https://snowtrace.io"
  }
};

// Seed tokens to ensure instant elegant load of lists
export const FALLBACK_TOKENS: Record<string, TokenInfo[]> = {
  uniswap: [
    {
      chainId: 1,
      address: "0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png"
    },
    {
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png"
    },
    {
      chainId: 1,
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      symbol: "USDT",
      name: "Tether USD",
      decimals: 6,
      logoURI: "https://assets.coingecko.com/coins/images/325/thumb/Tether.png"
    },
    {
      chainId: 1,
      address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      symbol: "WBTC",
      name: "Wrapped Bitcoin",
      decimals: 8,
      logoURI: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png"
    },
    {
      chainId: 1,
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      symbol: "UNI",
      name: "Uniswap",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png"
    },
    {
      chainId: 1,
      address: "0x7Fc66500c84A76ad7e9c93437bFc5Ac33E2DDaE9",
      symbol: "AAVE",
      name: "Aave",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/12646/thumb/AAVE.png"
    }
  ],
  coingecko: [
    {
      chainId: 1,
      address: "0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped Ether",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png"
    },
    {
      chainId: 1,
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 6,
      logoURI: "https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png"
    },
    {
      chainId: 1,
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      symbol: "LINK",
      name: "Chainlink",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/877/thumb/chainlink-link-logo.png"
    },
    {
      chainId: 1,
      address: "0x95aD61b0a150d79219dcf64e1E6Cc01f0B64C4cE",
      symbol: "SHIB",
      name: "Shiba Inu",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/11939/thumb/shiba.png"
    }
  ],
  aave: [
    {
      chainId: 1,
      address: "0x7Fc66500c84A76ad7e9c93437bFc5Ac33E2DDaE9",
      symbol: "AAVE",
      name: "Aave Token",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/12646/thumb/AAVE.png"
    },
    {
      chainId: 1,
      address: "0xC02aaA39b223FE8D0A0e5C4F27ead9083C756Cc2",
      symbol: "WETH",
      name: "Wrapped ether",
      decimals: 18,
      logoURI: "https://assets.coingecko.com/coins/images/2518/thumb/weth.png"
    }
  ]
};
