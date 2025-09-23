"use client";

import { ShaderBackground } from "@/components/shader-background";
import { MatrixBackground } from "@/components/matrix-background";
import { Navbar } from "@/components/navbar";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { UserStateProvider } from "@/contexts/user-state-context";

export default function Dashboard() {
  return (
    <UserStateProvider>
      <div className="min-h-screen bg-background text-foreground">
        <ShaderBackground />
        <MatrixBackground />
        <Navbar />
        <main className="container mx-auto px-4 py-8 relative z-10 mt-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2 text-balance">
                Solana Stablecoin Protocol
              </h1>
              <p className="text-muted-foreground text-lg">
                Deposit SOL, mint stablecoins, and manage your positions
              </p>
            </div>
            <DashboardTabs />
          </div>
        </main>
      </div>
    </UserStateProvider>
  );
}
