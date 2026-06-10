import WalletConnect from "../components/WalletConnect";
import ChatBox from "../components/ChatBox";

const capabilities = [
  {
    title: "Send",
    status: "Live",
    desc: "Send USDC from one wallet to another on the same blockchain.",
  },
  {
    title: "Bridge",
    status: "Live",
    desc: "Move USDC across supported blockchains using Arc App Kit.",
  },
  {
    title: "Swap",
    status: "Soon",
    desc: "Swap supported assets on the same blockchain. Arc Testnet supports USDC, EURC, and cirBTC.",
  },
  {
    title: "Unified Balance",
    status: "Live",
    desc: "Combine USDC balances across chains into one spendable balance.",
  },
];

export default function Home() {
  return (
    <main className="site">
      <nav className="nav">
        <div className="brand">
          <div className="brandMark" />
          <span>AI Wallet for Arc</span>
        </div>

        <WalletConnect />
      </nav>

      <section className="heroNew">
        <div className="heroCopy">
          <p className="eyebrow">Powered by Arc App Kit</p>

          <h1>
            Chat with your wallet.
            <br />
            Send and bridge USDC with AI.
          </h1>

          <p className="heroText">
            A natural-language wallet agent that uses Arc App Kit to prepare
            stablecoin transactions. The AI never signs. You always review and
            confirm with your own wallet.
          </p>

          <div className="heroActions">
            <span>Send USDC</span>
            <span>Bridge USDC</span>
            <span>ArcScan Links</span>
            <span>User-Signed</span>
          </div>
        </div>

        <div className="heroCard">
          <div className="cardTop">
            <span className="pulse" />
            <span>Transaction Agent</span>
          </div>

          <div className="mockCommand">
            Bridge 1 USDC from Base Sepolia to Arc
          </div>

          <div className="mockReview">
            <div>
              <span>Intent</span>
              <b>bridge_token</b>
            </div>
            <div>
              <span>Asset</span>
              <b>USDC</b>
            </div>
            <div>
              <span>Security</span>
              <b>User signs in wallet</b>
            </div>
          </div>
        </div>
      </section>

      <section className="capabilities">
        <div className="sectionHead">
          <p className="eyebrow">Arc App Kit Capabilities</p>
          <h2>One AI interface for stablecoin actions</h2>
          <p>
            Arc App Kit provides Send, Bridge, Swap, and Unified Balance through
            a unified SDK interface.
          </p>
        </div>

        <div className="capGrid">
          {capabilities.map((item) => (
            <div className="capCard" key={item.title}>
              <div className="capTop">
                <h3>{item.title}</h3>
                <span>{item.status}</span>
              </div>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="supportedNetworks">
        <p className="eyebrow">Supported Bridge Networks</p>
        <div className="networkRow">
          <span>Arc Testnet</span>
          <span>Arbitrum Sepolia</span>
          <span>Avalanche Fuji</span>
          <span>Base Sepolia</span>
          <span>Ethereum Sepolia</span>
          <span>Polygon Amoy Testnet</span>
          <span>Optimism Sepolia</span>
        </div>
      </section>

      <ChatBox />
    </main>
  );
}