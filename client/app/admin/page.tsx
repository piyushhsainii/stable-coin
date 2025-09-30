"use client";
import React, { useEffect, useState } from "react";
import {
  Connection,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { Program, BN, AnchorProvider } from "@coral-xyz/anchor";
import IDL from "../../../stable_coin/target/idl/stable_coin.json";
import { Button } from "@/components/ui/button";
import { TOKEN_METADATA_PROGRAM_ID } from "@/lib/lib";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";

const Admin = () => {
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs((prev) => [...prev, message]);
  };

  const checkAccountExists = async (
    connection: Connection,
    address: PublicKey,
    name: string
  ) => {
    const account = await connection.getAccountInfo(address);
    addLog(
      `${name} (${address.toString()}): ${
        account ? "EXISTS ✅" : "NOT FOUND ❌"
      }`
    );
    return !!account;
  };
  const initConfig = async () => {
    if (!wallet.publicKey) {
      addLog("❌ Wallet not connected");
      return;
    }
    setIsLoading(true);
    setLogs([]);
    try {
      addLog("🚀 Initializing configuration...");
      const connection = new Connection(
        "https://devnet.helius-rpc.com/?api-key=ff338341-babd-4354-82c0-e8853c64fa66",
        "confirmed"
      );
      // const program: Program<StableCoin> = new Program(IDL, { connection });
      // @ts-ignore
      const provider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "confirmed",
      });
      const program = new Program(IDL, provider);
      // Check wallet balance
      const balance = await connection.getBalance(wallet.publicKey);
      addLog(
        `💰 Wallet balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`
      );

      if (balance < 0.01 * LAMPORTS_PER_SOL) {
        addLog("❌ Insufficient balance for transaction fees");
        return;
      }

      // Derive addresses
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

      const [config_address] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        new PublicKey(IDL.address)
      );

      addLog(`📍 Mint address: ${mint_address.toString()}`);
      addLog(`📍 Metadata address: ${metadata.toString()}`);
      addLog(`📍 Config address: ${config_address.toString()}`);

      // Check if accounts already exist
      const mintExists = await checkAccountExists(
        connection,
        mint_address,
        "Mint"
      );
      const configExists = await checkAccountExists(
        connection,
        config_address,
        "Config"
      );
      const metadataExists = await checkAccountExists(
        connection,
        metadata,
        "Metadata"
      );

      if (mintExists && configExists && metadataExists) {
        addLog("⚠️ All accounts already exist. Transaction may fail.");
      }

      // Build instruction
      addLog("🔨 Building instruction...");
      const ix = await program.methods
        .processConfig(new BN(8000), new BN(500), new BN(1), new BN(5000))
        .accounts({
          metadata: metadata,
          tokenMetadataProgram: new PublicKey(TOKEN_METADATA_PROGRAM_ID),
          tokenProgram: new PublicKey(
            "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
          ),
          admin: wallet.publicKey,
          sysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .preInstructions([
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }),
          ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
        ])
        .instruction();

      const bx = await connection.getLatestBlockhash();
      const tx = new Transaction({
        blockhash: bx.blockhash,
        lastValidBlockHeight: bx.lastValidBlockHeight,
        feePayer: wallet.publicKey,
      }).add(ix);

      const txSig = await wallet.sendTransaction(tx, connection);
      console.log(`TX SIG`, txSig);
      addLog("⏳ Waiting for confirmation...");
      await connection.confirmTransaction(txSig);
      addLog("⏳ Tx confirmed");
    } catch (error) {
      addLog(`💥 Critical error: ${error}`);
      console.error("Full error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMintAddress = async () => {
    const [mint_address] = PublicKey.findProgramAddressSync(
      [Buffer.from("jacked_nerd")],
      new PublicKey(IDL.address)
    );
    console.log(`MINT ADDRESS`, mint_address.toString());
  };

  useEffect(() => {
    fetchMintAddress();
  }, []);

  return (
    <div className="w-screen h-screen mx-auto flex flex-col justify-center items-center p-4">
      <div className="mb-8">
        <Button
          onClick={initConfig}
          disabled={isLoading || !wallet.publicKey}
          className="border border-accent rounded-lg px-6 py-3"
        >
          {isLoading
            ? "Processing..."
            : "Initialize Config and Stable Coin Account"}
        </Button>
      </div>

      {/* Debug logs */}
      <div className="w-full max-w-4xl">
        <h3 className="text-lg font-semibold mb-2">Debug Logs:</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">
              Click the button to see debug logs...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
