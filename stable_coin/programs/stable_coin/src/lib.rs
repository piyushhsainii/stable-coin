pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;

declare_id!("9KiLz7DcP447pKUegKzT1xwNbTh5EJwvdVLWkW3QM4Vq"); 

#[program]
pub mod stable_coin {
    use super::*;
    pub fn process_config(
        ctx:Context<InitConfig>,
        liq_thx:u64,
        liq_bonus:u64,
        min_health_factor:u64,
        close_factor:u64,
    ) -> Result<()>{
    instructions::process_config(ctx, liq_thx, liq_bonus, min_health_factor, close_factor)?;
    Ok(())
    }

    pub fn deposit_and_mint_tokens(ctx: Context<InitDeposit>,amount:u64) -> Result<()> {
        instructions::process_deposit(ctx, amount)?;
        Ok(())
    }
    pub fn withdraw_burn(ctx:Context<WithdrawBurn>,withdraw_amount:u64)-> Result<()>{
        instructions::withdraw_burn(ctx, withdraw_amount)?;
        Ok(())
    }
    pub fn liquidate(ctx:Context<Liquidate>,coin_amount:u64)-> Result<()>{
        instructions::process_liquidate(ctx, coin_amount)?;
        Ok(())
    }
}
