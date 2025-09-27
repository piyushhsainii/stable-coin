"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, Wallet2, Coins } from "lucide-react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wallet = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  const playHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleClick = async () => {
    playHaptic();
    // Add click sound if Web Audio API is available
    if (typeof window !== "undefined" && "AudioContext" in window) {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
    await wallet.connect();
  };

  if (!mounted) return null;

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={"/"}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-animation"></div>
              <span className="text-xl font-bold text-foreground">
                Jacked Nerd
              </span>
            </div>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              How it Works
            </a>
            <a
              href="#security"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Security
            </a>
            <WalletMultiButton
              style={{
                background: "var(--primary)",
                color: "var(--text-primary-foreground)",
              }}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="flex gap-1 items-center justify-center">
                    <div>2</div>
                    <Coins color="yellow" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  How much Jacked Nerd tokens you own!
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleClick();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border border-border rounded-lg mt-2">
              <a
                href="#features"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                How it Works
              </a>
              <a
                href="#security"
                className="block px-3 py-2 text-muted-foreground hover:text-primary"
              >
                Security
              </a>
              <WalletMultiButton
                style={{
                  background: "var(--primary)",
                  color: "var(--text-primary-foreground)",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
