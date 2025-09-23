"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserState } from "@/contexts/user-state-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FeedbackAlert } from "@/components/feedback-alert"
import { Coins, TrendingUp } from "lucide-react"

export function DepositTab() {
  const { userState, updateUserState, isLoading, setIsLoading } = useUserState()
  const [depositAmount, setDepositAmount] = useState("")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Mock exchange rate: 1 SOL = 100 USD stablecoin
  const EXCHANGE_RATE = 100
  const estimatedMint = depositAmount ? Number.parseFloat(depositAmount) * EXCHANGE_RATE : 0

  const handleDeposit = async () => {
    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      setFeedback({ type: "error", message: "Please enter a valid deposit amount" })
      return
    }

    const amount = Number.parseFloat(depositAmount)
    if (amount > userState.solBalance) {
      setFeedback({ type: "error", message: "Insufficient SOL balance" })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock transaction success
      const mintedAmount = amount * EXCHANGE_RATE
      updateUserState({
        solBalance: userState.solBalance - amount,
        stablecoinBalance: userState.stablecoinBalance + mintedAmount,
        totalCollateralDeposited: userState.totalCollateralDeposited + amount,
        totalStablecoinsMinted: userState.totalStablecoinsMinted + mintedAmount,
      })

      setFeedback({
        type: "success",
        message: `Successfully deposited ${amount} SOL and minted ${mintedAmount.toFixed(2)} stablecoins!`,
      })
      setDepositAmount("")

      // Play success sound
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Transaction failed. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMaxClick = () => {
    setDepositAmount(userState.solBalance.toString())
  }

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/20 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Deposit SOL & Mint Stablecoins
          </CardTitle>
          <CardDescription>Deposit SOL as collateral to mint USD-pegged stablecoins at a 1:100 ratio</CardDescription>
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
            <p className="text-sm text-muted-foreground">Available: {userState.solBalance.toFixed(4)} SOL</p>
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
              <p className="text-lg font-semibold text-primary">{estimatedMint.toFixed(2)} USD Stablecoins</p>
              <p className="text-xs text-muted-foreground mt-1">Exchange Rate: 1 SOL = {EXCHANGE_RATE} USD</p>
            </motion.div>
          )}

          <Button
            onClick={handleDeposit}
            disabled={isLoading || !depositAmount || Number.parseFloat(depositAmount) <= 0}
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
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <FeedbackAlert type={feedback.type} message={feedback.message} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
