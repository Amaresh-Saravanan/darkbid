use crate::errors::{AppError, AppResult};

pub async fn verify_tx_signature(_rpc_url: &str, _signature: &str) -> AppResult<()> {
    Err(AppError::NotImplemented("solana tx verification".to_string()))
}
