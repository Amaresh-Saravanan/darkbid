use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{errors::{AppError, AppResult}, state::AppState};

#[derive(Deserialize)]
pub struct CommitBidRequest {
    pub auction_id: Uuid,
    pub bidder_id: Uuid,
    pub commit_hash: String,
    pub commit_tx_sig: String,
}

#[derive(Serialize)]
pub struct CommitBidResponse {
    pub bid_id: Uuid,
}

#[derive(Deserialize)]
pub struct RevealBidRequest {
    pub bid_id: Uuid,
    pub auction_id: Uuid,
    pub bidder_id: Uuid,
    pub reveal_amount: i64,
    pub nonce: String,
    pub reveal_tx_sig: String,
}

#[derive(Serialize)]
pub struct RevealBidResponse {
    pub bid_id: Uuid,
}

pub async fn commit_bid(
    State(_state): State<AppState>,
    Json(_req): Json<CommitBidRequest>,
) -> AppResult<Json<CommitBidResponse>> {
    Err(AppError::NotImplemented("commit_bid".to_string()))
}

pub async fn reveal_bid(
    State(_state): State<AppState>,
    Json(_req): Json<RevealBidRequest>,
) -> AppResult<Json<RevealBidResponse>> {
    Err(AppError::NotImplemented("reveal_bid".to_string()))
}
