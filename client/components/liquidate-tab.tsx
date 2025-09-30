"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUserState } from "@/contexts/user-state-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeedbackAlert } from "@/components/feedback-alert";
import { AlertTriangle, Zap, Shield } from "lucide-react";
import { usePythPrice } from "@/contexts/pythPrice";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import IDL from "../target/stable_coin.json";
import { StableCoin } from "../target/stable_coin";

interface CollateralAccount {
  publicKey: PublicKey;
  account: {
    depositer: PublicKey;
    solAccount: PublicKey;
    coinTokenAccount: PublicKey;
    isInitialized: boolean;
    lamports: BN;
    coins: BN;
    bump: number;
    bumpSolAccount: number;
  };
}

type AnalyzedCollateral = {
  account: CollateralAccount;
  hf: number;
};

interface BorrowerAccount {
  id: string;
  walletAddress: string;
  collateralAmount: number;
  debtAmount: number;
  healthFactor: number;
  isUnhealthy: boolean;
}

// ---------------------
// Helpers
// ---------------------

function getPriceFromUpdate(priceUpdate: any): number {
  const rawPrice = BigInt(priceUpdate.price.price);
  const expo = priceUpdate.price.expo;
  return Number(rawPrice) * 10 ** expo;
}

function mapToBorrower(
  analyzed: AnalyzedCollateral,
  solPriceUSD: number
): BorrowerAccount {
  const lamports = analyzed.account.account.lamports.toNumber();
  const coins = analyzed.account.account.coins.toNumber();

  const collateralSOL = lamports / LAMPORTS_PER_SOL;
  const debtUSD = coins; // 1 stablecoin = 1 USD
  const hf = analyzed.hf;

  return {
    id: analyzed.account.publicKey.toBase58(),
    walletAddress: analyzed.account.account.depositer.toBase58(),
    collateralAmount: collateralSOL,
    debtAmount: debtUSD,
    healthFactor: hf,
    isUnhealthy: hf < 1,
  };
}

// ---------------------
// Component
// ---------------------

export function LiquidateTab() {
  const {
    userState,
    updateUserState,
    isLoading,
    setIsLoading,
    connection,
    riskyAccounts,
  } = useUserState();
  const { priceUpdateData } = usePythPrice();
  const [liquidatingId, setLiquidatingId] = useState<string | null>(null);
  const [borrowers, setBorrowers] = useState<BorrowerAccount[]>([]);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchBorrowers = async () => {
      if (!priceUpdateData) return;

      try {
        const solPriceUSD = getPriceFromUpdate(priceUpdateData);

        // @ts-ignore
        const program: Program<StableCoin> = new Program(IDL, {
          connection,
        });

        const collateralAccounts = riskyAccounts;
        // @ts-ignore
        const analyzed: AnalyzedCollateral[] = collateralAccounts.map((c) => {
          const lamports = c.account.account.lamports.toNumber();
          const coins = c.account.account.coins.toNumber();
          const collateralUSD = (lamports / LAMPORTS_PER_SOL) * solPriceUSD;
          const hf = coins > 0 ? collateralUSD / coins : Infinity;
          return { account: c, hf };
        });

        const uiBorrowers = analyzed.map((a) => mapToBorrower(a, solPriceUSD));
        setBorrowers(uiBorrowers);
      } catch (err) {
        console.error("Error fetching borrowers:", err);
      }
    };

    fetchBorrowers();
  }, [priceUpdateData, connection]);

  const handleLiquidate = async (borrower: BorrowerAccount) => {
    setLiquidatingId(borrower.id);
    setIsLoading(true);
    setFeedback(null);

    try {
      // TODO: replace with actual liquidation ix
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const liquidationBonus = borrower.collateralAmount * 0.05;
      const liquidatorReward = borrower.collateralAmount + liquidationBonus;

      updateUserState({
        solBalance: userState.solBalance + liquidatorReward,
      });

      setBorrowers((prev) => prev.filter((b) => b.id !== borrower.id));

      setFeedback({
        type: "success",
        message: `Successfully liquidated ${borrower.walletAddress.slice(
          0,
          8
        )}... and earned ${liquidatorReward.toFixed(4)} SOL (5% bonus)!`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: "Liquidation failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
      setLiquidatingId(null);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  };

  const unhealthyCount = borrowers.filter((b) => b.isUnhealthy).length;

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/20 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Liquidation Dashboard
          </CardTitle>
          <CardDescription>
            Monitor borrower positions and liquidate unhealthy accounts to earn
            rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Healthy Accounts</p>
              <p className="text-xl font-semibold text-green-500">
                {borrowers.filter((b) => !b.isUnhealthy).length}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">
                Unhealthy Accounts
              </p>
              <p className="text-xl font-semibold text-destructive">
                {unhealthyCount}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Liquidation Bonus</p>
              <p className="text-xl font-semibold text-primary">5%</p>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead>Wallet Address</TableHead>
                  <TableHead className="text-right">Collateral (SOL)</TableHead>
                  <TableHead className="text-right">Debt (USD)</TableHead>
                  <TableHead className="text-right">Health Factor</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowers.map((borrower, index) => (
                  <motion.tr
                    key={borrower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border-b border-border/30"
                  >
                    <TableCell className="font-mono text-sm">
                      {truncateAddress(borrower.walletAddress)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {borrower.collateralAmount.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ${borrower.debtAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          borrower.isUnhealthy ? "destructive" : "secondary"
                        }
                        className={
                          borrower.isUnhealthy
                            ? "bg-destructive/20 text-destructive border-destructive/30"
                            : "bg-green-500/20 text-green-400 border-green-500/30"
                        }
                      >
                        {borrower.healthFactor.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {borrower.isUnhealthy ? (
                        <Button
                          size="sm"
                          onClick={() => handleLiquidate(borrower)}
                          disabled={isLoading}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                        >
                          {liquidatingId === borrower.id ? (
                            <>
                              <LoadingSpinner size="sm" className="mr-1" />
                              Liquidating...
                            </>
                          ) : (
                            "Liquidate"
                          )}
                        </Button>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-green-400 border-green-500/30"
                        >
                          Healthy
                        </Badge>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {borrowers.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-semibold text-green-500">
                All accounts are healthy!
              </p>
              <p className="text-sm text-muted-foreground">
                No liquidation opportunities available.
              </p>
            </div>
          )}

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4"
            >
              <FeedbackAlert type={feedback.type} message={feedback.message} />
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/10 border-border/30">
        <CardHeader>
          <CardTitle className="text-lg">How Liquidation Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • <strong>Health Factor:</strong> Calculated as (Collateral Value
              × 0.8) / Debt Value
            </p>
            <p>
              • <strong>Liquidation Threshold:</strong> Accounts with health
              factor below 1.0 can be liquidated
            </p>
            <p>
              • <strong>Liquidator Reward:</strong> Receive the borrower's
              collateral plus a 5% bonus
            </p>
            <p>
              • <strong>Risk:</strong> You must have sufficient balance to cover
              the debt being liquidated
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
