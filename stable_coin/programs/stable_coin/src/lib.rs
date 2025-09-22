pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;

declare_id!("BDpeVzSYtJJPNq5s9HvRn74BnjPhV4B3XcWEFrYW5BT4"); 

#[program]
pub mod stable_coin {
    use super::*;
    pub fn deposit_and_mint_tokens(ctx: Context<InitDeposit>,amount:u64) -> Result<()> {
        instructions::process_deposit(ctx, amount)?;
        Ok(())
    }
    // pub fn withdraw_burn()
}
