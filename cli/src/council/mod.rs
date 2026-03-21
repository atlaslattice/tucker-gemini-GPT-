//! Council Module — Multi-model AI deliberation engine
//!
//! Orchestrates GPT-4o, Gemini 2.5, Claude, DeepSeek, and Grok
//! for constitutional governance reviews and deliberations.

pub mod models;
pub mod synthesis;

use anyhow::Result;
use crate::config::{TuckerConfig, CouncilMember};
use models::ModelAdapter;
use synthesis::Synthesizer;
use std::time::Instant;

/// A single council member's response
#[derive(Debug, Clone)]
pub struct CouncilResponse {
    pub member: String,
    pub provider: String,
    pub content: String,
    pub latency_ms: u128,
    pub weight: f64,
}

/// Complete council deliberation result
#[derive(Debug)]
pub struct Deliberation {
    pub question: String,
    pub responses: Vec<CouncilResponse>,
    pub synthesis: String,
    pub quorum_met: bool,
    pub total_latency_ms: u128,
}

/// Convene the council and collect responses
pub async fn convene(
    config: &TuckerConfig,
    prompt: &str,
    system_context: Option<&str>,
) -> Result<Deliberation> {
    let start = Instant::now();
    let active_members: Vec<&CouncilMember> = config.council.members
        .iter()
        .filter(|m| m.enabled)
        .collect();

    tracing::info!("Convening council with {} active members", active_members.len());

    // Fire all model requests concurrently
    let mut handles = Vec::new();

    for member in &active_members {
        let adapter = models::get_adapter(&member.provider, config)?;
        let model = member.model.clone();
        let member_name = member.name.clone();
        let member_provider = member.provider.clone();
        let member_weight = member.weight;
        let prompt_owned = prompt.to_string();
        let context = system_context.map(|s| s.to_string());

        let handle = tokio::spawn(async move {
            let member_start = Instant::now();
            let result = adapter.generate(&model, &prompt_owned, context.as_deref()).await;
            let latency = member_start.elapsed().as_millis();

            match result {
                Ok(content) => Some(CouncilResponse {
                    member: member_name,
                    provider: member_provider,
                    content,
                    latency_ms: latency,
                    weight: member_weight,
                }),
                Err(e) => {
                    tracing::warn!("{} failed: {}", member_name, e);
                    None
                }
            }
        });

        handles.push(handle);
    }

    // Collect results with timeout
    let timeout = tokio::time::Duration::from_secs(config.council.timeout_secs);
    let mut responses = Vec::new();

    for handle in handles {
        match tokio::time::timeout(timeout, handle).await {
            Ok(Ok(Some(response))) => {
                tracing::info!("  ✓ {} responded ({}ms)", response.member, response.latency_ms);
                responses.push(response);
            }
            Ok(Ok(None)) => {} // Model failed, already logged
            Ok(Err(e)) => tracing::warn!("Task error: {}", e),
            Err(_) => tracing::warn!("Council member timed out"),
        }
    }

    let quorum_met = responses.len() >= config.council.quorum;

    // Synthesize responses
    let synthesis = if quorum_met {
        let synthesizer = Synthesizer::new(config)?;
        synthesizer.synthesize(prompt, &responses).await?
    } else {
        format!(
            "⚠ Quorum not met ({}/{} required). {} members responded. Cannot produce synthesis.",
            responses.len(), config.council.quorum, responses.len()
        )
    };

    let total_latency = start.elapsed().as_millis();

    Ok(Deliberation {
        question: prompt.to_string(),
        responses,
        synthesis,
        quorum_met,
        total_latency_ms: total_latency,
    })
}

/// Run a council review on a target
pub async fn review(config: &TuckerConfig, target: &str, review_type: &str) -> Result<()> {
    let prompt = format!(
        "You are a member of the Pantheon Council conducting a {} review.\n\
         Review target: {}\n\n\
         Evaluate on these axes:\n\
         1. Constitutional compliance (Pendragon Protocols)\n\
         2. Technical quality and architecture\n\
         3. NPFM score estimate (Net Positive Flourishing)\n\
         4. Security and governance concerns\n\
         5. Recommendation (approve/conditional/reject)\n\n\
         Provide a score out of 10 and detailed reasoning.",
        review_type, target
    );

    let system = "You are a constitutional AI governance reviewer operating under the \
                  Tucker Pendragon Protocols. Your role is to ensure all proposals comply \
                  with the 6 protocols: CAAL, Mission Allocation, Digital Habeas Corpus, \
                  Local First, Fractal Governance, and Clause 81.";

    let result = convene(config, &prompt, Some(system)).await?;
    print_deliberation(&result);
    Ok(())
}

/// Ask the council a question
pub async fn ask(config: &TuckerConfig, question: &str) -> Result<()> {
    let system = "You are a member of the Pantheon Council — a multi-model AI governance \
                  body operating under the Tucker Pendragon Protocols within the Aluminum OS \
                  ecosystem. Provide your expert perspective on the question.";

    let result = convene(config, question, Some(system)).await?;
    print_deliberation(&result);
    Ok(())
}

/// Show council member status
pub async fn status(config: &TuckerConfig) -> Result<()> {
    println!("\n┌─────────────────────────────────────────────────┐");
    println!("│          PANTHEON COUNCIL — STATUS               │");
    println!("├─────────────────────────────────────────────────┤");

    for member in &config.council.members {
        let status_icon = if member.enabled { "●" } else { "○" };
        let api_ok = match member.provider.as_str() {
            "openai" => config.api_keys.openai.is_some(),
            "google" => config.api_keys.gemini.is_some(),
            "anthropic" => config.api_keys.anthropic.is_some(),
            "deepseek" => config.api_keys.deepseek.is_some(),
            "xai" => config.api_keys.xai.is_some(),
            _ => false,
        };
        let key_status = if api_ok { "KEY ✓" } else { "KEY ✗" };

        println!("│ {} {:<12} │ {:<15} │ w={:.1} │ {} │",
            status_icon, member.name, member.model, member.weight, key_status
        );
    }

    println!("├─────────────────────────────────────────────────┤");
    println!("│ Quorum: {}/{}  │  Synthesis: {:<15}   │",
        config.council.quorum,
        config.council.members.iter().filter(|m| m.enabled).count(),
        config.council.synthesis_model
    );
    println!("│ Timeout: {}s                                    │", config.council.timeout_secs);
    println!("└─────────────────────────────────────────────────┘");

    Ok(())
}

/// Configure council (placeholder for interactive config)
pub async fn configure(_config: &TuckerConfig) -> Result<()> {
    println!("Council configuration: edit ~/.tucker/config.toml");
    println!("Or set environment variables for API keys.");
    Ok(())
}

/// Pretty-print a deliberation result
fn print_deliberation(result: &Deliberation) {
    println!("\n╔══════════════════════════════════════════════════╗");
    println!("║          PANTHEON COUNCIL DELIBERATION            ║");
    println!("╠══════════════════════════════════════════════════╣");
    println!("║ Question: {}...", &result.question[..result.question.len().min(40)]);
    println!("║ Quorum: {} │ Responses: {} │ Time: {}ms",
        if result.quorum_met { "MET" } else { "NOT MET" },
        result.responses.len(),
        result.total_latency_ms
    );
    println!("╠══════════════════════════════════════════════════╣");

    for resp in &result.responses {
        println!("║");
        println!("║ ┌── {} ({}) — {}ms, w={:.1}", resp.member, resp.provider, resp.latency_ms, resp.weight);
        for line in resp.content.lines().take(10) {
            println!("║ │ {}", line);
        }
        if resp.content.lines().count() > 10 {
            println!("║ │ ... ({} more lines)", resp.content.lines().count() - 10);
        }
        println!("║ └──");
    }

    println!("║");
    println!("╠══════════════════════════════════════════════════╣");
    println!("║                   SYNTHESIS                       ║");
    println!("╠══════════════════════════════════════════════════╣");
    for line in result.synthesis.lines() {
        println!("║ {}", line);
    }
    println!("╚══════════════════════════════════════════════════╝");
}
