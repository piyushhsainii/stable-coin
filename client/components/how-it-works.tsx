"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Deposit SOL Collateral",
    description: "Users deposit SOL tokens as collateral into our secure smart contracts.",
    color: "from-primary/20 to-primary/5",
  },
  {
    step: "02",
    title: "Mint SolStable",
    description: "Receive SolStable tokens at a 150% collateralization ratio for maximum security.",
    color: "from-blue-500/20 to-blue-500/5",
  },
  {
    step: "03",
    title: "Use & Earn",
    description: "Use SolStable for payments, DeFi, or hold to earn yield from protocol fees.",
    color: "from-green-500/20 to-green-500/5",
  },
]

export function HowItWorks() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-balance mb-6">
            How SolStable
            <span className="text-primary block mt-2">Works</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto leading-relaxed">
            Our innovative protocol ensures stability through over-collateralization and algorithmic mechanisms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card
                className="bg-card/50 border-border/50 hover:bg-card/80 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6`}
                  >
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-primary/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
