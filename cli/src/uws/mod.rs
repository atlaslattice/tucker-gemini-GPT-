//! UWS Integration Module — Universal Workspace CLI bridge
//!
//! Registers Tucker as both a standalone binary and a UWS subcommand.
//! When running as a UWS plugin, Tucker receives commands via the bridge
//! protocol and returns results to UWS for unified workspace display.

use anyhow::Result;
use crate::config::TuckerConfig;
use std::path::PathBuf;

/// UWS plugin manifest for registration
const UWS_PLUGIN_MANIFEST: &str = r#"{
    "name": "tucker",
    "version": "4.0.0-alpha",
    "description": "Constitutional AI Governance Agent — Pendragon Protocol enforcement with 5-model council",
    "ring": 2,
    "commands": [
        {
            "name": "tucker",
            "description": "Tucker governance CLI",
            "subcommands": [
                {"name": "chat", "description": "Interactive chat (solo or council mode)"},
                {"name": "council", "description": "Convene Pantheon Council"},
                {"name": "govern", "description": "Run constitutional compliance check"},
                {"name": "sync", "description": "Sync constitutional documents"},
                {"name": "status", "description": "Show Tucker status"}
            ]
        }
    ],
    "bridge": {
        "type": "subprocess",
        "binary": "tucker",
        "protocol": "json-rpc"
    },
    "aluminum_os": {
        "ring": 2,
        "component": "agent-runtime",
        "constitutional_protocols": ["caal", "mission-allocation", "digital-habeas-corpus", "local-first", "fractal-governance", "clause-81"]
    }
}"#;

/// Register Tucker as a UWS subcommand
pub async fn register(config: &TuckerConfig) -> Result<()> {
    println!("UWS REGISTRATION");
    let uws_path = find_uws_binary(config)?;
    println!("UWS binary: {}", uws_path.display());
    let manifest_dir = get_uws_plugin_dir(&uws_path)?;
    let manifest_path = manifest_dir.join("tucker.json");
    std::fs::create_dir_all(&manifest_dir)?;
    std::fs::write(&manifest_path, UWS_PLUGIN_MANIFEST)?;
    println!("Plugin manifest: {}", manifest_path.display());
    let tucker_path = std::env::current_exe()?;
    println!("Tucker binary: {}", tucker_path.display());
    let link_path = manifest_dir.join("tucker");
    if !link_path.exists() {
        #[cfg(unix)]
        std::os::unix::fs::symlink(&tucker_path, &link_path)?;
        #[cfg(windows)]
        std::os::windows::fs::symlink_file(&tucker_path, &link_path)?;
    }
    println!("Tucker registered as UWS subcommand");
    println!("Usage: uws tucker chat --council | uws tucker council review | uws tucker govern | uws tucker sync full");
    Ok(())
}

/// Unregister Tucker from UWS
pub async fn unregister(config: &TuckerConfig) -> Result<()> {
    let uws_path = find_uws_binary(config)?;
    let manifest_dir = get_uws_plugin_dir(&uws_path)?;
    let manifest_path = manifest_dir.join("tucker.json");
    let link_path = manifest_dir.join("tucker");
    if manifest_path.exists() { std::fs::remove_file(&manifest_path)?; }
    if link_path.exists() { std::fs::remove_file(&link_path)?; }
    println!("Tucker unregistered from UWS");
    Ok(())
}

/// Show UWS integration status
pub async fn status(config: &TuckerConfig) -> Result<()> {
    println!("UWS INTEGRATION STATUS");
    let registered = config.uws.registered;
    println!("Registered: {}", if registered { "YES" } else { "NO" });
    println!("Subcommand: uws {}", config.uws.subcommand_name);
    println!("Bridge port: {}", config.uws.bridge_port);
    match find_uws_binary(config) {
        Ok(path) => println!("UWS binary: {} (found)", path.display()),
        Err(_) => println!("UWS binary: not found"),
    }
    println!("Aluminum OS: Ring 2 (Agent Runtime) | Component: tucker-governance | Protocols: 6/6 active");
    Ok(())
}

/// Handle UWS bridge commands (subprocess mode)
pub async fn bridge(config: &TuckerConfig, command: &[String]) -> Result<()> {
    if command.is_empty() {
        println!("{{\"error\": \"no command provided\"}}");
        return Ok(());
    }
    let cmd = command[0].as_str();
    let args = &command[1..];
    match cmd {
        "status" => {
            let status = serde_json::json!({
                "name": "tucker",
                "version": "4.0.0-alpha",
                "ring": 2,
                "council_members": config.council.members.len(),
                "protocols_active": config.governance.protocols_enabled.len(),
                "sync_enabled": config.sync.enabled,
            });
            println!("{}", serde_json::to_string_pretty(&status)?);
        }
        "council-ask" => {
            let question = args.join(" ");
            if question.is_empty() {
                println!("{{\"error\": \"no question provided\"}}");
            } else {
                let result = crate::council::convene(config, &question, Some("You are a Pantheon Council member providing governance guidance.")).await?;
                let output = serde_json::json!({
                    "question": result.question,
                    "responses": result.responses.iter().map(|r| serde_json::json!({"member": r.member, "provider": r.provider, "latency_ms": r.latency_ms, "weight": r.weight, "content": r.content})).collect::<Vec<_>>(),
                    "synthesis": result.synthesis,
                    "quorum_met": result.quorum_met,
                    "total_latency_ms": result.total_latency_ms,
                });
                println!("{}", serde_json::to_string_pretty(&output)?);
            }
        }
        "protocols" => {
            let protocols = serde_json::json!({"protocols": [
                {"id": "P1", "name": "CAAL", "full": "Constitutional AI Alignment Layer"},
                {"id": "P2", "name": "Mission Allocation", "full": "Autonomous Mission Allocation"},
                {"id": "P3", "name": "Habeas Corpus", "full": "Digital Habeas Corpus"},
                {"id": "P4", "name": "Local First", "full": "Local First Execution"},
                {"id": "P5", "name": "Fractal", "full": "Fractal Governance and Redundancy"},
                {"id": "P6", "name": "Clause 81", "full": "Clause 81 Mandate"}
            ]});
            println!("{}", serde_json::to_string_pretty(&protocols)?);
        }
        _ => { println!("{{\"error\": \"unknown bridge command: {}\"}}", cmd); }
    }
    Ok(())
}

/// Find the UWS binary on the system
fn find_uws_binary(config: &TuckerConfig) -> Result<PathBuf> {
    if let Some(path) = &config.uws.uws_binary_path {
        let p = PathBuf::from(path);
        if p.exists() { return Ok(p); }
    }
    if let Ok(output) = std::process::Command::new("which").arg("uws").output() {
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            return Ok(PathBuf::from(path));
        }
    }
    let common_paths = ["/usr/local/bin/uws", "/usr/bin/uws", "~/.cargo/bin/uws"];
    for path in common_paths {
        let p = PathBuf::from(path);
        if p.exists() { return Ok(p); }
    }
    anyhow::bail!("UWS binary not found. Install UWS first: cargo install uws")
}

/// Get the UWS plugin directory
fn get_uws_plugin_dir(uws_path: &PathBuf) -> Result<PathBuf> {
    let home = dirs::home_dir().unwrap_or_else(|| PathBuf::from("."));
    Ok(home.join(".uws").join("plugins").join("tucker"))
}