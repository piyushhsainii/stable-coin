"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Twitter, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const playHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  if (!mounted) return null;

  return (
    <footer className="bg-card/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-animation">
                <span className="text-primary-foreground font-bold text-lg">
                  S
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                SolStable
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              The future of stable currency on Solana. Secure, fast, and
              transparent decentralized finance for everyone.
            </p>
            <div className="flex space-x-4">
              <Link href={"https://x.com/piyushsainii"} target="_blank">
                <Button variant="ghost" size="sm" onClick={playHaptic}>
                  <Twitter className="w-5 h-5" />
                </Button>
              </Link>
              <Link href={"https://github.com/piyushhsainii"} target="_blank">
                <Button variant="ghost" size="sm" onClick={playHaptic}>
                  <Github className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Security
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Whitepaper
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Audit Reports
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2025 SolStable. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
