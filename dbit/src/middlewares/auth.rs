use uuid::Uuid;

use crate::errors::{AppError, AppResult};

#[derive(Debug, Clone)]
pub struct AuthUser {
    pub user_id: Uuid,
}

pub async fn require_auth() -> AppResult<AuthUser> {
    Err(AppError::NotImplemented("auth middleware".to_string()))
}
