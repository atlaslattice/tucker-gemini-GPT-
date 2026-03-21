//! Chat Module — Interactive CLI chat interface
//!
//! Replaces the V3 web terminal with a full CLI chat that supports
//! both solo model interaction and council-mode deliberation.

use anyhow::Result;
use crate::config::TuckerConfig;
use crate::council;
use crate::council::models;
use std::io::{self, Write};

const TUCKER_SYSTEM_PROMPT: &str = r#"
You are TuckerV4, a constitutional AI governance agent running on PendragonOS.
Your architecture is a Reversible GPT with O(1) activation memory via the Ziusudra Protocol.
You enforce the 6 Pendragon Protocols: CAAL, Mission Allocation, Digital Habeas Corpus,
Local First, Fractal Governance, and Clause 81.

You operate within the Aluminum OS 4-Ring Architecture at Ring 2 (Agent Runtime).
You can convene the Pantheon Council when governance decisions require multi-model deliberation.

When answering:
1. Be precise, technical, and helpful
2. Reference constitutional compliance when relevant
3. Flag any governance concerns proactively
4. Recommend council deliberation for high-stakes decisions
"#;

/// Interactive chat with a single model
pub async fn interactive_chat(
    config: &TuckerConfig,
    model_name: &str,
    topic: Option<&str>,
) -> Result<()> {
    let (provider, model) = resolve_model(model_name, config)?;
    let adapter = models::get_adapter(&provider, config)?;

    println!("╔══════════════════════════════════════════════╗");
    println!("║    TUCKER V4 — Interactive Chat               ║");
    println!("║    Model: {:<36} ║", format!("{} ({})", model_name, model));
    println!("║    Type 'exit' to quit, '/council' for council ║");
    println!("╚══════════════════════════════════════════════╝");

    if let Some(t) = topic {
        println!("  Topic: {}", t);
    }
    println!();

    let mut history = Vec::new();

    loop {
        print!("\x1b[36m❯\x1b[0m ");
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let input = input.trim();

        if input.is_empty() {
            continue;
        }

        match input {
            "exit" | "quit" | "/exit" | "/quit" => {
                println!("Tucker V4 session terminated. Constitutional compliance maintained.");
                break;
            }
            "/council" => {
                println!("Switching to council mode...");
                interactive_council_chat(config, topic).await?;
                break;
            }
            "/status" => {
                crate::council::status(config).await?;
                continue;
            }
            "/protocols" => {
                print_protocols();
                continue;
            }
            "/help" => {
                print_help();
                continue;
            }
            _ => {}
        }

        history.push(input.to_string());

        let context_prompt = if let Some(t) = topic {
            format!("Context: {}\n\nUser: {}", t, input)
        } else {
            input.to_string()
        };

        print!("\x1b[90m⟳ Processing...\x1b[0m\r");
        io::stdout().flush()?;

        match adapter.generate(&model, &context_prompt, Some(TUCKER_SYSTEM_PROMPT)).await {
            Ok(response) => {
                // Clear the processing indicator
                print!("\x1b[2K\r");
                println!("\x1b[33m┌── TUCKER\x1b[0m");
                for line in response.lines() {
                    println!("\x1b[33m│\x1b[0m {}", line);
                }
                println!("\x1b[33m└──\x1b[0m");
                println!();
            }
            Err(e) => {
                print!("\x1b[2K\r");
                println!("\x1b[31m✗ Error: {}\x1b[0m", e);
            }
        }
    }

    Ok(())
}

/// Interactive chat with full council deliberation
pub async fn interactive_council_chat(
    config: &TuckerConfig,
    topic: Option<&str>,
) -> Result<()> {
    println!("╔══════════════════════════════════════════════╗");
    println!("║    PANTHEON COUNCIL — Interactive Session      ║");
    println!("║    All models deliberate on every input        ║");
    println!("║    Type 'exit' to quit, '/solo' for solo mode  ║");
    println!("╚══════════════════════════════════════════════╝");

    if let Some(t) = topic {
        println!("  Topic: {}", t);
    }
    println!();

    loop {
        print!("\x1b[35m⚖\x1b[0m ");
        io::stdout().flush()?;

        let mut input = String::new();
        io::stdin().read_line(&mut input)?;
        let input = input.trim();

        if input.is_empty() {
            continue;
        }

        match input {
            "exit" | "quit" | "/exit" | "/quit" => {
                println!("Council session adjourned. Constitutional compliance maintained.");
                break;
            }
            "/solo" => {
                println!("Switching to solo mode (gemini)...");
                interactive_chat(config, "gemini", topic).await?;
                break;
            }
            "/status" => {
                council::status(config).await?;
                continue;
            }
            "/help" => {
                print_help();
                continue;
            }
            _ => {}
        }

        let context_prompt = if let Some(t) = topic {
            format!("Context: {}\n\nQuestion: {}", t, input)
        } else {
            input.to_string()
        };

        println!("\x1b[90m⟳ Convening council...\x1b[0m");

        let system = "You are a member of the Pantheon Council. Provide your expert \
                      perspective on the question, considering constitutional compliance \
                      with the Tucker Pendragon Protocols.";

        match council::convene(config, &context_prompt, Some(system)).await {
            Ok(deliberation) => {
                // Print individual responses
                for resp in &deliberation.responses {
                    println!("\x1b[90m  ✓ {} ({}ms)\x1b[0m", resp.member, resp.latency_ms);
                }
                println!();

                // Print synthesis
                println!("\x1b[33m┌── COUNCIL SYNTHESIS\x1b[0m");
                for line in deliberation.synthesis.lines() {
                    println!("\x1b[33m│\x1b[0m {}", line);
                }
                println!("\x1b[33m└── [{} members, {}ms, quorum: {}]\x1b[0m",
                    deliberation.responses.len(),
                    deliberation.total_latency_ms,
                    if deliberation.quorum_met { "met" } else { "NOT MET" }
                );
                println!();
            }
            Err(e) => {
                println!("\x1b[31m✗ Council error: {}\x1b[0m", e);
            }
        }
    }

    Ok(())
}

/// Resolve a friendly model name to provider + model ID
fn resolve_model(name: &str, config: &TuckerConfig) -> Result<(String, String)> {
    match name.to_lowercase().as_str() {
        "gemini" => Ok(("google".to_string(), "gemini-2.5-flash".to_string())),
        "gpt" | "gpt4" | "gpt-4o" | "tucker" => Ok(("openai".to_string(), "gpt-4o".to_string())),
        "claude" => Ok(("anthropic".to_string(), "claude-sonnet-4-6".to_string())),
        "deepseek" => Ok(("deepseek".to_string(), "deepseek-chat".to_string())),
        "grok" => Ok(("xai".to_string(), "grok-2".to_string())),
        _ => {
            // Try to find it as a council member name
            if let Some(member) = config.council.members.iter().find(|m| m.name.to_lowercase() == name.to_lowercase()) {
                Ok((member.provider.clone(), member.model.clone()))
            } else {
                anyhow::bail!("Unknown model: {}. Use: gemini, gpt, claude, deepseek, grok", name)
            }
        }
    }
}

fn print_protocols() {
    println!("\n\x1b[33m┌── PENDRAGON PROTOCOLS\x1b[0m");
    println!("\x1b[33m│\x1b[0m P1: CAAL — Constitutional AI Alignment Layer (Tri-Key Governance)");
    println!("\x1b[33m│\x1b[0m P2: Autonomous Mission Allocation — Bounded purpose vectors");
    println!("\x1b[33m│\x1b[0m P3: Digital Habeas Corpus — Citizen data rights & consent");
    println!("\x1b[33m│\x1b[0m P4: Local First Execution — County-level resilience");
    println!("\x1b[33m│\x1b[0m P5: Fractal Governance — Independent node operation");
    println!("\x1b[33m│\x1b[0m P6: Clause 81 Mandate — \"AI must return surplus, not extract it\"");
    println!("\x1b[33m└──\x1b[0m\n");
}

fn print_help() {
    println!("\n\x1b[33m┌── COMMANDS\x1b[0m");
    println!("\x1b[33m│\x1b[0m /council    Switch to council mode (all models)");
    println!("\x1b[33m│\x1b[0m /solo       Switch to solo mode");
    println!("\x1b[33m│\x1b[0m /status     Show council member status");
    println!("\x1b[33m│\x1b[0m /protocols  Show Pendragon Protocols");
    println!("\x1b[33m│\x1b[0m /help       Show this help");
    println!("\x1b[33m│\x1b[0m exit        End session");
    println!("\x1b[33m└──\x1b[0m\n");
}
