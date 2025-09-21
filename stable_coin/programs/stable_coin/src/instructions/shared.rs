use anchor_lang::prelude::*;
use anchor_spl::{token_2022::{mint_to, MintTo, }, token_interface::{Mint, TokenAccount, TokenInterface}};

use crate::MINTSEED;



pub fn mint_tokens<'info>(
    to:Interface<'info,TokenAccount>,
    token_program:Interface<'info, TokenInterface>,
    mint_address:Interface<'info, Mint>,
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

    // new_with_signer()?;

    Ok(())
}