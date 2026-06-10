"use client";

import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

export const kit = new AppKit();

const getEthereum = () => {
  if (typeof window === "undefined") return null;
  return (window as any).ethereum;
};

export const ARC_TESTNET = {
  id: 5042002,
  hex: "0x4CEF52",
  name: "Arc Network Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
};

const ARC_TESTNET_PARAMS = {
  chainId: ARC_TESTNET.hex,
  chainName: ARC_TESTNET.name,
  nativeCurrency: ARC_TESTNET.nativeCurrency,
  rpcUrls: [ARC_TESTNET.rpcUrl],
  blockExplorerUrls: [ARC_TESTNET.explorerUrl],
};

export async function switchToArcTestnet() {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("MetaMask or Rabby wallet not found.");
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.hex }],
    });
  } catch (error: any) {
    if (error?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ARC_TESTNET_PARAMS],
      });

      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_TESTNET.hex }],
      });

      return;
    }

    throw error;
  }
}

export async function connectWallet() {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("MetaMask or Rabby wallet not found.");
  }

  const accounts = await ethereum.request({
    method: "eth_requestAccounts",
  });

  try {
    await switchToArcTestnet();
  } catch {
    console.log("Please switch to Arc Network Testnet manually.");
  }

  return accounts?.[0] || "";
}

export async function getConnectedAddress() {
  const ethereum = getEthereum();

  if (!ethereum) return "";

  const accounts = await ethereum.request({
    method: "eth_accounts",
  });

  return accounts?.[0] || "";
}

export async function createAdapter() {
  const ethereum = getEthereum();

  if (!ethereum) {
    throw new Error("MetaMask or Rabby wallet not found.");
  }

  return await createViemAdapterFromProvider({
    provider: ethereum,
  });
}