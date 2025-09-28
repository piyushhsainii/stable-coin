use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};
use anchor_spl::{associated_token::AssociatedToken, token_2022::{burn, Burn}, token_interface::{Mint, TokenAccount, TokenInterface}};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::{burn_tokens, calculate_health_factor, error::ErrorCode, integer_usd_from_pyth, lamports_to_usd, state::{Collateral, Config}, usd_to_lamports, COLLATERALSEED, MINTSEED, SOL_USDC_FEED_ID};


#[derive(Accounts)]
pub struct Liquidate<'info>{
    #[account(mut)]
    pub liquidator:Signer<'info>,
       #[account(
        mut,
        has_one=sol_account,
    )]
    pub collateral_account:Account<'info,Collateral>,
    #[account(mut)]
    pub sol_account:AccountInfo<'info>,
      #[account(
        mut,
        associated_token::mint=mint,
        associated_token::authority=liquidator,
        associated_token::token_program=token_program_2022
    )]
    pub liquidator_token_account:InterfaceAccount<'info,TokenAccount>,
    /// SAFETY: This account is only used as a recipient for SOL transfers. 
/// The seeds ensure that the PDA is derived deterministically and cannot be arbitrarily passed in by the client.
    #[account(
        mut,
        seeds=[b"config"],
        bump
    )]
    pub config:Account<'info,Config>,
    #[account(
        mut,
        seeds=[b"jacked_nerd"],
        mint::authority=mint,
        mint::freeze_authority=mint,
        mint::token_program=token_program_2022,
        bump
    )]
    pub mint:InterfaceAccount<'info,Mint>,
    pub system_program:Program<'info,System>,
    pub price_update:Account<'info, PriceUpdateV2>,
    pub token_program_2022: Interface<'info, TokenInterface>,
    pub associated_token_program:Program<'info,AssociatedToken>

}


// 1 Make sure the account is unhealthy in order to be liquidated
// 2 Create a function to getLamportsFromUsd()- 
        // usd because our stable coin is pegged to USD so 1token = 1usd
// Reduce borrower’s debt by the repaid stablecoins.
// Reduce borrower’s collateral by the seized collateral.
// Transfer seized collateral → liquidator.
// Burn the liquidator’s repaid stablecoins.

pub fn process_liquidate(ctx:Context<Liquidate>, coin_amount:u64)-> Result<()>{

    let collateral_account = &mut ctx.accounts.collateral_account;
    // borrower's sol account
    let sol_account = &mut ctx.accounts.sol_account;
    let collateral_token_acc = &mut  ctx.accounts.liquidator_token_account;
    let price = &mut ctx.accounts.price_update;
    let config = &mut ctx.accounts.config;

    let clock = &Clock::get()?;
    let feed_id = get_feed_id_from_hex(SOL_USDC_FEED_ID)?;
    let price = price.get_price_no_older_than(clock, 100, &feed_id)?;

    let price_in_usd = integer_usd_from_pyth(price.price, price.exponent);

    let collateral_amount_in_usd = lamports_to_usd(collateral_account.lamports, (price_in_usd as u64))?;

    // Ensuring that account is unhealthy
    let health_factor = calculate_health_factor(
        collateral_account.lamports,
        collateral_amount_in_usd,
        config.liq_thx);
    // stop liquidation is account is healthy
    if health_factor >= 1 {
        return Err(ErrorCode::HealthFactorError.into())
    }
    let max_liquidation_amount = config.close_factor.checked_mul(collateral_account.lamports).unwrap().checked_div(10000).unwrap();

    let usd_price = integer_usd_from_pyth(price.price, price.exponent);
    let coin_amount_in_lamports = usd_to_lamports(coin_amount, (usd_price as u64))?;
    let bonus_amount = coin_amount_in_lamports.checked_mul(config.liq_bonus).unwrap().checked_div(100000).unwrap();

    let total_coin_amount_in_lamports = coin_amount_in_lamports.checked_add(bonus_amount).unwrap();

    if total_coin_amount_in_lamports > max_liquidation_amount {
        return Err(ErrorCode::MaxLiquidationAmount.into())
    }
    
    // transfer the coins of the user to the protocol
    burn_tokens(
        &ctx.accounts.mint,
        &ctx.accounts.token_program_2022,
        config.bump_mint_acc,
        &ctx.accounts.liquidator_token_account,
        coin_amount
    );

    // transfer the collateral of the user to the liquidator
    let signer_seeds: &[&[&[u8]]] = &[&[
    COLLATERALSEED,
    collateral_account.depositer.as_ref(),
    &[collateral_account.bump_sol_account]
]];

    let ctx = CpiContext::new_with_signer(
        ctx.accounts.system_program.to_account_info(),
        Transfer{
        from:sol_account.to_account_info(),
        to:ctx.accounts.liquidator.to_account_info()
        },
        signer_seeds);

    transfer(ctx,total_coin_amount_in_lamports)?;

    // Updating States of the protocol
    collateral_account.coins = collateral_account.coins.checked_sub(coin_amount).unwrap();
    collateral_account.lamports = collateral_account.lamports.checked_sub(total_coin_amount_in_lamports).unwrap();
    
    Ok(())

}