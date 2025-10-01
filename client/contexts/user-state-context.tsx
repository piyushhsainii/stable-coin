"use client";

import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import IDL from "../target/stable_coin.json";
import { StableCoin } from "../target/stable_coin";

console.log("[UserStateProvider] File loaded");

interface UserState {
  solBalance: number;
  stablecoinBalance: number;
  totalCollateralDeposited: number;
}

interface Transaction {
  id: string;
  type: "deposit" | "burn" | "liquidation";
  amount: number;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
}

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

interface UserStateContextType {
  userState: UserState;
  updateUserState: (updates: Partial<UserState>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void;
  resetState: () => void;
  connection: Connection;
  riskyAccounts: {
    account: CollateralAccount;
    hf: number;
  }[];
  refetch: () => Promise<void>; // ⬅️ make async
}

const initialState: UserState = {
  solBalance: 0,
  stablecoinBalance: 0,
  totalCollateralDeposited: 0,
};

const UserStateContext = createContext<UserStateContextType | undefined>(
  undefined
);

export function UserStateProvider({ children }: { children: ReactNode }) {
  console.log("[UserStateProvider] Rendering provider...");

  const [userState, setUserState] = useState<UserState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [riskyAccounts, setriskyAccounts] = useState<
    {
      account: CollateralAccount;
      hf: number;
    }[]
  >([]);

  const wallet = useWallet();
  const connection = new Connection(
    "https://devnet.helius-rpc.com/?api-key=ff338341-babd-4354-82c0-e8853c64fa66",
    "confirmed"
  );

  // @ts-ignore
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  console.log("[UserStateProvider] AnchorProvider initialized");

  const updateUserState = (updates: Partial<UserState>) => {
    console.log("[updateUserState] called with:", updates);
    setUserState((prev) => ({ ...prev, ...updates }));
  };

  const addTransaction = (
    transaction: Omit<Transaction, "id" | "timestamp">
  ) => {
    console.log("[addTransaction] incoming:", transaction);
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setTransactions((prev) => [newTransaction, ...prev].slice(0, 50));
  };

  const resetState = () => {
    console.log("[resetState] resetting state");
    setUserState(initialState);
    setTransactions([]);
  };

  const getUserProfileData = async () => {
    console.log("[getUserProfileData] called");
    if (!wallet.publicKey) {
      console.log("[getUserProfileData] No wallet.publicKey found");
      return;
    }

    setIsLoading(true); // ⬅️ enforce loading start

    try {
      console.log(
        "[getUserProfileData] Wallet pubkey:",
        wallet.publicKey.toBase58()
      );

      const program: Program<StableCoin> = new Program(IDL, provider);

      const [collateralAcc] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral"), wallet.publicKey.toBuffer()],
        new PublicKey(IDL.address)
      );

      const [SolCollateralAcc] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral_token_account"), wallet.publicKey.toBuffer()],
        new PublicKey(IDL.address)
      );

      const [Mint] = PublicKey.findProgramAddressSync(
        [Buffer.from("jacked_nerd")],
        new PublicKey(IDL.address)
      );

      try {
        const collateralAccInfo = await program.account.collateral.fetch(
          collateralAcc
        );

        const solBal = await connection.getBalance(wallet.publicKey);

        setUserState({
          solBalance: solBal,
          stablecoinBalance: collateralAccInfo.coins.toNumber(),
          totalCollateralDeposited: collateralAccInfo.lamports.toNumber(),
        });
      } catch (error) {
        console.error(
          "[getUserProfileData] Error fetching collateralAccInfo:",
          error
        );
        setUserState(initialState); // fallback
      }
    } catch (outerError) {
      console.error("[getUserProfileData] Outer Error:", outerError);
      setUserState(initialState);
    } finally {
      setIsLoading(false); // ⬅️ always stop loading
    }
  };

  useEffect(() => {
    console.log(
      "[useEffect] wallet.connected:",
      wallet.connected,
      "wallet.publicKey:",
      wallet.publicKey?.toBase58()
    );
    if (wallet.connected) {
      getUserProfileData();
    } else {
      resetState();
    }
  }, [wallet.connected, wallet.publicKey]);

  return (
    <UserStateContext.Provider
      value={{
        userState,
        updateUserState,
        isLoading,
        setIsLoading,
        transactions,
        addTransaction,
        resetState,
        connection,
        riskyAccounts,
        refetch: getUserProfileData, // async so caller can await
      }}
    >
      {children}
    </UserStateContext.Provider>
  );
}

export function useUserState() {
  const context = useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserStateProvider");
  }
  return context;
}
