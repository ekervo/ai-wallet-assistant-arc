"use client";

import { AppKit } from "@circle-fin/app-kit";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";

export const kit = new AppKit();

declare global {
  interface Window {
    ethereum?: any;
  }
}

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
  if (!window.ethereum) {
    throw new Error("MetaMask or Rabby wallet not found.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.hex }],
    });
  } catch (error: any) {
    if (error?.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ARC_TESTNET_PARAMS],
      });

      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_TESTNET.hex }],
      });

      return;
    }

    throw error;
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask or Rabby wallet not found.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  try {
    await switchToArcTestnet();
  } catch {
    // Không chặn connect nếu MetaMask đang lỗi add/switch RPC
    console.log("Please switch to Arc Network Testnet manually.");
  }

  return accounts?.[0] || "";
}

export async function getConnectedAddress() {
  if (typeof window === "undefined") return "";
  if (!window.ethereum) return "";

  const accounts = await window.ethereum.request({
    method: "eth_accounts",
  });

  return accounts?.[0] || "";
}

export async function createAdapter() {
  if (!window.ethereum) {
    throw new Error("MetaMask or Rabby wallet not found.");
  }

  return createViemAdapterFromProvider({
    provider: window.ethereum,
  });
}