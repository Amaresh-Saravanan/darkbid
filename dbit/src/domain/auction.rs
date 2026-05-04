use std::cmp::Ordering;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::Type;
use uuid::Uuid;

use crate::domain::bid::Bid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Type)]
#[sqlx(type_name = "auction_status", rename_all = "SCREAMING_SNAKE_CASE")]
pub enum AuctionStatus {
    Active,
    Reveal,
    Ended,
}

#[derive(Debug, Clone)]
pub struct Auction {
    pub id: Uuid,
    pub creator_id: Uuid,
    pub title: String,
    pub reserve_price: i64,
    pub status: AuctionStatus,
    pub commit_end_at: DateTime<Utc>,
    pub reveal_end_at: DateTime<Utc>,
    pub winner_bid_id: Option<Uuid>,
}

pub fn pick_winner(bids: &[Bid]) -> Option<Bid> {
    bids.iter()
        .filter(|bid| bid.is_valid && bid.reveal_amount.is_some())
        .cloned()
        .max_by(|a, b| {
            let a_amount = a.reveal_amount.unwrap_or_default();
            let b_amount = b.reveal_amount.unwrap_or_default();

            match a_amount.cmp(&b_amount) {
                Ordering::Equal => match b.commit_at.cmp(&a.commit_at) {
                    Ordering::Equal => b.bidder_id.cmp(&a.bidder_id),
                    other => other,
                },
                other => other,
            }
        })
}
