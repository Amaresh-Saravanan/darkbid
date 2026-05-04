use chrono::{DateTime, Utc};
use uuid::Uuid;

#[derive(Debug, Clone)]
pub struct Bid {
    pub id: Uuid,
    pub auction_id: Uuid,
    pub bidder_id: Uuid,
    pub commit_hash: String,
    pub commit_at: DateTime<Utc>,
    pub reveal_amount: Option<i64>,
    pub is_valid: bool,
}
