import type { Metadata } from "next";
import "./globals.css";
import AppProvider from "./AppProvider";
import { PythPriceProvider } from "@/contexts/pythPrice";

export const metadata: Metadata = {
  title: "SOL-Backed Stablecoin on Solana",
  description:
    "A decentralized USD-pegged stablecoin protocol on Solana. Deposit SOL as collateral, mint stablecoins, and maintain stability via oracles and liquidations.",
  keywords: [
    "Solana",
    "Stablecoin",
    "DeFi",
    "SPL Token 2022",
    "Pyth Oracle",
    "Collateralized Debt",
    "Blockchain",
    "Jacked Nerd",
    "Piyush Saini",
  ],
  authors: [{ name: "Piyush Saini" }],
  creator: "Piyush Saini",
  publisher: "Piyush Saini",
  robots: "index, follow",
  openGraph: {
    title: "SOL-Backed Stablecoin on Solana",
    description:
      "Deposit SOL → Mint USD-pegged stablecoins. Backed by collateral, powered by Pyth oracle pricing, secured with liquidations.",
    type: "website",
    images: [
      {
        url: "https://apneajyhbpncbciasirk.supabase.co/storage/v1/object/public/nft-storage/aura.jpg",
        width: 1200,
        height: 630,
        alt: "SOL-Backed Stablecoin",
      },
    ],
    siteName: "SOL Stablecoin Protocol",
  },
  twitter: {
    card: "summary_large_image",
    title: "SOL-Backed Stablecoin on Solana",
    description:
      "USD-pegged stablecoin collateralized by SOL. Built with Anchor, SPL Token 2022, and Pyth Oracles.",
    images: [
      "https://apneajyhbpncbciasirk.supabase.co/storage/v1/object/public/nft-storage/aura.jpg",
    ],
    creator: "Piyush Saini",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` antialiased`}>
        <AppProvider>
          <PythPriceProvider>{children}</PythPriceProvider>
        </AppProvider>
      </body>
    </html>
  );
}
