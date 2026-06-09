import "./globals.css";

export const metadata = {
  title: "AI Wallet Assistant",
  description: "AI Wallet powered by Arc App Kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}