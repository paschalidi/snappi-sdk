use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error, Serialize)]
#[serde(tag = "code", content = "detail")]
pub enum GeneralError {
    #[error("Invalid request: {0}")]
    BadRequest(String),

    #[error("Authentication failed: {0}")]
    Authentication(String),

    #[error("Permission denied: {0}")]
    Authorization(String),

    #[error("Resource not found: {0}")]
    NotFound(String),

    #[error("Server error: {0}")]
    Internal(String),

    #[error("Rate limit exceeded: {0}")]
    RateLimit(String),
}

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<GeneralError>,
}

pub struct ServerResponse;

impl ServerResponse {
    pub fn ok<T: Serialize>(data: T) -> Response {
        (
            StatusCode::OK,
            Json(ApiResponse {
                data: Some(data),
                error: None,
            }),
        )
            .into_response()
    }

    pub fn created<T: Serialize>(data: T) -> Response {
        (
            StatusCode::CREATED,
            Json(ApiResponse {
                data: Some(data),
                error: None,
            }),
        )
            .into_response()
    }

    pub fn bad_request(detail: impl Into<String>) -> Response {
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse::<()> {
                data: None,
                error: Some(GeneralError::BadRequest(detail.into())),
            }),
        )
            .into_response()
    }

    pub fn unauthorized(detail: impl Into<String>) -> Response {
        (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse::<()> {
                data: None,
                error: Some(GeneralError::Authentication(detail.into())),
            }),
        )
            .into_response()
    }

    pub fn forbidden(detail: impl Into<String>) -> Response {
        (
            StatusCode::FORBIDDEN,
            Json(ApiResponse::<()> {
                data: None,
                error: Some(GeneralError::Authorization(detail.into())),
            }),
        )
            .into_response()
    }

    pub fn not_found(detail: impl Into<String>) -> Response {
        (
            StatusCode::NOT_FOUND,
            Json(ApiResponse::<()> {
                data: None,
                error: Some(GeneralError::NotFound(detail.into())),
            }),
        )
            .into_response()
    }
}
