use anchor_lang::{prelude::*};

// account to store global info for our stable coin
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub authority:Pubkey,
    pub mint_address:Pubkey,
    pub liq_thx:u64,
    pub liq_bonus:u64,
    pub min_health_factor:u64,
    pub close_factor:u64,
    pub bump:u8,
    pub bump_mint_acc:u8,
}

// collteral account for each user to store collateral and stable coin info.
#[account]
#[derive(InitSpace)]
pub struct Collateral {
    pub depositer:Pubkey,
    pub sol_account:Pubkey,
    pub coin_token_account:Pubkey,
    pub is_initialized:bool,
    pub lamports:u64,
    pub coins:u64,
    pub bump:u8,
    pub bump_sol_account:u8
}