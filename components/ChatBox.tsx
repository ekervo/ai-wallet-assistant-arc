"use client";

import { useState } from "react";
import SendConfirm from "./SendConfirm";
import BridgeConfirm from "./BridgeConfirm";
import UnifiedBalancePanel from "./UnifiedBalancePanel";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUPPORTED_ACTIONS = [
  "send_token",
  "bridge_token",
  "swap_token",
  "unified_balance",
  "unified_balance_deposit",
  "unified_balance_spend",
];

function getUnifiedBalanceFallbackIntent(text: string) {
  const lower = text.toLowerCase();

  if (!lower.includes("unified balance")) return null;

  if (
    lower.includes("check") ||
    lower.includes("show") ||
    lower.includes("balance")
  ) {
    return {
      action: "unified_balance",
    };
  }

  if (lower.includes("deposit")) {
    const amountMatch = text.match(/deposit\s+([\d.]+)/i);

    return {
      action: "unified_balance_deposit",
      amount: amountMatch?.[1] || "1",
      fromChain: lower.includes("arbitrum")
        ? "Arbitrum_Sepolia"
        : lower.includes("ethereum")
        ? "Ethereum_Sepolia"
        : lower.includes("polygon")
        ? "Polygon_Amoy_Testnet"
        : "Base_Sepolia",
    };
  }

  if (lower.includes("spend") || lower.includes("pay")) {
    const amountMatch = text.match(/(?:spend|pay)\s+([\d.]+)/i);
    const addressMatch = text.match(/0x[a-fA-F0-9]{40}/);

    return {
      action: "unified_balance_spend",
      amount: amountMatch?.[1] || "1",
      to: addressMatch?.[0] || "",
    };
  }

  return null;
}

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [intent, setIntent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage(customMessage?: string) {
    const userText = (customMessage || message).trim();

    if (!userText || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setMessage("");
    setIntent(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      let nextIntent = data.intent;

      const fallbackIntent = getUnifiedBalanceFallbackIntent(userText);

      if (
        fallbackIntent &&
        (!nextIntent ||
          nextIntent.action === "bridge_token" ||
          nextIntent.action === "send_token")
      ) {
        nextIntent = fallbackIntent;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            (nextIntent
              ? "Please review and confirm."
              : "I can help you send, bridge, or manage Unified Balance USDC."),
        },
      ]);

      if (nextIntent?.action && SUPPORTED_ACTIONS.includes(nextIntent.action)) {
        setIntent(nextIntent);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <section className="appGrid">
      <div className="consolePanel">
        <div className="sectionLabel">Natural Language Transactions</div>

        <h1>AI Wallet Assistant</h1>

        <p className="subtitle">
          Send, bridge, and manage Unified Balance USDC with plain text — you
          always review and sign.
        </p>

        <div className="supported">
          <div className="smallTitle">Supported App Kit Actions</div>

          <div className="chips">
            <span>Send</span>
            <span>Bridge</span>
            <span>Unified Balance</span>
            <span>Deposit</span>
            <span>Spend</span>
            <span>Swap Soon</span>
          </div>
        </div>

        <div className="supported">
          <div className="smallTitle">Supported Bridge Chains</div>

          <div className="chips">
            <span>Arc_Testnet</span>
            <span>Arbitrum_Sepolia</span>
            <span>Avalanche_Fuji</span>
            <span>Base_Sepolia</span>
            <span>Ethereum_Sepolia</span>
            <span>Polygon_Amoy_Testnet</span>
            <span>Optimism_Sepolia</span>
          </div>
        </div>

        <div className="smallTitle withLine">Agent Console</div>

        <div className="messages">
          {messages.length === 0 && (
            <div className="emptyMessage">
              Ask your wallet assistant to prepare a transaction.
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <span>{msg.role === "user" ? "You" : "Assistant"}</span>
              <p>{msg.content}</p>
            </div>
          ))}

          {loading && <div className="emptyMessage">Processing request...</div>}
        </div>

        <div className="quickActions">
          <button
            onClick={() =>
              sendMessage(
                "Send 1 USDC to 0x468867c80Ca690528D4044DCaD22161aa6b47B91"
              )
            }
          >
            Send 1 USDC
          </button>

          <button
            onClick={() =>
              sendMessage("Bridge 1 USDC from Base Sepolia to Arc")
            }
          >
            Bridge Base → Arc
          </button>

          <button onClick={() => sendMessage("Check my unified balance")}>
            Check Unified Balance
          </button>

          <button
            onClick={() =>
              sendMessage("Deposit 1 USDC from Base Sepolia to unified balance")
            }
          >
            Deposit Unified
          </button>

          <button
            onClick={() =>
              sendMessage(
                "Spend 1 USDC from unified balance to 0x247f63331E37f349778b651FDB21ee5303dE0132"
              )
            }
          >
            Spend Unified
          </button>
        </div>

        <div className="composer">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send 1 USDC to 0x... or Spend 1 USDC from unified balance to 0x..."
            rows={2}
          />

          <button onClick={() => sendMessage()} disabled={loading}>
            ↑
          </button>
        </div>
      </div>

      <div className="reviewPanel">
        <div className="smallTitle">Transaction Review</div>

        {!intent && (
          <div className="emptyReview">
            <div className="reviewIcon">⌁</div>
            <h3>No pending action</h3>
            <p>Your transaction confirmation will appear here to review.</p>
          </div>
        )}

        {intent?.action === "send_token" && <SendConfirm intent={intent} />}

        {intent?.action === "bridge_token" && <BridgeConfirm intent={intent} />}

        {intent?.action === "unified_balance" && <UnifiedBalancePanel />}

        {intent?.action === "unified_balance_deposit" && (
          <UnifiedBalancePanel intent={intent} defaultMode="deposit" />
        )}

        {intent?.action === "unified_balance_spend" && (
          <UnifiedBalancePanel intent={intent} defaultMode="spend" />
        )}

        <div className="statGrid">
          <div className="statCard">
            <span>Network</span>
            <b>Arc Testnet</b>
          </div>

          <div className="statCard">
            <span>Security</span>
            <b>User Signed</b>
          </div>
        </div>
      </div>
    </section>
  );
}