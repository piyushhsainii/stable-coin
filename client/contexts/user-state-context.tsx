"use client";

import { AnchorProvider, Program, BN } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import IDL from "../../stable_coin/target/idl/stable_coin.json";
import { StableCoin } from "../build/stable_coin";
import { usePythPrice } from "./pythPrice";

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
  connection: Connection;
  riskyAccounts: {
    account: CollateralAccount;
    hf: number;
  }[];
  refetch: () => void;
}

const initialState: UserState = {
  solBalance: 0, // Mock initial balance
  stablecoinBalance: 0,
  totalCollateralDeposited: 0,
};

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

const UserStateContext = createContext<UserStateContextType | undefined>(
  undefined
);

export function UserStateProvider({ children }: { children: ReactNode }) {
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
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // @ts-ignore
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });

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
    setTransactions((prev) => [newTransaction, ...prev].slice(0, 50));
  };

  const resetState = () => {
    setUserState(initialState);
    setTransactions([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("solana-stablecoin-state");
      localStorage.removeItem("solana-stablecoin-transactions");
    }
  };

  // <-- Move this outside useEffect
  const getUserProfileData = async () => {
    if (!wallet.publicKey) return;

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

    const { solPriceFeed } = usePythPrice();

    function getPriceFromUpdate(priceUpdate: any): number {
      const rawPrice = BigInt(priceUpdate.price.price); // raw integer
      const expo = priceUpdate.price.expo; // exponent (e.g. -8)
      return Number(rawPrice) * 10 ** expo; // apply scaling
    }

    function getUndercollateralizedAccounts(
      collateralAccounts: CollateralAccount[],
      priceUpdateData: any
    ): { account: CollateralAccount; hf: number }[] {
      const solPriceUSD = getPriceFromUpdate(priceUpdateData);

      return collateralAccounts
        .map((c) => {
          const collateralValueUSD =
            (c.account.lamports.toNumber() / LAMPORTS_PER_SOL) * solPriceUSD;
          const debtUSD = c.account.coins.toNumber(); // 1 coin = 1 USD
          const hf = debtUSD > 0 ? collateralValueUSD / debtUSD : Infinity;
          return { account: c, hf };
        })
        .filter(({ hf }) => hf < 1);
    }

    const solPriceUSD = getPriceFromUpdate(solPriceFeed);
    const collateralAccounts = await program.account.collateral.all();

    const riskyAccoutns = getUndercollateralizedAccounts(
      collateralAccounts,
      solPriceUSD
    );
    setriskyAccounts(riskyAccoutns);
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
      console.log(error);
      setUserState({
        solBalance: 0,
        stablecoinBalance: 0,
        totalCollateralDeposited: 0,
      });
    }
  };

  // initial fetch
  useEffect(() => {
    if (wallet.connected) {
      getUserProfileData();
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
        refetch: getUserProfileData, // <-- function reference
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
