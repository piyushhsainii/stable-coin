# 🔗 Solana Stablecoin Protocol

A decentralized stablecoin protocol built on the **Solana blockchain**.  
Users deposit **SOL** as collateral and mint a **USD-pegged stablecoin** against it.  
The protocol ensures peg stability using overcollateralization, oracle-based pricing, and liquidation mechanisms.

---

## ✨ Features

- 💰 **Mint Stablecoins** – Deposit SOL as collateral to mint USD-pegged tokens.
- 📊 **Oracle Pricing** – Uses [Pyth Network](https://pyth.network/) to fetch real-time SOL/USD price.
- 🛡 **Overcollateralization** – Borrowing limited by Loan-to-Value (LTV) and health factor thresholds.
- ⚡ **Liquidations** – Under-collateralized positions can be liquidated by third parties (liquidators earn a bonus).
- 🔒 **Config Account** – Stores global protocol parameters (authority, mint address, liquidation threshold, bonus %, etc.).
- 🚀 **Built on Anchor** – Structured and secure smart contract framework on Solana.

---

## 🏗 Architecture

- **Config Account** → Stores protocol-level settings (authority, mint PDA, bumps, thresholds).
- **User Account** → Tracks each user’s deposits, borrows, and health factor.
- **Stablecoin Mint** → The USD-pegged token minted against SOL collateral.
- **Liquidation Logic** → Liquidators burn stablecoins to repay borrower debt and claim collateral with a liquidation bonus.

---

## 🔄 Flow

1. User deposits **SOL** → receives stablecoin tokens pegged to USD (1:1).
2. If SOL price goes up → user’s collateral is safer, but no new tokens are minted automatically.
3. If SOL price goes down → health factor may drop below 1, triggering liquidation.
4. Liquidator repays debt (burns stablecoins) → seizes collateral + liquidation bonus.

---

## ⚙️ Development

### Prerequisites

- Rust & Cargo
- Solana CLI
- Anchor Framework
- Pyth Oracle (devnet endpoint)

### Deploying to Devnet

```bash
# Set Solana to devnet
solana config set --url https://api.devnet.solana.com

# Build program
anchor build

# Deploy program
anchor deploy
```
