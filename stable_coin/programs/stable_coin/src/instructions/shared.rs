use anchor_lang::prelude::*;
use anchor_spl::{token_2022::{ burn, mint_to, Burn, MintTo }, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::MINTSEED;



pub fn mint_tokens<'info>(
    to:&InterfaceAccount<'info,TokenAccount>,
    token_program:&Interface<'info, TokenInterface>,
    mint_address:&InterfaceAccount<'info, Mint>,
    mint_bump:u8,
    amount:u64
) -> Result<()> {

    let signer_seeds: &[&[&[u8]]] = &[&[MINTSEED, &[mint_bump]]];

    let ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
        MintTo{
        authority:mint_address.to_account_info(),
        to:to.to_account_info(),
        mint:mint_address.to_account_info()
    }, signer_seeds);

    mint_to(ctx, amount)?;

    Ok(())
}


pub fn integer_usd_from_pyth(price_raw: i64, expo: i32) -> i128 {
    let p = price_raw as i128;
    if expo < 0 {
        let denom = 10i128.pow((-expo) as u32);
        p / denom      // integer part (floor for positive prices)
    } else {
        // expo >= 0 -> multiply
        let mul = 10i128.pow(expo as u32);
        p * mul
    }
}

pub fn lamports_to_usd<'info>(
    lamports:u64,
    usd:u64,
) -> Result<(u64)>{
    let token_amount = lamports.checked_mul(usd).unwrap().checked_div(1000000000).unwrap();
    Ok(token_amount)
}

pub fn usd_to_lamports<'info>(
    usd_amount:u64,
    usd_per_sol:u64
)-> Result<u64>{
     let lamports = usd_amount.checked_mul(1000000000).unwrap().checked_div(usd_per_sol).unwrap();
     Ok((lamports))
}


pub fn calculate_health_factor<'info>(
    borrowed_amt: u64,
    collateral_amount_in_usd: u64,
    max_lts: u64,
) -> u64 {
    if borrowed_amt == 0 {
        return u64::MAX; // or 1, or any sentinel value you prefer
    }

    collateral_amount_in_usd
        .checked_mul(max_lts).expect("overflow in collateral * max_lts")
        .checked_div(borrowed_amt).expect("division by borrowed_amt")
        .checked_div(10000).expect("division by 10000")
}


pub fn burn_tokens<'info>(
    mint:&InterfaceAccount<'info,Mint>,
    token_program:&Interface<'info, TokenInterface>,
    mint_bump:u8,
    user:&InterfaceAccount<'info, TokenAccount>,
    amount:u64
){
    let signer_seeds: &[&[&[u8]]] = &[&[MINTSEED, &[mint_bump]]];

    let ctx = CpiContext::new_with_signer(
        token_program.to_account_info(),
         Burn{
            authority:mint.to_account_info(),
            mint:mint.to_account_info(),
            from:user.to_account_info(),
         }, 
        signer_seeds
    );
    burn(ctx, amount);

}