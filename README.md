# AI Wallet for Arc

A chat-based wallet assistant for Arc Testnet. Type what you want in plain language, review the prepared transaction, and sign it with your own wallet. The AI never signs anything.

Built by @gemresearches

## Features

- Send USDC on Arc Testnet, or on Arc Mainnet with real funds (separate tab with warnings and an explicit confirmation)
- Bridge USDC between Arc Testnet and other supported testnets
- Swap USDC and EURC on Arc Testnet
- Unified Balance: deposit USDC from several chains and spend it as one balance
- Understands natural language in any language when an AI key is configured
- Built-in documentation with diagrams, open it from the Docs button at the top of the app

## Tech stack

- Vite, React, TypeScript, Tailwind CSS
- wagmi, viem, ConnectKit for wallet connection
- Circle App Kit for send, bridge, swap and unified balance
- Bun server for the chat API (DeepSeek for language understanding)

## Development

Prerequisites: [Bun](https://bun.sh).

```bash
bun install
bun run server   # chat API on port 3001
bun run dev      # web app on port 5173 (proxies /api to the chat API)
```

Other scripts: `bun run check` (lint and typecheck).

### Environment variables

| Name | Purpose |
| --- | --- |
| `DEEPSEEK_API_KEY` | Optional. Lets the assistant understand free-form messages in any language. Without it, a built-in parser handles common English commands. Keep it server-side, never prefix it with `VITE_`. |

Restart the chat API after changing `.env`.
