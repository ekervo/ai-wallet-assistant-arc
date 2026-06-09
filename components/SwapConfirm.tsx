"use client";

import { useState } from "react";
import { createAdapter, kit } from "../lib/arc";

function safeStringify(value: any) {
  return JSON.stringify(
    value,
    (_key, val) => (typeof val === "bigint" ? val.toString() : val),
    2
  );
}

export default function SwapConfirm({ intent }: { intent: any }) {
  const [amountIn, setAmountIn] = useState(intent.amountIn || "");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function confirmSwap() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const kitKey = process.env.NEXT_PUBLIC_KIT_KEY;

      if (!kitKey) {
        throw new Error("Missing NEXT_PUBLIC_KIT_KEY in .env.local");
      }

      if (!amountIn || Number(amountIn) <= 0) {
        throw new Error("Invalid swap amount.");
      }

      if (!intent.tokenIn || !intent.tokenOut) {
        throw new Error("Missing swap token.");
      }

      setStatus("Preparing swap transaction...");

      const adapter = await createAdapter();

      const params = {
        from: {
          adapter,
          chain: intent.chain || "Arc_Testnet",
        },
        tokenIn: String(intent.tokenIn).toUpperCase(),
        tokenOut: String(intent.tokenOut).toUpperCase(),
        amountIn: String(amountIn),
        config: {
          kitKey,
        },
      } as any;

      console.log("SWAP PARAMS:", params);

      setStatus("Please confirm the swap transaction in your wallet...");

      const swapResult = await kit.swap(params);

      console.log("SWAP RESULT:", swapResult);

      setResult(swapResult);
      setStatus("Swap submitted successfully.");
    } catch (err: any) {
      console.error("SWAP ERROR:", err);
      setError(err?.message || "Swap failed.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, marginTop: 16 }}>
      <h3>Swap Confirmation</h3>

      <p>
        <b>From Token:</b> {intent.tokenIn}
      </p>

      <p>
        <b>To Token:</b> {intent.tokenOut}
      </p>

      <p>
        <b>Network:</b> {intent.chain || "Arc_Testnet"}
      </p>

      <label>
        <b>Amount</b>
        <input
          type="number"
          value={amountIn}
          onChange={(e) => setAmountIn(e.target.value)}
          placeholder="Enter amount"
          min="0"
          step="0.01"
          disabled={loading}
          style={{
            display: "block",
            marginTop: 6,
            marginBottom: 12,
            padding: 8,
            width: 180,
          }}
        />
      </label>

      <button onClick={confirmSwap} disabled={loading}>
        {loading ? "Waiting for wallet..." : "Confirm Swap"}
      </button>

      {status && <p>{status}</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {result?.explorerUrl && (
        <p>
          <a href={result.explorerUrl} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        </p>
      )}

      {result && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
          {safeStringify(result)}
        </pre>
      )}
    </div>
  );
}