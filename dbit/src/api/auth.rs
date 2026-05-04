use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};

use crate::{errors::{AppError, AppResult}, state::AppState};

#[derive(Deserialize)]
pub struct RegisterRequest {
    pub wallet_address: String,
    pub email: Option<String>,
    pub password: Option<String>,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub wallet_address: String,
    pub password: Option<String>,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
}

pub async fn register(
    State(_state): State<AppState>,
    Json(_req): Json<RegisterRequest>,
) -> AppResult<Json<AuthResponse>> {
    Err(AppError::NotImplemented("register".to_string()))
}

pub async fn login(
    State(_state): State<AppState>,
    Json(_req): Json<LoginRequest>,
) -> AppResult<Json<AuthResponse>> {
    Err(AppError::NotImplemented("login".to_string()))
}
