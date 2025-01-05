use crate::{handlers, state::AppState};
use axum::{
    routing::{get, post},
    Router,
};

pub fn api_router() -> Router<AppState> {
    Router::new()
        .route("/health", get(handlers::health_check))
        .nest("/api", Router::new())
}
