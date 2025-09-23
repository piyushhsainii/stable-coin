use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Custom error message")]
    CustomError,
    #[msg("Account not healthy")]
    HealthFactorError,
    #[msg("Cannot Liquidate more than the close factor")]
    MaxLiquidationAmount,
}

