"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUserState } from "@/contexts/user-state-context";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FeedbackAlert } from "@/components/feedback-alert";
import { Coins, TrendingUp } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import IDL from "../target/stable_coin.json";
import { StableCoin } from "../target/stable_coin";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { Transaction } from "@solana/web3.js";

export function DepositTab() {
  const { userState, isLoading, setIsLoading, connection, refetch } =
    useUserState();
  const [depositAmount, setDepositAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const wallet = useWallet();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleDeposit = async () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      setFeedback({
        type: "error",
        message: "Please enter a valid deposit amount",
      });
      return;
    }

    const amount = Number.parseFloat(depositAmount);
    // if (amount > userState.solBalance) {
    //   setFeedback({ type: "error", message: "Insufficient SOL balance" });
    //   return;
    // }
    if (!wallet.publicKey || wallet.publicKey == null) {
      return;
    }
    setIsLoading(true);
    setFeedback(null);

    try {
      // @ts-ignore
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });
      const program: Program<StableCoin> = new Program(IDL, provider);

      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        new PublicKey(IDL.address)
      );
      const [mint] = PublicKey.findProgramAddressSync(
        [Buffer.from("jacked_nerd")],
        new PublicKey(IDL.address)
      );

      const sol_usdc_feed_id =
        "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

      const pyth = new PythSolanaReceiver({
        connection,
        // @ts-ignore
        wallet: wallet,
      });
      const PRICE_UPDATE = pyth.getPriceFeedAccountAddress(0, sol_usdc_feed_id);
      const lamport_amount = amount * 1000000000;
      const ix = await program.methods
        .depositAndMintTokens(new BN(lamport_amount))
        .accountsPartial({
          config,
          mint,
          priceUpdate: PRICE_UPDATE,
          tokenProgram2022: new PublicKey(
            "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
          ),
          depositer: wallet.publicKey,
        })
        .instruction();

      const bx = await connection.getLatestBlockhash();
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: bx.blockhash,
        lastValidBlockHeight: bx.lastValidBlockHeight,
      }).add(ix);
      // const txSig = await connection.simulateTransaction(tx);
      const txSig = await wallet.sendTransaction(tx, connection);
      console.log(`txSig`, txSig);
      await connection.confirmTransaction(txSig);
      setFeedback({
        type: "success",
        message: `Successfully deposited ${amount} SOL`,
      });
      setDepositAmount("");

      // Play success sound
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(
          1000,
          audioContext.currentTime + 0.1
        );
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.3
        );
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
      refetch();
    } catch (error) {
      console.log(error);
      setFeedback({
        type: "error",
        message: "Transaction failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setDepositAmount(String(balance));
  };

  console.log(userState);

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/20 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Deposit SOL & Mint Stablecoins
          </CardTitle>
          <CardDescription>
            Deposit SOL as collateral to mint USD-pegged stablecoins at a 1:100
            ratio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Deposit Amount (SOL)</Label>
            <div className="flex gap-2">
              <Input
                id="deposit-amount"
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1"
                step="0.0001"
                min="0"
                max={userState.solBalance}
              />
              <Button
                variant="outline"
                onClick={handleMaxClick}
                className="px-3 text-primary border-primary/30 hover:bg-primary/10 bg-transparent"
              >
                MAX
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Available: {(userState.solBalance / 1000000000).toFixed(4)} SOL
            </p>
          </div>
          <Button
            onClick={handleDeposit}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Processing Transaction...
              </>
            ) : (
              "Deposit & Mint"
            )}
          </Button>

          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FeedbackAlert type={feedback.type} message={feedback.message} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
