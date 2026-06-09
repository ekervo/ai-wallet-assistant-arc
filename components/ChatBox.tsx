"use client";

import { useState } from "react";
import SendConfirm from "./SendConfirm";
import BridgeConfirm from "./BridgeConfirm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatBox() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [intent, setIntent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim() || loading) return;

    const userText = message.trim();

    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setMessage("");
    setIntent(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Please review and confirm.",
        },
      ]);

      if (
        data.intent?.action === "send_token" ||
        data.intent?.action === "bridge_token"
      ) {
        setIntent(data.intent);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
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
          Send and bridge USDC with plain text — you always review and sign.
        </p>

        <div className="supported">
          <div className="smallTitle">Supported Bridges</div>
          <div className="chips">
            <span>Arc_Testnet</span>
            <span>Arbitrum_Sepolia</span>
            <span>Avalanche_Fuji</span>
            <span>Base_Sepolia</span>
            <span>Ethereum_Sepolia</span>
            <span>Polygon_Amoy_Testnet</span>
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
          <button onClick={() => setMessage("Send 1 USDC to 0x...")}>
            Send 1 USDC to 0x...
          </button>
          <button
            onClick={() =>
              setMessage("Bridge 1 USDC from Base Sepolia to Arc")
            }
          >
            Bridge from Base Sepolia to Arc
          </button>
        </div>

        <div className="composer">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send 1 USDC to 0x... or Bridge 1 USDC from Base Sepolia to Arc"
            rows={2}
          />
          <button onClick={sendMessage} disabled={loading}>
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