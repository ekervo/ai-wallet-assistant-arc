import { kit } from "./arc";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

export const UNIFIED_BALANCE_CHAINS: any = {
  Ethereum_Sepolia: {
    chainId: "0xaa36a7",
    chainName: "Ethereum Sepolia",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },

  Base_Sepolia: {
    chainId: "0x14a34",
    chainName: "Base Sepolia",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
  },

  Arbitrum_Sepolia: {
    chainId: "0x66eee",
    chainName: "Arbitrum Sepolia",
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
  },

  Polygon_Amoy_Testnet: {
    chainId: "0x13882",
    chainName: "Polygon Amoy",
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    blockExplorerUrls: ["https://amoy.polygonscan.com"],
  },
  Optimism_Sepolia: {
    chainId: "0xaa37dc",
    chainName: "Optimism Sepolia",
    rpcUrls: ["https://sepolia.optimism.io"],
    nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
  },

  Avalanche_Fuji: {
    chainId: "0xa869",
    chainName: "Avalanche Fuji",
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
    blockExplorerUrls: ["https://testnet.snowtrace.io"],
  },
};

function getEthereum() {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum;
}

async function getWalletAdapter() {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("Wallet not found.");
  }

  return await createViemAdapterFromProvider({
    provider: ethereum,
  });
}

export async function switchToChain(chain: string) {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("Wallet not found.");
  }

  const config = UNIFIED_BALANCE_CHAINS[chain];

  if (!config) {
    throw new Error("Unsupported Unified Balance chain.");
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: config.chainId }],
    });
  } catch (error: any) {
    if (error?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [config],
      });

      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.chainId }],
      });
    } else {
      throw error;
    }
  }
}

function safeStringify(value: any) {
  return JSON.stringify(
    value,
    (_key, currentValue) =>
      typeof currentValue === "bigint" ? currentValue.toString() : currentValue,
    2
  );
}

export async function getUnifiedBalance() {
  const adapter = await getWalletAdapter();

  const result = await kit.unifiedBalance.getBalances({
    sources: [{ adapter }],
    networkType: "testnet",
    includePending: true,
  });

  console.log("UNIFIED BALANCE FULL:", safeStringify(result));

  return result;
}

export async function depositUnifiedBalance(chain: string, amount: string) {
  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid deposit amount.");
  }

  await switchToChain(chain);

  const adapter = await getWalletAdapter();

  return await kit.unifiedBalance.deposit({
    amount: String(amount),
    token: "USDC",
    from: {
      adapter,
      chain: chain as any,
    },
  });
}

export async function spendUnifiedBalance(to: string, amount: string) {
  if (!to || !to.startsWith("0x")) {
    throw new Error("Invalid recipient address.");
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error("Invalid spend amount.");
  }

  const adapter = await getWalletAdapter();

  const balanceData = await kit.unifiedBalance.getBalances({
    sources: [{ adapter }],
    networkType: "testnet",
    includePending: true,
  });

  const chains = balanceData?.breakdown?.[0]?.breakdown || [];

  let remaining = Number(amount);

  const allocations = chains
    .map((item: any) => ({
      chain: item.chain,
      balance: Number(item.confirmedBalance || 0),
    }))
    .filter((item: any) => item.balance > 0)
    .sort((a: any, b: any) => b.balance - a.balance)
    .map((item: any) => {
      if (remaining <= 0) return null;

      const useAmount = Math.min(item.balance, remaining);
      remaining -= useAmount;

      return {
        chain: item.chain as any,
        amount: useAmount.toFixed(6),
      };
    })
    .filter(Boolean);

  if (remaining > 0) {
    throw new Error("Insufficient Unified Balance across all chains.");
  }

  return await kit.unifiedBalance.spend({
    amount: String(amount),
    token: "USDC",
    from: {
      adapter,
      allocations,
    },
    to: {
      adapter,
      chain: "Arc_Testnet" as any,
      recipientAddress: to as `0x${string}`,
    },
  });
}