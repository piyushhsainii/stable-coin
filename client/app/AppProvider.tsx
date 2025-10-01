"use client";
import { clusterApiUrl } from "@solana/web3.js";
import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { PythPriceProvider } from "@/contexts/pythPrice";

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

  const wallets = [new PhantomWalletAdapter()];
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PythPriceProvider>{children}</PythPriceProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default AppProvider;
