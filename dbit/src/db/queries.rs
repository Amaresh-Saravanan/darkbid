use chrono::{DateTime, Utc};
use sqlx::PgPool;

use crate::errors::{AppError, AppResult};

pub async fn advance_auction_statuses(
    _db: &PgPool,
    _now: DateTime<Utc>,
) -> AppResult<()> {
    Ok(())
}

pub async fn create_auction(_db: &PgPool) -> AppResult<()> {
    Err(AppError::NotImplemented("db.create_auction".to_string()))
}

pub async fn list_auctions(_db: &PgPool) -> AppResult<()> {
    Err(AppError::NotImplemented("db.list_auctions".to_string()))
}

pub async fn get_auction(_db: &PgPool) -> AppResult<()> {
    Err(AppError::NotImplemented("db.get_auction".to_string()))
}

pub async fn store_commit(_db: &PgPool) -> AppResult<()> {
    Err(AppError::NotImplemented("db.store_commit".to_string()))
}

pub async fn store_reveal(_db: &PgPool) -> AppResult<()> {
    Err(AppError::NotImplemented("db.store_reveal".to_string()))
}

pub async fn set_winner(_db: &PgPool) -> AppResult<()> {
    Err(AppError::NotImplemented("db.set_winner".to_string()))
}
