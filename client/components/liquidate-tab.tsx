"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useUserState } from "@/contexts/user-state-context"
import { LoadingSpinner } from "@/components/loading-spinner"
import { FeedbackAlert } from "@/components/feedback-alert"
import { AlertTriangle, Zap, Shield } from "lucide-react"

interface BorrowerAccount {
  id: string
  walletAddress: string
  collateralAmount: number
  debtAmount: number
  healthFactor: number
  isUnhealthy: boolean
}

// Mock borrower data
const mockBorrowers: BorrowerAccount[] = [
  {
    id: "1",
    walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    collateralAmount: 5.2,
    debtAmount: 480.0,
    healthFactor: 1.08,
    isUnhealthy: true,
  },
  {
    id: "2",
    walletAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    collateralAmount: 12.8,
    debtAmount: 1100.0,
    healthFactor: 1.16,
    isUnhealthy: false,
  },
  {
    id: "3",
    walletAddress: "4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi",
    collateralAmount: 3.1,
    debtAmount: 340.0,
    healthFactor: 0.91,
    isUnhealthy: true,
  },
  {
    id: "4",
    walletAddress: "BrDXrKdcrb2HcP2addudG1D5LAiHiXZaQNFdxw2kzTXN",
    collateralAmount: 8.7,
    debtAmount: 750.0,
    healthFactor: 1.16,
    isUnhealthy: false,
  },
  {
    id: "5",
    walletAddress: "2FmhiLQKkMWfLEAzfuHikdwVBmXzqKXgSiLNmWUGrzn",
    collateralAmount: 2.3,
    debtAmount: 280.0,
    healthFactor: 0.82,
    isUnhealthy: true,
  },
]

export function LiquidateTab() {
  const { userState, updateUserState, isLoading, setIsLoading } = useUserState()
  const [liquidatingId, setLiquidatingId] = useState<string | null>(null)
  const [borrowers, setBorrowers] = useState<BorrowerAccount[]>(mockBorrowers)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleLiquidate = async (borrower: BorrowerAccount) => {
    setLiquidatingId(borrower.id)
    setIsLoading(true)
    setFeedback(null)

    try {
      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Mock liquidation logic - liquidator gets 5% bonus
      const liquidationBonus = borrower.collateralAmount * 0.05
      const liquidatorReward = borrower.collateralAmount + liquidationBonus

      // Update liquidator's balance
      updateUserState({
        solBalance: userState.solBalance + liquidatorReward,
      })

      // Remove liquidated borrower from list
      setBorrowers((prev) => prev.filter((b) => b.id !== borrower.id))

      setFeedback({
        type: "success",
        message: `Successfully liquidated ${borrower.walletAddress.slice(0, 8)}... and earned ${liquidatorReward.toFixed(4)} SOL (including 5% bonus)!`,
      })

      // Play success sound
      if (typeof window !== "undefined" && "AudioContext" in window) {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Liquidation failed. Please try again." })
    } finally {
      setIsLoading(false)
      setLiquidatingId(null)
    }
  }

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-4)}`
  }

  const unhealthyCount = borrowers.filter((b) => b.isUnhealthy).length

  return (
    <div className="space-y-6">
      <Card className="bg-secondary/20 border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Liquidation Dashboard
          </CardTitle>
          <CardDescription>Monitor borrower positions and liquidate unhealthy accounts to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/20 border border-border/30 text-center">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-sm text-muted-foreground">Healthy Accounts</p>
              <p className="text-xl font-semibold text-green-500">{borrowers.filter((b) => !b.isUnhealthy).length}</p>
            </div>
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <p className="text-sm text-muted-foreground">Unhealthy Accounts</p>
              <p className="text-xl font-semibold text-destructive">{unhealthyCount}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Liquidation Bonus</p>
              <p className="text-xl font-semibold text-primary">5%</p>
            </div>
          </div>

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
                    <TableCell className="font-mono text-sm">{truncateAddress(borrower.walletAddress)}</TableCell>
                    <TableCell className="text-right font-semibold">{borrower.collateralAmount.toFixed(4)}</TableCell>
                    <TableCell className="text-right font-semibold">${borrower.debtAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={borrower.isUnhealthy ? "destructive" : "secondary"}
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
                        <Badge variant="outline" className="text-green-400 border-green-500/30">
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
              <p className="text-lg font-semibold text-green-500">All accounts are healthy!</p>
              <p className="text-sm text-muted-foreground">No liquidation opportunities available.</p>
            </div>
          )}

          {feedback && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
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
              • <strong>Health Factor:</strong> Calculated as (Collateral Value × 0.8) / Debt Value
            </p>
            <p>
              • <strong>Liquidation Threshold:</strong> Accounts with health factor below 1.0 can be liquidated
            </p>
            <p>
              • <strong>Liquidator Reward:</strong> Receive the borrower's collateral plus a 5% bonus
            </p>
            <p>
              • <strong>Risk:</strong> You must have sufficient balance to cover the debt being liquidated
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
