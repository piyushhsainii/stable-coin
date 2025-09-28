use anchor_lang::{prelude::*, system_program::{transfer, Transfer}};
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface}};
use pyth_solana_receiver_sdk::price_update::{get_feed_id_from_hex, PriceUpdateV2};
use crate::{calculate_health_factor, error::ErrorCode, integer_usd_from_pyth, lamports_to_usd, mint_tokens, state::{Collateral, Config}, SOL_USDC_FEED_ID};

#[derive(Accounts)]
pub struct InitDeposit<'info> {
    #[account(mut)]
    pub depositer:Signer<'info>,
    #[account(
        init_if_needed,
        payer=depositer,
        seeds=[b"collateral", depositer.key().as_ref()],
        space= 8 + Collateral::INIT_SPACE,
        bump
    )]
    pub collateral_account:Account<'info,Collateral>,
    /// SAFETY: This account is only used as a recipient for SOL transfers. 
    /// The seeds ensure that the PDA is derived deterministically and cannot be arbitrarily passed in by the client.
    #[account(
        init_if_needed,
        payer=depositer,
        seeds=[b"collateral_token_account",depositer.key().as_ref()],
        space=0,
        bump
    )]
    pub sol_token_account: AccountInfo<'info>,
    #[account(
        init_if_needed,
        payer=depositer,
        associated_token::mint=mint,
        associated_token::authority=depositer,
        associated_token::token_program=token_program_2022
    )]
    pub depositer_token_account:InterfaceAccount<'info,TokenAccount>,
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

    // 1. Checking if this is initial deposit -
    // 2. Save the collateral into Associated sol acount
    //  3. Get USD equivalent of the provided sol
    //  4. Mint tokens to the user
    // 5. Updating user state

pub fn process_deposit(ctx: Context<InitDeposit>,amount:u64) -> Result<()> {
    // 1. checking if this is initial deposit -
    let collateral = &mut ctx.accounts.collateral_account;
    let config = &mut ctx.accounts.config;
    let pyth = &mut ctx.accounts.price_update;

    if collateral.is_initialized == false {
        collateral.bump = ctx.bumps.collateral_account;
        collateral.bump_sol_account = ctx.bumps.sol_token_account;
        collateral.is_initialized = true;
        collateral.coin_token_account = ctx.accounts.depositer_token_account.key();
        collateral.sol_account = ctx.accounts.sol_token_account.key();
        collateral.depositer = ctx.accounts.depositer.key.key();
    }
    
   // 2. save the collateral into associated sol acount
   let context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),Transfer {
    from:ctx.accounts.depositer.to_account_info(),
    to:ctx.accounts.sol_token_account.to_account_info()
   });

   transfer(context, amount)?;

   // 3. Get USD equivalent of the provided sol
   let feed_id = get_feed_id_from_hex(SOL_USDC_FEED_ID)?;
   let clock = &mut Clock::get()?;
   let usd =  pyth.get_price_no_older_than(&clock, 100, &feed_id)?;

   msg!("price price:{}",usd.price);
   msg!("price exponent:{}",usd.exponent);

   let sol_price = amount.checked_div(1000000000).unwrap();
   msg!("sol price:{}",sol_price);
  // Fetching sol live price
   let usd_amount = integer_usd_from_pyth(usd.price, usd.exponent);
   msg!("usd amount:{}",usd_amount);
   let token_amt = lamports_to_usd(amount,usd_amount as u64)?;

  //4.Checking HF to ensure safety.
    let new_collateral_amount = collateral.lamports.checked_add(amount).unwrap();
    let new_collateral_in_usd = lamports_to_usd(new_collateral_amount, usd_amount as u64)?;

   let health_factor = calculate_health_factor(collateral.coins, new_collateral_in_usd, config.liq_thx);

   if health_factor <= 0 {
        return Err(ErrorCode::HealthFactorError.into());
   }
   // 5. mint tokens to the user
   mint_tokens(
        &mut ctx.accounts.depositer_token_account,
         &mut ctx.accounts.token_program_2022,
        &mut ctx.accounts.mint, 
        config.bump_mint_acc, 
        token_amt
    )?;
   
   // 6. Updating user state
   collateral.coins = collateral.coins.checked_add(token_amt).unwrap();
   collateral.lamports = collateral.lamports.checked_add(amount).unwrap();
    Ok(())
}
