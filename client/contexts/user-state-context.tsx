"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface UserState {
  solBalance: number
  stablecoinBalance: number
  totalCollateralDeposited: number
  totalStablecoinsMinted: number
  totalWithdrawn: number
}

interface Transaction {
  id: string
  type: "deposit" | "burn" | "liquidation"
  amount: number
  timestamp: Date
  status: "completed" | "pending" | "failed"
}

interface UserStateContextType {
  userState: UserState
  updateUserState: (updates: Partial<UserState>) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  transactions: Transaction[]
  addTransaction: (transaction: Omit<Transaction, "id" | "timestamp">) => void
  resetState: () => void
}

const initialState: UserState = {
  solBalance: 100.0, // Mock initial balance
  stablecoinBalance: 0,
  totalCollateralDeposited: 0,
  totalStablecoinsMinted: 0,
  totalWithdrawn: 0,
}

const UserStateContext = createContext<UserStateContextType | undefined>(undefined)

export function UserStateProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<UserState>(initialState)
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("solana-stablecoin-state")
      const savedTransactions = localStorage.getItem("solana-stablecoin-transactions")

      if (savedState) {
        try {
          setUserState(JSON.parse(savedState))
        } catch (error) {
          console.error("Failed to load saved state:", error)
        }
      }

      if (savedTransactions) {
        try {
          const parsedTransactions = JSON.parse(savedTransactions).map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }))
          setTransactions(parsedTransactions)
        } catch (error) {
          console.error("Failed to load saved transactions:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("solana-stablecoin-state", JSON.stringify(userState))
    }
  }, [userState])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("solana-stablecoin-transactions", JSON.stringify(transactions))
    }
  }, [transactions])

  const updateUserState = (updates: Partial<UserState>) => {
    setUserState((prev) => ({ ...prev, ...updates }))
  }

  const addTransaction = (transaction: Omit<Transaction, "id" | "timestamp">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    }
    setTransactions((prev) => [newTransaction, ...prev].slice(0, 50)) // Keep only last 50 transactions
  }

  const resetState = () => {
    setUserState(initialState)
    setTransactions([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("solana-stablecoin-state")
      localStorage.removeItem("solana-stablecoin-transactions")
    }
  }

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
  )
}

export function useUserState() {
  const context = useContext(UserStateContext)
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserStateProvider")
  }
  return context
}
