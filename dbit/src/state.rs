use sqlx::PgPool;

use crate::config::AppConfig;

#[derive(Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub db: PgPool,
}

impl AppState {
    pub fn new(config: AppConfig, db: PgPool) -> Self {
        Self { config, db }
    }
}
