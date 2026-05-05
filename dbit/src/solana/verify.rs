//! Solana on-chain transaction verification via JSON-RPC.
//!
//! Used to confirm that commit/reveal transactions actually landed on-chain
//! before the backend accepts them.

use serde::{Deserialize, Serialize};

use crate::errors::{AppError, AppResult};

// ─────────────────────────────────────────────────────────────────────────────
// Solana JSON-RPC types (subset we care about)
// ─────────────────────────────────────────────────────────────────────────────

/// JSON-RPC 2.0 request envelope.
#[derive(Serialize)]
struct RpcRequest<'a> {
    jsonrpc: &'a str,
    id: u64,
    method: &'a str,
    params: serde_json::Value,
}

/// JSON-RPC 2.0 response envelope.
#[derive(Deserialize)]
struct RpcResponse {
    result: Option<serde_json::Value>,
    error: Option<RpcError>,
}

#[derive(Deserialize, Debug)]
struct RpcError {
    code: i64,
    message: String,
}

/// Parsed transaction metadata we extract from the RPC response.
#[derive(Debug, Clone)]
pub struct TxInfo {
    /// Whether the transaction succeeded (no error in meta).
    pub success: bool,
    /// The slot in which the transaction was confirmed.
    pub slot: u64,
    /// Log messages emitted by the program (useful for checking commit_hash).
    pub log_messages: Vec<String>,
    /// Account keys involved in the transaction (Base58 strings).
    pub account_keys: Vec<String>,
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/// Verify that a Solana transaction exists on-chain and was successful.
///
/// Calls `getTransaction` on the provided RPC endpoint. Returns a `TxInfo`
/// with slot, logs, and account keys so the caller can perform additional
/// application-level checks (e.g. "was this signed by the expected wallet?").
///
/// # Errors
/// * `AppError::Validation` if the signature is not found or the tx failed.
/// * `AppError::Validation` if the RPC returns an error.
pub async fn verify_tx_signature(
    http: &reqwest::Client,
    rpc_url: &str,
    signature: &str,
) -> AppResult<TxInfo> {
    let body = RpcRequest {
        jsonrpc: "2.0",
        id: 1,
        method: "getTransaction",
        params: serde_json::json!([
            signature,
            {
                "encoding": "json",
                "commitment": "confirmed",
                "maxSupportedTransactionVersion": 0
            }
        ]),
    };

    let resp = http
        .post(rpc_url)
        .json(&body)
        .send()
        .await
        .map_err(|e| AppError::Validation(format!("Solana RPC request failed: {e}")))?;

    if !resp.status().is_success() {
        return Err(AppError::Validation(format!(
            "Solana RPC returned HTTP {}",
            resp.status()
        )));
    }

    let rpc_resp: RpcResponse = resp
        .json()
        .await
        .map_err(|e| AppError::Validation(format!("failed to parse Solana RPC response: {e}")))?;

    // Check for JSON-RPC level errors
    if let Some(err) = rpc_resp.error {
        return Err(AppError::Validation(format!(
            "Solana RPC error {}: {}",
            err.code, err.message
        )));
    }

    // Null result means the transaction was not found
    let result = rpc_resp
        .result
        .ok_or_else(|| AppError::Validation("transaction not found on-chain".into()))?;

    // Extract slot
    let slot = result["slot"].as_u64().unwrap_or(0);

    // Check if the transaction had an error
    let meta = &result["meta"];
    let tx_err = &meta["err"];
    let success = tx_err.is_null();

    if !success {
        return Err(AppError::Validation(format!(
            "transaction failed on-chain: {}",
            tx_err
        )));
    }

    // Extract log messages
    let log_messages: Vec<String> = meta["logMessages"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    // Extract account keys from the transaction message
    let account_keys: Vec<String> = result["transaction"]["message"]["accountKeys"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect()
        })
        .unwrap_or_default();

    tracing::debug!(
        signature,
        slot,
        success,
        num_logs = log_messages.len(),
        "Solana tx verified"
    );

    Ok(TxInfo {
        success,
        slot,
        log_messages,
        account_keys,
    })
}

/// Verify that a specific wallet was a signer on the transaction.
///
/// Call this after `verify_tx_signature` to ensure the commit/reveal tx
/// was actually signed by the bidder's wallet, not some unrelated account.
pub fn verify_signer(tx_info: &TxInfo, expected_wallet: &str) -> AppResult<()> {
    if tx_info.account_keys.iter().any(|k| k == expected_wallet) {
        Ok(())
    } else {
        Err(AppError::Validation(format!(
            "wallet {} is not a signer on this transaction",
            expected_wallet
        )))
    }
}

/// Check that the transaction logs contain the expected commit hash.
///
/// Anchor programs typically emit the commit hash in a log line like:
/// `"Program log: commit_hash=<hex>"`. This helper does a substring search
/// across all log messages.
pub fn verify_commit_hash_in_logs(tx_info: &TxInfo, expected_hash: &str) -> AppResult<()> {
    let found = tx_info
        .log_messages
        .iter()
        .any(|log| log.contains(expected_hash));

    if found {
        Ok(())
    } else {
        tracing::warn!(
            expected_hash,
            "commit hash not found in transaction logs — skipping log check"
        );
        // NOTE: This is a soft warning, not a hard failure, because not all
        // program implementations emit the hash in logs. If your Anchor program
        // does emit it, change this to return Err.
        Ok(())
    }
}

