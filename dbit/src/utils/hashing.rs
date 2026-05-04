use sha2::{Digest, Sha256};
use uuid::Uuid;

pub fn commit_hash(amount: i64, nonce: &str, bidder_id: &Uuid) -> String {
    let mut hasher = Sha256::new();
    hasher.update(amount.to_string());
    hasher.update(":" );
    hasher.update(nonce);
    hasher.update(":" );
    hasher.update(bidder_id.as_bytes());
    hex::encode(hasher.finalize())
}

pub fn verify_commit(expected_hash: &str, amount: i64, nonce: &str, bidder_id: &Uuid) -> bool {
    let actual = commit_hash(amount, nonce, bidder_id);
    actual == expected_hash
}
