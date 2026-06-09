"use client";

import { useState } from "react";
import { isAddress } from "viem";
import { createAdapter, kit } from "../lib/arc";

function safeStringify(value: any) {
  return JSON.stringify(
    value,
    (_key, val) => (typeof val === "bigint" ? val.toString() : val),
    2
  );
}

export default function SendConfirm({ intent }: { intent: any }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function sendToken() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      if (!intent?.to || !isAddress(intent.to)) {
        throw new Error("Invalid recipient wallet address.");
      }

      if (!intent?.amount || Number(intent.amount) <= 0) {
        throw new Error("Invalid token amount.");
      }

      const adapter = await createAdapter();

      const params = {
        from: {
          adapter,
          chain: "Arc_Testnet",
        },
        to: intent.to,
        amount: String(intent.amount),
        token: intent.token || "USDC",
      } as any;

      console.log("SEND PARAMS:", params);

      const estimate = await kit.estimateSend(params);
      console.log("ESTIMATE RESULT:", estimate);

      const tx = await kit.send(params);
      console.log("FULL SEND RESULT:", tx);

      setResult(tx);
    } catch (err: any) {
      console.error("SEND ERROR:", err);
      setError(err?.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  }

  const txHash = result?.txHash || result?.hash || result?.transactionHash;

  return (
    <div className="confirmCard">
      <div className="confirmTop">
        <div>
          <h3>Send Confirmation</h3>
          <p>Review details before signing.</p>
        </div>
        <span className="statusPill">USDC</span>
      </div>

      <div className="detailList">
        <div>
          <span>Amount</span>
          <b>{intent.amount}</b>
        </div>
        <div>
          <span>Token</span>
          <b>{intent.token || "USDC"}</b>
        </div>
        <div>
          <span>Recipient</span>
          <b className="mono">{intent.to}</b>
        </div>
        <div>
          <span>Network</span>
          <b>Arc Testnet</b>
        </div>
      </div>

      <button className="primaryAction" onClick={sendToken} disabled={loading}>
        {loading ? "Waiting for wallet..." : "Confirm Transaction"}
      </button>

      {error && <p className="errorText">{error}</p>}

      {txHash && (
        <div className="successBox">
          <h4>Transaction Successful</h4>
          <p className="mono">{txHash}</p>
          <a
            href={`https://testnet.arcscan.app/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            View on ArcScan
          </a>
        </div>
      )}

      {result && (
        <pre className="resultBox">{safeStringify(result)}</pre>
      )}
    </div>
  );
}