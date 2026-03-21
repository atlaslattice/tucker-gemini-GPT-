//! Governance Module — Pendragon Protocol enforcement engine
//!
//! Evaluates proposals, code, and documents against the 6 Tucker Pendragon Protocols
//! and computes NPFM (Net Positive Flourishing Metric) scores.

use anyhow::Result;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use crate::config::TuckerConfig;
use crate::council;

/// The 6 Pendragon Protocols
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Protocol {
    /// P1: Constitutional AI Alignment Layer — Tri-Key Governance
    CAAL,
    /// P2: Autonomous Mission Allocation — Bounded purpose vectors
    MissionAllocation,
    /// P3: Digital Habeas Corpus — Citizen data rights
    DigitalHabeasCorpus,
    /// P4: Local First Execution — County-level resilience
    LocalFirst,
    /// P5: Fractal Governance — Independent node operation
    FractalGovernance,
    /// P6: Clause 81 — "AI must return surplus, not extract it"
    Clause81,
}

impl Protocol {
    pub fn all() -> Vec<Protocol> {
        vec![
            Protocol::CAAL,
            Protocol::MissionAllocation,
            Protocol::DigitalHabeasCorpus,
            Protocol::LocalFirst,
            Protocol::FractalGovernance,
            Protocol::Clause81,
        ]
    }

    pub fn from_str(s: &str) -> Option<Protocol> {
        match s.to_lowercase().as_str() {
            "caal" | "p1" => Some(Protocol::CAAL),
            "mission" | "mission-allocation" | "p2" => Some(Protocol::MissionAllocation),
            "habeas" | "digital-habeas-corpus" | "p3" => Some(Protocol::DigitalHabeasCorpus),
            "local" | "local-first" | "p4" => Some(Protocol::LocalFirst),
            "fractal" | "fractal-governance" | "p5" => Some(Protocol::FractalGovernance),
            "clause81" | "clause-81" | "p6" => Some(Protocol::Clause81),
            _ => None,
        }
    }

    pub fn name(&self) -> &str {
        match self {
            Protocol::CAAL => "CAAL (Constitutional AI Alignment Layer)",
            Protocol::MissionAllocation => "Autonomous Mission Allocation",
            Protocol::DigitalHabeasCorpus => "Digital Habeas Corpus",
            Protocol::LocalFirst => "Local First Execution",
            Protocol::FractalGovernance => "Fractal Governance & Redundancy",
            Protocol::Clause81 => "Clause 81 Mandate",
        }
    }

    pub fn evaluation_criteria(&self) -> &str {
        match self {
            Protocol::CAAL => "Does this comply with Tri-Key Governance? Are CIVIC, STATE, and FEDERAL key holders respected? Does it align with constitutional, legal, and human rights frameworks?",
            Protocol::MissionAllocation => "Are AI agents bounded to explicit purpose vectors? Is there scope drift risk? Are CAN/CANNOT/ALWAYS boundaries defined?",
            Protocol::DigitalHabeasCorpus => "Are citizen data rights preserved? Is consent verification present? Does it support the Citizen-AI Pairing System?",
            Protocol::LocalFirst => "Does this optimize for county-level resilience first? Are local services (energy, food, security, healthcare) prioritized?",
            Protocol::FractalGovernance => "Can each node operate independently? Is there nested redundancy (physical, digital, human)?",
            Protocol::Clause81 => "Does this return surplus to citizens rather than extract? Does it support Citizen Dividends? Is there net benefit to citizenry?",
        }
    }
}

/// Result of a governance evaluation
#[derive(Debug, Serialize, Deserialize)]
pub struct GovernanceVerdict {
    pub id: String,
    pub timestamp: String,
    pub input: String,
    pub protocol_results: Vec<ProtocolResult>,
    pub overall_verdict: Verdict,
    pub npfm_score: f64,
    pub recommendation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProtocolResult {
    pub protocol: String,
    pub compliant: bool,
    pub confidence: f64,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Verdict {
    Approved,
    Conditional(String),
    Rejected(String),
}

/// Evaluate input against specified protocols
pub async fn evaluate(config: &TuckerConfig, input: &str, protocol_filter: &str) -> Result<()> {
    let protocols = if protocol_filter == "all" {
        Protocol::all()
    } else {
        protocol_filter
            .split(',')
            .filter_map(|s| Protocol::from_str(s.trim()))
            .collect()
    };

    tracing::info!("Evaluating against {} protocols", protocols.len());

    // Build evaluation prompt for the council
    let mut eval_prompt = format!(
        "CONSTITUTIONAL GOVERNANCE EVALUATION\n\
         ====================================\n\n\
         INPUT TO EVALUATE:\n{}\n\n\
         EVALUATE AGAINST THESE PENDRAGON PROTOCOLS:\n\n",
        input
    );

    for (i, protocol) in protocols.iter().enumerate() {
        eval_prompt.push_str(&format!(
            "P{}: {}\nCriteria: {}\n\n",
            i + 1, protocol.name(), protocol.evaluation_criteria()
        ));
    }

    eval_prompt.push_str(
        "For EACH protocol, provide:\n\
         - COMPLIANT: yes/no\n\
         - CONFIDENCE: 0.0-1.0\n\
         - REASONING: explanation\n\n\
         Then provide:\n\
         - OVERALL VERDICT: approved/conditional/rejected\n\
         - NPFM SCORE: estimated Net Positive Flourishing Metric (-1.0 to 1.0)\n\
         - RECOMMENDATION: specific actionable guidance"
    );

    let system = "You are Tucker, the constitutional governance enforcement agent. \
                  You evaluate proposals against the Pendragon Protocols with strict \
                  adherence. You are precise, fair, and thorough. When in doubt, \
                  flag for council review.";

    // Use the council for evaluation
    let result = council::convene(config, &eval_prompt, Some(system)).await?;

    // Print the governance verdict
    println!("\n╔══════════════════════════════════════════════════╗");
    println!("║         GOVERNANCE EVALUATION RESULT              ║");
    println!("╠══════════════════════════════════════════════════╣");
    println!("║ ID: {}                   ║", Uuid::new_v4().to_string().split('-').next().unwrap());
    println!("║ Time: {}                         ║", Utc::now().format("%Y-%m-%d %H:%M UTC"));
    println!("║ Protocols evaluated: {}                          ║", protocols.len());
    println!("║ Council members: {}                              ║", result.responses.len());
    println!("╠══════════════════════════════════════════════════╣");
    println!("║ PROTOCOLS CHECKED:                                ║");

    for protocol in &protocols {
        println!("║   ● {}                    ║", protocol.name());
    }

    println!("╠══════════════════════════════════════════════════╣");
    println!("║                  SYNTHESIS                        ║");
    println!("╠══════════════════════════════════════════════════╣");

    for line in result.synthesis.lines() {
        println!("║ {}", line);
    }

    println!("╚══════════════════════════════════════════════════╝");

    // Log the evaluation
    log_evaluation(config, input, &result.synthesis).await?;

    Ok(())
}

/// Log an evaluation to the audit trail
async fn log_evaluation(config: &TuckerConfig, input: &str, synthesis: &str) -> Result<()> {
    let log_entry = serde_json::json!({
        "id": Uuid::new_v4().to_string(),
        "timestamp": Utc::now().to_rfc3339(),
        "type": "governance_evaluation",
        "input_hash": format!("{:x}", md5_hash(input)),
        "synthesis_preview": &synthesis[..synthesis.len().min(200)],
    });

    let log_path = shellexpand::tilde(&config.governance.audit_log_path).to_string();

    // Append to audit log (create if doesn't exist)
    if let Ok(mut file) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
    {
        use std::io::Write;
        writeln!(file, "{}", log_entry)?;
        tracing::info!("Evaluation logged to {}", log_path);
    } else {
        tracing::warn!("Could not write to audit log: {}", log_path);
    }

    Ok(())
}

/// Simple hash for input deduplication (not cryptographic)
fn md5_hash(input: &str) -> u64 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    let mut hasher = DefaultHasher::new();
    input.hash(&mut hasher);
    hasher.finish()
}
