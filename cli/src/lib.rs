//! Tucker Library — Core types and shared functionality
//!
//! This crate provides the library interface for Tucker, enabling both
//! standalone CLI usage and UWS plugin integration.

pub mod config;
pub mod council;
pub mod chat;
pub mod governance;
pub mod sync;
pub mod uws;

/// Tucker version constant
pub const VERSION: &str = "4.0.0-alpha";

/// Aluminum OS Ring designation
pub const RING: u8 = 2; // Agent Runtime

/// Constitutional protocol count
pub const PROTOCOL_COUNT: u8 = 6;
