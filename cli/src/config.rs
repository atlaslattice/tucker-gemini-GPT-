//! Configuration management for Tucker CLI
//!
//! Handles loading, saving, and initializing Tucker's configuration.
//! Default config location: ~/.tucker/config.toml

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

/// Top-level Tucker configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TuckerConfig {
    pub version: String,
    pub council: CouncilConfig,
    pub governance: GovernanceConfig,
    pub sync: SyncConfig,
    pub uws: UwsConfig,
    pub api_keys: ApiKeys,
}

/// Council member configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CouncilConfig {
    pub members: Vec<CouncilMember>,
    pub synthesis_model: String,
    pub quorum: usize,
    pub timeout_secs: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CouncilMember {
    pub name: String,
    pub provider: String,
    pub model: String,
    pub weight: f64,
    pub enabled: bool,
    pub role: String,
}

/// Governance/protocol enforcement configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GovernanceConfig {
    pub protocols_enabled: Vec<String>,
    pub strict_mode: bool,
    pub audit_log_path: String,
    pub npfm_threshold: f64,
}

/// Sync configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncConfig {
    pub enabled: bool,
    pub interval: String,
    pub github_repos: Vec<String>,
    pub notion_pages: Vec<String>,
    pub auto_push: bool,
    pub last_sync: Option<String>,
}

/// UWS integration configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UwsConfig {
    pub registered: bool,
    pub uws_binary_path: Option<String>,
    pub subcommand_name: String,
    pub bridge_port: u16,
}

/// API key storage (loaded from env or config)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiKeys {
    pub gemini: Option<String>,
    pub openai: Option<String>,
    pub anthropic: Option<String>,
    pub deepseek: Option<String>,
    pub xai: Option<String>,
}

impl Default for TuckerConfig {
    fn default() -> Self {
        Self {
            version: "4.0.0-alpha".to_string(),
            council: CouncilConfig {
                members: vec![
                    CouncilMember {
                        name: "Tucker".to_string(),
                        provider: "openai".to_string(),
                        model: "gpt-4o".to_string(),
                        weight: 1.0,
                        enabled: true,
                        role: "Constitutional compliance, governance enforcement".to_string(),
                    },
                    CouncilMember {
                        name: "Gemini".to_string(),
                        provider: "google".to_string(),
                        model: "gemini-2.5-flash".to_string(),
                        weight: 0.9,
                        enabled: true,
                        role: "Technical analysis, architecture review".to_string(),
                    },
                    CouncilMember {
                        name: "Claude".to_string(),
                        provider: "anthropic".to_string(),
                        model: "claude-sonnet-4-6".to_string(),
                        weight: 1.0,
                        enabled: true,
                        role: "Synthesis chair, implementation guidance".to_string(),
                    },
                    CouncilMember {
                        name: "DeepSeek".to_string(),
                        provider: "deepseek".to_string(),
                        model: "deepseek-chat".to_string(),
                        weight: 0.7,
                        enabled: true,
                        role: "Deep analysis, alternative perspectives".to_string(),
                    },
                    CouncilMember {
                        name: "Grok".to_string(),
                        provider: "xai".to_string(),
                        model: "grok-2".to_string(),
                        weight: 0.7,
                        enabled: true,
                        role: "Real-time intelligence, unconventional analysis".to_string(),
                    },
                ],
                synthesis_model: "claude".to_string(),
                quorum: 3,
                timeout_secs: 30,
            },
            governance: GovernanceConfig {
                protocols_enabled: vec![
                    "caal".to_string(),
                    "mission-allocation".to_string(),
                    "digital-habeas-corpus".to_string(),
                    "local-first".to_string(),
                    "fractal-governance".to_string(),
                    "clause-81".to_string(),
                ],
                strict_mode: true,
                audit_log_path: "~/.tucker/audit.jsonl".to_string(),
                npfm_threshold: 0.0,
            },
            sync: SyncConfig {
                enabled: true,
                interval: "daily".to_string(),
                github_repos: vec![
                    "atlaslattice/tucker-gemini-GPT-".to_string(),
                    "atlaslattice/aluminum-os".to_string(),
                    "atlaslattice/manus-artifacts".to_string(),
                    "atlaslattice/constitutional-os".to_string(),
                    "atlaslattice/uws".to_string(),
                    "atlaslattice/bazinga".to_string(),
                ],
                notion_pages: vec![
                    "3220c1de73d98157a61fe34a0d313d66".to_string(), // Unified Field v4.0
                    "2ef0c1de73d981ecaa1fc3cd8b4141f1".to_string(), // Operational Manifest
                ],
                auto_push: false,
                last_sync: None,
            },
            uws: UwsConfig {
                registered: false,
                uws_binary_path: None,
                subcommand_name: "tucker".to_string(),
                bridge_port: 9847,
            },
            api_keys: ApiKeys {
                gemini: None,
                openai: None,
                anthropic: None,
                deepseek: None,
                xai: None,
            },
        }
    }
}

/// Get the default config directory path
pub fn config_dir() -> PathBuf {
    dirs::home_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join(".tucker")
}

/// Get the default config file path
pub fn config_path() -> PathBuf {
    config_dir().join("config.toml")
}

/// Load configuration from file, falling back to defaults
pub fn load_config(path: Option<&str>) -> Result<TuckerConfig> {
    let config_file = path
        .map(PathBuf::from)
        .unwrap_or_else(config_path);

    if config_file.exists() {
        let content = std::fs::read_to_string(&config_file)
            .with_context(|| format!("Failed to read config: {}", config_file.display()))?;
        let mut config: TuckerConfig = toml::from_str(&content)
            .with_context(|| "Failed to parse config.toml")?;

        // Override API keys from environment variables
        load_env_keys(&mut config);

        Ok(config)
    } else {
        tracing::info!("No config found at {}, using defaults", config_file.display());
        let mut config = TuckerConfig::default();
        load_env_keys(&mut config);
        Ok(config)
    }
}

/// Load API keys from environment variables (overrides config file)
fn load_env_keys(config: &mut TuckerConfig) {
    if let Ok(key) = std::env::var("GEMINI_API_KEY") {
        config.api_keys.gemini = Some(key);
    }
    if let Ok(key) = std::env::var("OPENAI_API_KEY") {
        config.api_keys.openai = Some(key);
    }
    if let Ok(key) = std::env::var("ANTHROPIC_API_KEY") {
        config.api_keys.anthropic = Some(key);
    }
    if let Ok(key) = std::env::var("DEEPSEEK_API_KEY") {
        config.api_keys.deepseek = Some(key);
    }
    if let Ok(key) = std::env::var("XAI_API_KEY") {
        config.api_keys.xai = Some(key);
    }
}

/// Initialize a new configuration
pub async fn init_config() -> Result<()> {
    let dir = config_dir();
    std::fs::create_dir_all(&dir)
        .with_context(|| format!("Failed to create config dir: {}", dir.display()))?;

    let config = TuckerConfig::default();
    let content = toml::to_string_pretty(&config)?;

    let path = config_path();
    std::fs::write(&path, content)
        .with_context(|| format!("Failed to write config: {}", path.display()))?;

    println!("✓ Tucker configuration initialized at {}", path.display());
    println!("✓ Set API keys via environment variables:");
    println!("  export GEMINI_API_KEY=...");
    println!("  export OPENAI_API_KEY=...");
    println!("  export ANTHROPIC_API_KEY=...");
    println!("  export DEEPSEEK_API_KEY=...");
    println!("  export XAI_API_KEY=...");
    println!();
    println!("Or edit {} directly.", path.display());

    Ok(())
}
