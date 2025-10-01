"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  useEffect(() => {
    setMounted(true);
  }, []);

  const playHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(100);
    }
    router.push("/dashboard");
  };

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center ">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Zap className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm text-primary font-medium">
              Built on Solana • Lightning Fast
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6 glow-animation py-4">
            The Future of
            <span className="text-primary block mt-2 ">Stable Currency</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto mb-8 leading-relaxed">
            Jacked Nerd is a USD-pegged stablecoin backed by SOL collateral,
            delivering unmatched stability and transparency on the Solana
            blockchain.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg glow-animation cursor-pointer"
              onClick={playHaptic}
            >
              Launch App
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center p-6 rounded-xl bg-card/50 border border-border/50 float-animation">
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Over-Collateralized
              </h3>
              <p className="text-muted-foreground text-center">
                150% SOL backing ensures stability
              </p>
            </div>

            <div
              className="flex flex-col items-center p-6 rounded-xl bg-card/50 border border-border/50 float-animation"
              style={{ animationDelay: "1s" }}
            >
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground text-center">
                Sub-second transactions on Solana
              </p>
            </div>

            <div
              className="flex flex-col items-center p-6 rounded-xl bg-card/50 border border-border/50 float-animation"
              style={{ animationDelay: "2s" }}
            >
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Yield Generating</h3>
              <p className="text-muted-foreground text-center">
                Earn rewards while holding
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
