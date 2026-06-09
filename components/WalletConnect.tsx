"use client";

import { useEffect, useState } from "react";
import { connectWallet, getConnectedAddress, switchToArcTestnet } from "../lib/arc";

export default function WalletConnect() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletError, setWalletError] = useState("");

  async function handleConnect() {
    try {
      setLoading(true);
      setWalletError("");

      const wallet = await connectWallet();

      if (!wallet) {
        setWalletError("Wallet connection failed.");
        return;
      }

      setAddress(wallet);
    } catch (error: any) {
      setWalletError(error?.message || "Wallet connection rejected.");
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    setAddress("");
    setWalletError("");
  }

  useEffect(() => {
    async function initWallet() {
      try {
        const wallet = await getConnectedAddress();

        if (wallet) {
          setAddress(wallet);
          await switchToArcTestnet();
        }
      } catch {
        setWalletError("");
      }
    }

    initWallet();
  }, []);

  if (address) {
    return (
      <div>
        <div className="walletConnected">
          <span className="statusDot" />

          <span className="walletAddress">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>

          <button className="disconnectBtn" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>

        {walletError && <p className="errorText">{walletError}</p>}
      </div>
    );
  }

  return (
    <div>
      <button className="connectBtn" onClick={handleConnect} disabled={loading}>
        {loading ? "Connecting..." : "Connect Wallet"}
      </button>

      {walletError && <p className="errorText">{walletError}</p>}
    </div>
  );
}