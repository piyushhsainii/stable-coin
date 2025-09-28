"use client";

import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import IDL from "../../stable_coin/target/idl/stable_coin.json";
import { StableCoin } from "@/build/stable_coin";

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

interface UserStateContextType {
  userState: UserState;
  updateUserState: (updates: Partial<UserState>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void;
  resetState: () => void;
}

const initialState: UserState = {
  solBalance: 100.0, // Mock initial balance
  stablecoinBalance: 0,
  totalCollateralDeposited: 0,
};

const UserStateContext = createContext<UserStateContextType | undefined>(
  undefined
);

export function UserStateProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<UserState>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const wallet = useWallet();
  const updateUserState = (updates: Partial<UserState>) => {
    setUserState((prev) => ({ ...prev, ...updates }));
  };

  const addTransaction = (
    transaction: Omit<Transaction, "id" | "timestamp">
  ) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setTransactions((prev) => [newTransaction, ...prev].slice(0, 50)); // Keep only last 50 transactions
  };

  const resetState = () => {
    setUserState(initialState);
    setTransactions([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("solana-stablecoin-state");
      localStorage.removeItem("solana-stablecoin-transactions");
    }
  };
  const connection = new Connection(
    `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
    "confirmed"
  );
  // @ts-ignore
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  useEffect(() => {
    if (!wallet.publicKey || wallet.publicKey == null) {
      return;
    }
    const getUserProfileData = async () => {
      if (!wallet.publicKey || wallet.publicKey == null) {
        return;
      }
      const program: Program<StableCoin> = new Program(IDL, provider);

      // Deriving the collateral
      const [collateralAcc] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral"), wallet.publicKey.toBuffer()],
        new PublicKey(IDL.address)
      );
      // Deriving the sol collateral account
      const [SolCollateralAcc] = PublicKey.findProgramAddressSync(
        [Buffer.from("collateral_token_account"), wallet.publicKey.toBuffer()],
        new PublicKey(IDL.address)
      );
      // Deriving the stable coin token account
      const [StableCoinTokenAcc] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint_token_account"), wallet.publicKey.toBuffer()],
        new PublicKey(IDL.address)
      );
      try {
        const collateralAccInfo = await program.account.collateral.fetch(
          collateralAcc
        );
        const solBal = await connection.getBalance(wallet.publicKey);
        updateUserState({
          solBalance: solBal,
          stablecoinBalance: collateralAccInfo.coins.toNumber(),
          totalCollateralDeposited: collateralAccInfo.lamports.toNumber(),
        });
      } catch (error) {
        updateUserState({
          solBalance: 0,
          stablecoinBalance: 0,
          totalCollateralDeposited: 0,
        });
        console.log(error);
      }
    };
    getUserProfileData();
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
