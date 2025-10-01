"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserState } from "@/contexts/user-state-context";
import { motion } from "framer-motion";
import { RefreshCw, RotateCcw } from "lucide-react";
import { getPriceFromUpdate } from "./liquidate-tab";
import { usePythPrice } from "@/contexts/pythPrice";
import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export function UserBalanceCard() {
  const { userState, resetState } = useUserState();
  const [healthRatio, setHealthRatio] = useState(0);
  const balanceItems = [
    {
      label: "SOL Balance",
      value: (userState.solBalance / 1000000000).toFixed(2),
      suffix: "SOL",
    },
    {
      label: "Stablecoin Balance",
      value: userState.stablecoinBalance.toFixed(2),
      suffix: "USD",
    },
    {
      label: "Total Collateral",
      value: (userState.totalCollateralDeposited / 1000000000).toFixed(2),
      suffix: "SOL",
    },
  ];
  const pythPriceContext = usePythPrice();

  const calculateHF = async () => {
    const solPriceUSD = getPriceFromUpdate(pythPriceContext.solPriceFeed);
    const lamports = userState.totalCollateralDeposited;
    const coins = userState.stablecoinBalance;
    const collateralValueUSD = (lamports / LAMPORTS_PER_SOL) * solPriceUSD;
    const debtUSD = coins;
    const hf = debtUSD > 0 ? collateralValueUSD / debtUSD : 0;
    setHealthRatio(hf);
  };

  useEffect(() => {
    if (!pythPriceContext) return;
    calculateHF();
  }, [pythPriceContext]);

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Your Balances</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="text-primary border-primary/30 hover:bg-primary/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetState}
            className="text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-4 mb-4">
          {balanceItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="text-center p-4 rounded-lg bg-secondary/30 border border-border/30 w-full"
            >
              <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
              <p className="text-lg font-semibold">
                {item.value}{" "}
                <span className="text-primary text-sm">{item.suffix}</span>
              </p>
            </motion.div>
          ))}
        </div>

        {userState.stablecoinBalance > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg border text-center ${
              healthRatio > 1.5
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : healthRatio > 1.2
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                : "bg-destructive/10 border-destructive/30 text-destructive"
            }`}
          >
            <p className="text-sm font-medium">
              Position Health Ratio: {healthRatio.toFixed(2)}
            </p>
            <p className="text-xs opacity-80">
              {healthRatio > 1.5
                ? "Healthy"
                : healthRatio > 1.2
                ? "Moderate Risk"
                : "High Risk"}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
