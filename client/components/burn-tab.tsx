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
import { Flame, TrendingDown } from "lucide-react"

export function BurnTab() {
  const { userState, updateUserState, isLoading, setIsLoading } = useUserState()
  const [burnAmount, setBurnAmount] = useState("")
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Mock exchange rate: 100 USD stablecoin = 1 SOL
  const EXCHANGE_RATE = 0.01
  const estimatedWithdraw = burnAmount ? Number.parseFloat(burnAmount) * EXCHANGE_RATE : 0

  const handleBurn = async () => {
    if (!burnAmount || Number.parseFloat(burnAmount) <= 0) {
      setFeedback({ type: "error", message: "Please enter a valid burn amount" })
      return
    }

    const amount = Number.parseFloat(burnAmount)
    if (amount > userState.stablecoinBalance) {
      setFeedback({ type: "error", message: "Insufficient stablecoin balance" })
      return
    }

    setIsLoading(true)
    setFeedback(null)

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock transaction success
      const withdrawAmount = amount * EXCHANGE_RATE
      updateUserState({
        solBalance: userState.solBalance + withdrawAmount,
        stablecoinBalance: userState.stablecoinBalance - amount,
        totalCollateralDeposited: Math.max(0, userState.totalCollateralDeposited - withdrawAmount),
        totalWithdrawn: userState.totalWithdrawn + withdrawAmount,
      })

      setFeedback({
        type: "success",
        message: `Successfully burned ${amount.toFixed(2)} stablecoins and withdrew ${withdrawAmount.toFixed(4)} SOL!`,
      })
      setBurnAmount("")

      // Play success sound
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.1)
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
    setBurnAmount(userState.stablecoinBalance.toString())
  }

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/20 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-destructive" />
            Burn Stablecoins & Withdraw SOL
          </CardTitle>
          <CardDescription>Burn your stablecoins to withdraw SOL collateral at a 100:1 ratio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="burn-amount">Burn Amount (USD Stablecoins)</Label>
            <div className="flex gap-2">
              <Input
                id="burn-amount"
                type="number"
                placeholder="0.00"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                className="flex-1"
                step="0.01"
                min="0"
                max={userState.stablecoinBalance}
              />
              <Button
                variant="outline"
                onClick={handleMaxClick}
                className="px-3 text-destructive border-destructive/30 hover:bg-destructive/10 bg-transparent"
              >
                MAX
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Available: {userState.stablecoinBalance.toFixed(2)} USD Stablecoins
            </p>
          </div>

          {burnAmount && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">Estimated Withdrawal</span>
              </div>
              <p className="text-lg font-semibold text-destructive">{estimatedWithdraw.toFixed(4)} SOL</p>
              <p className="text-xs text-muted-foreground mt-1">Exchange Rate: 100 USD = 1 SOL</p>
            </motion.div>
          )}

          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <h4 className="text-sm font-medium mb-2">Important Notes</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Burning stablecoins is irreversible</li>
              <li>• You can only withdraw up to your collateral amount</li>
              <li>• Transaction fees may apply</li>
            </ul>
          </div>

          <Button
            onClick={handleBurn}
            disabled={isLoading || !burnAmount || Number.parseFloat(burnAmount) <= 0}
            className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Processing Transaction...
              </>
            ) : (
              "Burn & Withdraw"
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
