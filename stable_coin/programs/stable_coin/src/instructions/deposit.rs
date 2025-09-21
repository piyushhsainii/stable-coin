use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};
use crate::{mint_tokens, state::{Collateral, Config}, SOL_USDC_FEED_ID};

#[derive(Accounts)]
pub struct InitDeposit<'info> {
    // #[account(mut)]
    // pub depositer:Signer<'info>,
    // #[account(
    //     init_if_needed,
    //     payer=depositer,
    //     seeds=[b"collateral"],
    //     space= 8 + Collateral::INIT_SPACE,
    //     bump
    // )]
    // pub collateral_account:Account<'info,Collateral>,
    // #[account(
    //     init_if_needed,
    //     payer=depositer,
    //     seeds=[b"collateral_token_account",depositer.key().as_ref()],
    //     space= 8,
    //     bump
    // )]
    // pub sol_token_account:InterfaceAccount<'info,TokenAccount>,
    // #[account(
    //     init_if_needed,
    //     payer=depositer,
    //     seeds=[b"mint_token_account",depositer.key().as_ref()],
    //     space=8,
    //     bump
    // )]
    // pub depositer_token_account:InterfaceAccount<'info,TokenAccount>,
    // #[account(mut)]
    // pub config:Account<'info,Config>,
    // #[account(mut)]
    // pub mint:InterfaceAccount<'info,Mint>,
    // pub system_program:Program<'info,System>,
    pub price_update:Account<'info, PriceUpdateV2>,
    // pub token_program_2022: Interface<'info, TokenInterface>
}

pub fn process_deposit(ctx: Context<InitDeposit>,amount:u64) -> Result<()> {
    // 1. checking if this is initial deposit -
    // let collateral = &mut ctx.accounts.collateral_account;
    // let config = &mut ctx.accounts.config;
    let pyth = &mut ctx.accounts.price_update;

    // if collateral.is_initialized == false {
    //     collateral.bump = ctx.bumps.collateral_account;
    //     collateral.bump_sol_account = ctx.bumps.sol_token_account;
    //     collateral.is_initialized = true;
    // }
    
   // 2. save the collateral into Associated sol acount
//    let context = CpiContext::new(ctx.accounts.system_program.to_account_info(),Transfer {
//     from:ctx.accounts.depositer.to_account_info(),
//     to:ctx.accounts.sol_token_account.to_account_info()
//    });

//    transfer(context, amount)?;
   // Get USD equivalent of the provided sol
   let feed_id = get_feed_id_from_hex(SOL_USDC_FEED_ID)?;
   let clock = &mut Clock::get()?;
   let usd =  pyth.get_price_no_older_than(&clock, 12000, &feed_id)?;

   msg!("price price:{}",usd.price);
   msg!("price exponent:{}",usd.exponent);

   let sol_price = amount.checked_div(1000000000).unwrap();
   msg!("sol price:{}",sol_price);

   let usd_amount = (usd.price as u64).checked_mul(sol_price).unwrap();
   msg!("usd amount:{}",usd_amount);
   
   // mint tokens to the user
   // mint_tokens(depositer_token_account, token_program_2022, mint, config.bump_mint_acc, amount)?;
   
   // Updating user state
   // collateral.lamports.checked_add(amount).unwrap();

    Ok(())
}
