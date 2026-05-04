use axum::{extract::{Path, State}, Json};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{domain::auction::AuctionStatus, errors::{AppError, AppResult}, state::AppState};

#[derive(Deserialize)]
pub struct CreateAuctionRequest {
    pub title: String,
    pub reserve_price: i64,
    pub commit_duration_seconds: Option<i64>,
    pub reveal_duration_seconds: Option<i64>,
}

#[derive(Serialize)]
pub struct AuctionSummary {
    pub id: Uuid,
    pub title: String,
    pub status: AuctionStatus,
    pub commit_end_at: DateTime<Utc>,
    pub reveal_end_at: DateTime<Utc>,
}

#[derive(Serialize)]
pub struct AuctionDetail {
    pub id: Uuid,
    pub title: String,
    pub reserve_price: i64,
    pub status: AuctionStatus,
    pub commit_end_at: DateTime<Utc>,
    pub reveal_end_at: DateTime<Utc>,
    pub winner_bid_id: Option<Uuid>,
}

#[derive(Serialize)]
pub struct AuctionResult {
    pub auction_id: Uuid,
    pub winner_bid_id: Option<Uuid>,
    pub status: AuctionStatus,
}

pub async fn create_auction(
    State(_state): State<AppState>,
    Json(_req): Json<CreateAuctionRequest>,
) -> AppResult<Json<AuctionDetail>> {
    Err(AppError::NotImplemented("create_auction".to_string()))
}

pub async fn list_auctions(State(_state): State<AppState>) -> AppResult<Json<Vec<AuctionSummary>>> {
    Err(AppError::NotImplemented("list_auctions".to_string()))
}

pub async fn get_auction(
    Path(_id): Path<Uuid>,
    State(_state): State<AppState>,
) -> AppResult<Json<AuctionDetail>> {
    Err(AppError::NotImplemented("get_auction".to_string()))
}

pub async fn get_result(
    Path(_id): Path<Uuid>,
    State(_state): State<AppState>,
) -> AppResult<Json<AuctionResult>> {
    Err(AppError::NotImplemented("get_result".to_string()))
}
