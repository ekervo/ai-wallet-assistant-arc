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

export default function BridgeConfirm({ intent }: { intent: any }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function confirmBridge() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      if (!intent.amount || Number(intent.amount) <= 0) {
        throw new Error("Invalid bridge amount.");
      }

      if (!intent.fromChain || !intent.toChain) {
        throw new Error("Missing bridge chain.");
      }

      if (intent.fromChain === intent.toChain) {
        throw new Error("Source and destination chains must be different.");
      }

      setStatus("Preparing bridge transaction...");

      const adapter = await createAdapter();

      const params = {
        from: {
          adapter,
          chain: intent.fromChain,
        },
        to: {
          adapter,
          chain: intent.toChain,
        },
        amount: String(intent.amount),
      } as any;

      console.log("BRIDGE PARAMS:", params);

      setStatus("Please confirm the bridge transaction in your wallet...");

      const bridgeResult = await kit.bridge(params);

      console.log("BRIDGE RESULT:", bridgeResult);

      setResult(bridgeResult);
      setStatus("Bridge submitted. Settlement may take a few minutes.");
    } catch (err: any) {
      console.error("BRIDGE ERROR:", err);
      setError(err?.message || "Bridge failed.");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  const txHash =
    result?.txHash ||
    result?.steps?.find((s: any) => s?.txHash)?.txHash ||
    result?.steps?.find((s: any) => s?.transactionHash)?.transactionHash;

  return (
    <div className="confirmCard">
      <div className="confirmTop">
        <div>
          <h3>Bridge Confirmation</h3>
          <p>Cross-chain settlement can take several minutes.</p>
        </div>
        <span className="statusPill">USDC</span>
      </div>

      <div className="detailList">
        <div>
          <span>Amount</span>
          <b>{intent.amount}</b>
        </div>
        <div>
          <span>From</span>
          <b>{intent.fromChain}</b>
        </div>
        <div>
          <span>To</span>
          <b>{intent.toChain}</b>
        </div>
        <div>
          <span>Token</span>
          <b>USDC</b>
        </div>
      </div>

      <button className="primaryAction" onClick={confirmBridge} disabled={loading}>
        {loading ? "Waiting for wallet..." : "Confirm Bridge"}
      </button>

      {status && <p className="statusText">{status}</p>}
      {error && <p className="errorText">{error}</p>}

      {result?.steps?.map((step: any, index: number) => (
        <div key={index} className="stepItem">
          <b>Step {index + 1}</b>
          <span>
            {step.name} — {step.state}
          </span>

          {step?.explorerUrl && (
            <a href={step.explorerUrl} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          )}

          {step?.data?.explorerUrl && (
            <a href={step.data.explorerUrl} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          )}
        </div>
      ))}

      {txHash && (
        <div className="successBox">
          <h4>Bridge Submitted</h4>
          <p className="mono">{txHash}</p>
        </div>
      )}

      {result && <pre className="resultBox">{safeStringify(result)}</pre>}
    </div>
  );
}