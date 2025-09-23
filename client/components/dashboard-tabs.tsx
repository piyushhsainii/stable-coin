"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { DepositTab } from "@/components/deposit-tab"
import { BurnTab } from "@/components/burn-tab"
import { LiquidateTab } from "@/components/liquidate-tab"
import { UserBalanceCard } from "@/components/user-balance-card"

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState("deposit")

  return (
    <div className="space-y-6">
      <UserBalanceCard />

      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/50">
            <TabsTrigger
              value="deposit"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Deposit
            </TabsTrigger>
            <TabsTrigger
              value="burn"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Burn
            </TabsTrigger>
            <TabsTrigger
              value="liquidate"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Liquidate
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="deposit" className="mt-0">
              <DepositTab />
            </TabsContent>

            <TabsContent value="burn" className="mt-0">
              <BurnTab />
            </TabsContent>

            <TabsContent value="liquidate" className="mt-0">
              <LiquidateTab />
            </TabsContent>
          </motion.div>
        </Tabs>
      </Card>
    </div>
  )
}
