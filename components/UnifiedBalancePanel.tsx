"use client";

import { useEffect, useState } from "react";
import {
  getUnifiedBalance,
  depositUnifiedBalance,
  spendUnifiedBalance,
} from "../lib/unifiedBalance";

type Props = {
  intent?: any;
  defaultMode?: "deposit" | "spend";
};

function safeStringify(value: any) {
  return JSON.stringify(
    value,
    (_key, val) => (typeof val === "bigint" ? val.toString() : val),
    2
  );
}

function displayChain(chain: string) {
  return chain.replace(/_/g, " ");
}

export default function UnifiedBalancePanel({
  intent,
  defaultMode = "deposit",
}: Props) {
  const [mode, setMode] = useState<"deposit" | "spend">(defaultMode);
  const [amount, setAmount] = useState(intent?.amount || "1");
  const [fromChain, setFromChain] = useState(
    intent?.fromChain || "Base_Sepolia"
  );
  const [recipient, setRecipient] = useState(intent?.to || "");

  const [balance, setBalance] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadBalance() {
    try {
      const data = await getUnifiedBalance();
      setBalance(data);
    } catch {}
  }

  useEffect(() => {
    loadBalance();
  }, []);

  async function handleDeposit() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const tx = await depositUnifiedBalance(fromChain, amount);

      setResult(tx);
      await loadBalance();
    } catch (err: any) {
      setError(err?.message || "Deposit failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSpend() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const tx = await spendUnifiedBalance(recipient, amount);

      setResult(tx);
      await loadBalance();
    } catch (err: any) {
      setError(err?.message || "Spend failed.");
    } finally {
      setLoading(false);
    }
  }

  const isDeposit = mode === "deposit";
  const isSpend = mode === "spend";

  return (
    <div className="confirmCard">
      <div className="confirmTop">
        <div>
          <h3>
            {isDeposit
              ? "Unified Balance Deposit"
              : "Unified Balance Spend"}
          </h3>

          <p>
            {isDeposit
              ? "Review deposit details before signing."
              : "Review spend details before signing."}
          </p>
        </div>

        <span className="statusPill">USDC</span>
      </div>

      <div className="detailList">
        <div>
          <span>Total Unified Balance</span>
          <b>{balance?.totalConfirmedBalance || "0.00"} USDC</b>
        </div>

        <div>
          <span>Amount</span>
          <input
            className="confirmInput"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="1"
          />
        </div>

        {isDeposit && (
          <div>
            <span>Source Chain</span>
            <select
              className="confirmInput"
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
            >
              <option value="Base_Sepolia">Base Sepolia</option>
              <option value="Arbitrum_Sepolia">Arbitrum Sepolia</option>
              <option value="Ethereum_Sepolia">Ethereum Sepolia</option>
              <option value="Polygon_Amoy_Testnet">Polygon Amoy</option>
              <option value="Optimism_Sepolia">Optimism Sepolia</option>
              <option value="Avalanche_Fuji">Avalanche Fuji</option>
            </select>
          </div>
        )}

        {isSpend && (
          <div>
            <span>Recipient</span>
            <input
              className="confirmInput mono"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
            />
          </div>
        )}

        <div>
          <span>Token</span>
          <b>USDC</b>
        </div>

        <div>
          <span>Network</span>
          <b>{isDeposit ? displayChain(fromChain) : "Arc Testnet"}</b>
        </div>
      </div>

      <button
        className="primaryAction"
        onClick={isDeposit ? handleDeposit : handleSpend}
        disabled={loading}
      >
        {loading
          ? isDeposit
            ? "Submitting Deposit..."
            : "Submitting Spend..."
          : isDeposit
          ? "Confirm Deposit"
          : "Confirm Spend"}
      </button>

      {error && <p className="errorText">{error}</p>}

      {result?.txHash && (
        <div className="successBox">
          <b>Transaction submitted</b>
          <br />
          <a
            href={`https://testnet.arcscan.app/tx/${result.txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on ArcScan
          </a>
        </div>
      )}

      {result && <pre className="resultBox">{safeStringify(result)}</pre>}
    </div>
  );
}