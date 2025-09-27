use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_spl::token_interface::{Mint, TokenInterface};
use mpl_token_metadata::{instructions::{CreateMetadataAccountV3Cpi, CreateMetadataAccountV3InstructionArgs, CreateV1Cpi, CreateV1InstructionArgs}, types::{ DataV2, TokenStandard}};
use crate::{state::Config};

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

 #[account(
    init,
    payer=admin,
    seeds=[b"jacked_nerd"],
    mint::authority=mint,
    mint::freeze_authority=mint,
    mint::token_program=token_program,
    mint::decimals=9,
    bump
 )]
 pub mint:InterfaceAccount<'info,Mint>,
   #[account(mut)]
 pub metadata: UncheckedAccount<'info>,
 pub token_metadata_program:UncheckedAccount<'info>,
 pub rent: Sysvar<'info, Rent>,
 pub sysvar:UncheckedAccount<'info>,
 pub token_program:Interface<'info,TokenInterface>,
 pub system_program:Program<'info,System>

}

pub fn process_config(
    ctx: Context<InitConfig>, 
    liq_thx:u64,
    liq_bonus:u64,
    min_health_factor:u64,
    close_factor:u64
) -> Result<()> {

    let config_account = &mut ctx.accounts.config;

    config_account.set_inner(Config { 
        authority: ctx.accounts.mint.mint_authority.unwrap(),
        mint_address: ctx.accounts.mint.key(),
        liq_thx: liq_thx,
        liq_bonus: liq_bonus,
        min_health_factor: min_health_factor,
        bump: ctx.bumps.config,
        bump_mint_acc: ctx.bumps.mint,
        close_factor:close_factor
     });
    
    // Build the CPI to Metaplex Token Metadata
  let metadata_data = DataV2 {
        name: "Jacked Nerd".to_string(),
        symbol: "JACKEDNERD".to_string(),
        uri: "https://apneajyhbpncbciasirk.supabase.co/storage/v1/object/public/nft-storage/uri.json".to_string(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let rent = &ctx.accounts.rent.to_account_info();

   
    let cpi_context1 = CreateV1Cpi {
        __program: &ctx.accounts.token_metadata_program,
        metadata: &ctx.accounts.metadata,
        master_edition: None, // Not needed for fungible tokens
        mint: (&ctx.accounts.mint.to_account_info(), false),
        authority: &ctx.accounts.mint.to_account_info(),
        payer: &ctx.accounts.admin.to_account_info(),
        update_authority: (&ctx.accounts.mint.to_account_info(), false),
        system_program: &ctx.accounts.system_program,
        sysvar_instructions:  &ctx.accounts.sysvar.to_account_info(),
        spl_token_program: Some(&ctx.accounts.token_program),
        __args: CreateV1InstructionArgs {
            // Required fields
            name: "Jacked Nerd".to_string(),
            symbol: "JACKEDNERD".to_string(),
            uri: "https://apneajyhbpncbciasirk.supabase.co/storage/v1/object/public/nft-storage/uri.json".to_string(),
            // Specify token standard explicitly (IMPORTANT for fungible tokens)
            token_standard: TokenStandard::Fungible,
            // Optional fields - set appropriately for fungible tokens
            collection: None,
            collection_details: None,
            creators: None,
            decimals: Some(9), // Important for fungible tokens
            is_mutable: true,
            primary_sale_happened: false,
            print_supply: None, // Not used for fungible tokens
            rule_set: None, // Programmable NFT rules, not needed for fungible
            seller_fee_basis_points: 0,
            uses: None,
        },
    };

    // Build the CPI to Metaplex Token Metadata
    let cpi_context = CreateMetadataAccountV3Cpi {
        __program: &ctx.accounts.token_metadata_program,
        metadata: &ctx.accounts.metadata,
        mint: &ctx.accounts.mint.to_account_info(),
        mint_authority: &ctx.accounts.mint.to_account_info(),  // Mint PDA is the mint authority
        payer: &ctx.accounts.admin.to_account_info(),
        update_authority: (&ctx.accounts.mint.to_account_info(), false),  // Mint PDA is update authority
        system_program: &ctx.accounts.system_program,
        rent: Some(rent),
        __args: CreateMetadataAccountV3InstructionArgs {
            data: metadata_data,
            is_mutable: true,
            collection_details: None,
        },
    };
    // Execute the CPI with mint PDA signing
    let mint_seeds = &[b"jacked_nerd".as_ref(), &[ctx.bumps.mint]];
    let signer_seeds = &[&mint_seeds[..]];
    
    cpi_context1.invoke_signed(signer_seeds)?;

    msg!("Success attaching metadata");
    Ok(())
}
