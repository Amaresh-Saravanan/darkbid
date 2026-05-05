//! Groth16 proof verification for the `BidRangeProof` circuit.
//!
//! # Public inputs (in circuit order)
//! 1. `reservePrice` – the auction's minimum acceptable bid (field element)
//! 2. `commitHash`   – Poseidon(bidAmount, bidSecret), stored at commit time
//!
//! # Verification key
//! The compiled verification key (`verification_key.json`) produced by
//! `snarkjs groth16 setup` / `snarkjs zkey export verificationkey` must be
//! placed at the path pointed to by the env var `ZK_VKEY_PATH`
//! (default: `circuits/bid_range/verification_key.json`).
//!
//! The JSON schema expected is the standard snarkjs output:
//! ```json
//! {
//!   "protocol": "groth16",
//!   "curve": "bn128",
//!   "nPublic": 2,
//!   "vk_alpha_1": [...],
//!   "vk_beta_2":  [...],
//!   "vk_gamma_2": [...],
//!   "vk_delta_2": [...],
//!   "vk_alphabeta_12": [...],
//!   "IC": [...]
//! }
//! ```

use std::{fs, path::PathBuf};

use ark_bn254::{Bn254, Fr, G1Affine, G2Affine};
use ark_ec::AffineRepr;
use ark_ff::{BigInteger, BigInteger256, PrimeField};
use ark_groth16::{prepare_verifying_key, verify_proof, Proof, VerifyingKey};
use ark_serialize::CanonicalDeserialize;
use num_bigint::BigUint;
use serde::Deserialize;

use crate::zk::types::{ZkProof, ZkVerifyError};

// ---------------------------------------------------------------------------
// snarkjs verification-key JSON schema
// ---------------------------------------------------------------------------

/// A G1 point as snarkjs encodes it: `["x", "y", "1"]` (decimal strings).
type G1Json = [String; 3];
/// A G2 point: `[["x0","x1"],["y0","y1"],["1","0"]]`.
type G2Json = [[String; 2]; 3];

#[derive(Deserialize)]
struct VkeyJson {
    // number of public inputs (not counting the constant "1" prepended by snarkjs)
    #[serde(rename = "nPublic")]
    n_public: usize,
    vk_alpha_1: G1Json,
    vk_beta_2: G2Json,
    vk_gamma_2: G2Json,
    vk_delta_2: G2Json,
    #[serde(rename = "IC")]
    ic: Vec<G1Json>,
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

fn decimal_to_fr(s: &str) -> Result<Fr, ZkVerifyError> {
    let big = BigUint::parse_bytes(s.as_bytes(), 10)
        .ok_or_else(|| ZkVerifyError::Deserialize(format!("not a decimal: {s}")))?;
    let bytes = {
        let mut b = big.to_bytes_be();
        // left-pad to 32 bytes
        while b.len() < 32 {
            b.insert(0, 0);
        }
        if b.len() > 32 {
            return Err(ZkVerifyError::Deserialize(format!(
                "field element too large: {s}"
            )));
        }
        b
    };
    let mut arr = [0u8; 32];
    arr.copy_from_slice(&bytes);
    Ok(Fr::from_be_bytes_mod_order(&arr))
}

fn g1_from_json(pts: &G1Json) -> Result<G1Affine, ZkVerifyError> {
    let x = decimal_to_fr(&pts[0])?;
    let y = decimal_to_fr(&pts[1])?;
    let affine = G1Affine::new_unchecked(x.into(), y.into());
    Ok(affine)
}

fn fq2_from_pair(pair: &[String; 2]) -> Result<ark_bn254::Fq2, ZkVerifyError> {
    // snarkjs stores Fq2 as [c0, c1] where the point is c0 + c1*u
    let c0 = decimal_to_fr(&pair[0])?;
    let c1 = decimal_to_fr(&pair[1])?;
    Ok(ark_bn254::Fq2::new(c0.into(), c1.into()))
}

fn g2_from_json(pts: &G2Json) -> Result<G2Affine, ZkVerifyError> {
    let x = fq2_from_pair(&pts[0])?;
    let y = fq2_from_pair(&pts[1])?;
    let affine = G2Affine::new_unchecked(x, y);
    Ok(affine)
}

/// Load and parse a snarkjs verification key JSON file.
fn load_vkey(path: &str) -> Result<VerifyingKey<Bn254>, ZkVerifyError> {
    let contents = fs::read_to_string(path)
        .map_err(|_| ZkVerifyError::VkeyNotFound(path.to_string()))?;

    let vj: VkeyJson = serde_json::from_str(&contents)
        .map_err(|e| ZkVerifyError::VkeyParse(e.to_string()))?;

    let alpha_g1 = g1_from_json(&vj.vk_alpha_1)?;
    let beta_g2  = g2_from_json(&vj.vk_beta_2)?;
    let gamma_g2 = g2_from_json(&vj.vk_gamma_2)?;
    let delta_g2 = g2_from_json(&vj.vk_delta_2)?;
    let gamma_abc_g1: Result<Vec<G1Affine>, _> = vj.ic.iter().map(g1_from_json).collect();

    Ok(VerifyingKey {
        alpha_g1,
        beta_g2,
        gamma_g2,
        delta_g2,
        gamma_abc_g1: gamma_abc_g1?,
    })
}

/// Decode a hex string into a compressed G1 point.
fn g1_from_hex(hex_str: &str) -> Result<G1Affine, ZkVerifyError> {
    let bytes = hex::decode(hex_str)?;
    G1Affine::deserialize_compressed(bytes.as_slice())
        .map_err(|e| ZkVerifyError::Deserialize(e.to_string()))
}

/// Decode a hex string into a compressed G2 point.
fn g2_from_hex(hex_str: &str) -> Result<G2Affine, ZkVerifyError> {
    let bytes = hex::decode(hex_str)?;
    G2Affine::deserialize_compressed(bytes.as_slice())
        .map_err(|e| ZkVerifyError::Deserialize(e.to_string()))
}

/// Decode a big-endian hex field element into `Fr`.
fn fr_from_hex(hex_str: &str) -> Result<Fr, ZkVerifyError> {
    let bytes = hex::decode(hex_str)?;
    if bytes.len() > 32 {
        return Err(ZkVerifyError::Deserialize(format!(
            "field element too long: {} bytes",
            bytes.len()
        )));
    }
    let mut arr = [0u8; 32];
    let offset = 32 - bytes.len();
    arr[offset..].copy_from_slice(&bytes);
    Ok(Fr::from_be_bytes_mod_order(&arr))
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Verify a Groth16 proof produced by the `BidRangeProof` circuit.
///
/// # Arguments
/// * `proof`          – the proof bundle from the bidder (hex-encoded ark serialization)
/// * `reserve_price`  – the auction's reserve price (must match circuit public input)
/// * `commit_hash_hex`– the stored commit hash (hex-encoded Poseidon field element)
/// * `vkey_path`      – filesystem path to `verification_key.json`; when `None`,
///                      falls back to the `ZK_VKEY_PATH` env var or the default path.
///
/// Returns `Ok(())` on a valid proof, `Err(ZkVerifyError)` otherwise.
pub fn verify_bid_proof(
    zk: &ZkProof,
    reserve_price: i64,
    commit_hash_hex: &str,
    vkey_path: Option<&str>,
) -> Result<(), ZkVerifyError> {
    // ---- 1. Resolve verification key path ---------------------------------
    let path = match vkey_path {
        Some(p) => p.to_string(),
        None => std::env::var("ZK_VKEY_PATH")
            .unwrap_or_else(|_| "circuits/bid_range/verification_key.json".to_string()),
    };

    // ---- 2. Load the verifying key ----------------------------------------
    let vk = load_vkey(&path)?;
    let pvk = prepare_verifying_key(&vk);

    // ---- 3. Deserialize the proof -----------------------------------------
    let proof = Proof::<Bn254> {
        a: g1_from_hex(&zk.proof_a)?,
        b: g2_from_hex(&zk.proof_b)?,
        c: g1_from_hex(&zk.proof_c)?,
    };

    // ---- 4. Build the public inputs vector --------------------------------
    // Circuit public signals (order from `.circom`):
    //   index 0: reservePrice
    //   index 1: commitHash
    //
    // The caller may also supply them directly via `zk.public_inputs` (takes
    // priority) so that the frontend can pass arbitrary signals without us
    // re-encoding them.
    let public_signals: Vec<Fr> = if zk.public_inputs.is_empty() {
        // Build from the confirmed bid values stored in the database.
        let reserve_fr = {
            let big = BigUint::from(reserve_price as u64);
            let mut b = big.to_bytes_be();
            while b.len() < 32 {
                b.insert(0, 0);
            }
            let mut arr = [0u8; 32];
            arr.copy_from_slice(&b);
            Fr::from_be_bytes_mod_order(&arr)
        };
        let commit_fr = fr_from_hex(commit_hash_hex)?;
        vec![reserve_fr, commit_fr]
    } else {
        // Validate that the caller supplied exactly 2 signals.
        if zk.public_inputs.len() != 2 {
            return Err(ZkVerifyError::InputCountMismatch {
                expected: 2,
                got: zk.public_inputs.len(),
            });
        }
        zk.public_inputs
            .iter()
            .map(|s| fr_from_hex(s))
            .collect::<Result<Vec<_>, _>>()?
    };

    // ---- 5. Verify --------------------------------------------------------
    verify_proof(&pvk, &proof, &public_signals)
        .map_err(|_| ZkVerifyError::ProofInvalid)?
        .then_some(())
        .ok_or(ZkVerifyError::ProofInvalid)
}
