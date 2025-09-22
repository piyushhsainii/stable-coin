use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};

use crate::{burn_tokens, calculate_health_factor, error::ErrorCode, integer_usd_from_pyth, lamports_to_usd, state::{Collateral, Config}, usd_to_lamports, SOL_USDC_FEED_ID};

#[derive(Accounts)]
pub struct WithdrawBurn<'info>{
    #[account(mut)]
    pub withdrawer:Signer<'info>,
    #[account(
        mut,
        seeds=[b"collateral", withdrawer.key().as_ref()],
        bump
    )]
    pub withdrawer_collateral_account:Account<'info,Collateral>,
    #[account(
        mut,
        seeds=[b"config"],
        bump
    )]
    pub config:Account<'info,Config>,
    pub withdraw_collateral_token_account:InterfaceAccount<'info, TokenAccount>,
    pub mint:InterfaceAccount<'info,Mint>,
    pub price_update:Account<'info,PriceUpdateV2>,
    pub token_program:Interface<'info, TokenInterface>,
    pub system_program:Program<'info, System>
}

//  1. Check Health Factor to make sure the account does not go below the minimum health factor.
//  2. Use the Burn function from anchor-spl-2022 to actually burn the tokens on chain. 
//  3. Update the state of the user's collateral account
//  4. Transfer back the user's deposited funds from the sol account to the user's account.

pub fn withdraw_burn(ctx:Context<WithdrawBurn>, withdraw_amount:u64)-> Result<()> {

    let collateral_account = &mut ctx.accounts.withdrawer_collateral_account;
    let collateral_token_acc = &mut  ctx.accounts.withdraw_collateral_token_account;
    let price = &mut ctx.accounts.price_update;
    let config = &mut ctx.accounts.config;
    // fetching live price feeds
    let clock = &Clock::get()?;
    let feed_id = get_feed_id_from_hex(SOL_USDC_FEED_ID)?;
    let price = price.get_price_no_older_than(clock, 100, &feed_id)?;

    let price_in_usd = integer_usd_from_pyth(price.price, price.exponent);
    // calculating health factor

    let withdraw_amount_in_lamports = usd_to_lamports(withdraw_amount, (price_in_usd as u64))?;
    let total_collateral_in_lamports = collateral_account.lamports.checked_sub(withdraw_amount_in_lamports).unwrap();
    let total_collateral_amount_in_usd = lamports_to_usd(total_collateral_in_lamports,(price_in_usd as u64))?;

    let health_factor = calculate_health_factor(
        collateral_account.coins,
         total_collateral_amount_in_usd,
         config.liq_thx
        );

    if health_factor <= 0 {
        return Err(ErrorCode::HealthFactorError.into())
    }

    // Burn the tokens
    burn_tokens(
        &ctx.accounts.mint,
        &ctx.accounts.token_program,
        config.bump_mint_acc, 
        collateral_token_acc,
        withdraw_amount
        );
    let mut withdrawal_transfer_amount:u64;
    // handling max lamports edge case
    if withdraw_amount_in_lamports > collateral_account.lamports {
        withdrawal_transfer_amount = collateral_account.lamports;
    }

    withdrawal_transfer_amount = withdraw_amount_in_lamports;

    // Transfer the equivalent collateral back to the user
    let context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),Transfer {
        from:ctx.accounts.withdraw_collateral_token_account.to_account_info(),
        to:ctx.accounts.withdrawer.to_account_info()
    });

   transfer(context, withdrawal_transfer_amount)?;
   // Update the state of the user 
    collateral_account.coins = collateral_account.coins.checked_div(withdraw_amount).unwrap();
    collateral_account.lamports = collateral_account.lamports.checked_div(withdrawal_transfer_amount).unwrap();

    Ok(())
}