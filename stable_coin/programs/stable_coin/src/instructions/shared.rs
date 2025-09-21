use anchor_lang::prelude::*;
use anchor_spl::{token_2022::{ mint_to, MintTo }, token_interface::{Mint, TokenAccount, TokenInterface}};

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