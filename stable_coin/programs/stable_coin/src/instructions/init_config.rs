use anchor_lang::prelude::*;
use crate::state::Config;

#[derive(Accounts)]
pub struct InitConfig<'info> {
 #[account(mut)]
 pub admin:Signer<'info>,
 #[account(
    init,
    payer=admin,
    seeds=[b"config"],
    space= 8 + Config::INIT_SPACE,
    bump
 )]
 pub config:Account<'info, Config>,
 pub system_program:Program<'info,System>

}

pub fn process_config(
    ctx: Context<InitConfig>, 
    authority:Pubkey,
    mint_address:Pubkey,
    liq_thx:u64,
    liq_bonus:u64,
    min_health_factor:u64,
    bump:u8,
    bump_mint_acc:u8
) -> Result<()> {

    let config_account = &mut ctx.accounts.config;

    config_account.set_inner(Config { 
        authority: authority,
        mint_address: mint_address,
        liq_thx: liq_thx,
        liq_bonus: liq_bonus,
        min_health_factor: min_health_factor,
        bump: bump,
        bump_mint_acc: bump_mint_acc
     });
    
    Ok(())
}
