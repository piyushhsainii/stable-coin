"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Zap, DollarSign, BarChart3, Lock, Globe } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Over-Collateralized Security",
    description: "Every SolStable token is backed by 150% SOL collateral, ensuring maximum stability and security.",
    delay: "0s",
  },
  {
    icon: Zap,
    title: "Lightning Fast Transactions",
    description: "Built on Solana for sub-second finality and ultra-low transaction costs.",
    delay: "0.2s",
  },
  {
    icon: DollarSign,
    title: "USD Pegged Stability",
    description: "Maintains a stable $1.00 peg through algorithmic and collateral-backed mechanisms.",
    delay: "0.4s",
  },
  {
    icon: BarChart3,
    title: "Yield Generation",
    description: "Earn passive income through staking rewards and protocol fees.",
    delay: "0.6s",
  },
  {
    icon: Lock,
    title: "Transparent & Audited",
    description: "Open-source smart contracts audited by leading security firms.",
    delay: "0.8s",
  },
  {
    icon: Globe,
    title: "Global Accessibility",
    description: "Access stable currency anywhere in the world, 24/7.",
    delay: "1s",
  },
]

export function FeaturesSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">
            Built for the Future of
            <span className="text-primary block mt-2">Decentralized Finance</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
            SolStable combines the stability of traditional finance with the innovation of DeFi, creating a new standard
            for digital currency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: feature.delay }}
            >
              <CardContent className="p-8">
                <feature.icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
