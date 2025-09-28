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
import { Coins, CoinsIcon, TrendingUp } from "lucide-react";
import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import IDL from "../../stable_coin/target/idl/stable_coin.json";
import { StableCoin } from "@/build/stable_coin";
import { TOKEN_METADATA_PROGRAM_ID } from "@/lib/lib";
import { PythSolanaReceiver } from "@pythnetwork/pyth-solana-receiver";
import { Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

export function DepositTab() {
  const { userState, updateUserState, isLoading, setIsLoading } =
    useUserState();
  const [depositAmount, setDepositAmount] = useState("");
  const wallet = useWallet();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Mock exchange rate: 1 SOL = 100 USD stablecoin
  const EXCHANGE_RATE = 240;
  const estimatedMint = depositAmount
    ? Number.parseFloat(depositAmount) * EXCHANGE_RATE
    : 0;

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
      // Mock transaction success
      const mintedAmount = amount * EXCHANGE_RATE;
      const connection = new Connection(
        "https://devnet.helius-rpc.com/?api-key=ff338341-babd-4354-82c0-e8853c64fa66",
        "confirmed"
      );
      // @ts-ignore
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });
      const program: Program<StableCoin> = new Program(IDL, provider);

      const [mint_address] = PublicKey.findProgramAddressSync(
        [Buffer.from("jacked_nerd")],
        new PublicKey(IDL.address)
      );
      const [metadata] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          new PublicKey(TOKEN_METADATA_PROGRAM_ID).toBuffer(),
          mint_address.toBuffer(),
        ],
        new PublicKey(TOKEN_METADATA_PROGRAM_ID)
      );

      const balance = await connection.getBalance(wallet.publicKey);

      const [config] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        new PublicKey(IDL.address)
      );
      const [mint] = PublicKey.findProgramAddressSync(
        [Buffer.from("jacked_nerd")],
        new PublicKey(IDL.address)
      );

      const depositerTokenAcc = await getAssociatedTokenAddress(
        mint,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      console.log(`Config`, config);
      console.log(`Mint`, mint.toString());
      console.log(`DEPOSITER TOKENA ACC `, depositerTokenAcc.toString());
      const sol_usdc_feed_id =
        "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d";

      const pyth = new PythSolanaReceiver({
        connection,
        // @ts-ignore
        wallet: wallet,
      });

      const PRICE_UPDATE = pyth.getPriceFeedAccountAddress(0, sol_usdc_feed_id);

      const ix = await program.methods
        .depositAndMintTokens(new BN(100000000))
        .accounts({
          config,
          mint,
          priceUpdate: PRICE_UPDATE,
          tokenProgram2022: new PublicKey(
            "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
          ),
          depositer: wallet.publicKey,
        })
        // .preInstructions([
        //   ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
        //   ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
        // ])
        .instruction();
      const bx = await connection.getLatestBlockhash("confirmed");
      const tx = new Transaction({
        feePayer: wallet.publicKey,
        blockhash: bx.blockhash,
        lastValidBlockHeight: bx.lastValidBlockHeight,
      }).add(ix);

      const txSig = await wallet.sendTransaction(tx, connection);
      console.log(`txSig`, txSig);
      await connection.confirmTransaction(txSig, "confirmed");
      // const txSig = await connection.simulateTransaction(tx);
      // console.log(`txSig`, txSig);
      updateUserState({
        solBalance: userState.solBalance - amount,
        stablecoinBalance: userState.stablecoinBalance + mintedAmount,
        totalCollateralDeposited: userState.totalCollateralDeposited + amount,
      });
      setFeedback({
        type: "success",
        message: `Successfully deposited ${amount} SOL and minted ${mintedAmount.toFixed(
          2
        )} stablecoins!`,
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
    setDepositAmount(userState.solBalance.toString());
  };

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
              Available: {userState.solBalance.toFixed(4)} SOL
            </p>
          </div>

          {depositAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-primary/10 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Estimated Mint</span>
              </div>
              <div className="text-lg font-semibold text-primary flex items-center  gap-2">
                <div>{estimatedMint.toFixed(2)} Stablecoins </div>
                <CoinsIcon color="yellow" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Exchange Rate: 1 SOL = {EXCHANGE_RATE} USD
              </p>
            </motion.div>
          )}

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
