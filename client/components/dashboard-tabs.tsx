"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Wallet } from "lucide-react";
import { DepositTab } from "@/components/deposit-tab";
import { BurnTab } from "@/components/burn-tab";
import { LiquidateTab } from "@/components/liquidate-tab";
import { UserBalanceCard } from "@/components/user-balance-card";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("deposit");
  const wallet = useWallet();

  return (
    <div className="relative space-y-6">
      {/* Blurred Dashboard Content */}
      <div
        className={
          wallet.connected ? "" : "blur-md pointer-events-none select-none"
        }
      >
        <UserBalanceCard />

        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 mt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50">
              <TabsTrigger
                value="deposit"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Deposit
              </TabsTrigger>
              <TabsTrigger
                value="burn"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Burn
              </TabsTrigger>
              <TabsTrigger
                value="liquidate"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Liquidate
              </TabsTrigger>
            </TabsList>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="deposit" className="mt-0">
                <DepositTab />
              </TabsContent>

              <TabsContent value="burn" className="mt-0">
                <BurnTab />
              </TabsContent>

              <TabsContent value="liquidate" className="mt-0">
                <LiquidateTab />
              </TabsContent>
            </motion.div>
          </Tabs>
        </Card>
      </div>

      {/* Wallet Connection Overlay */}
      {!wallet.connected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <Card className="p-8 max-w-md mx-4 bg-card border-border shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Wallet className="w-12 h-12 text-primary" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Connect Your Wallet
                </h2>
                <p className="text-muted-foreground">
                  Please connect your wallet to access the dashboard and
                  interact with the protocol
                </p>
              </div>

              <WalletMultiButton
                style={{ background: "var(--primary)" }}
              ></WalletMultiButton>

              <p className="text-xs text-muted-foreground">
                By connecting your wallet, you agree to our Terms of Service
              </p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
