//! Synthesis Module — Combines council responses into unified output
//!
//! Claude serves as the default synthesis chair, weighting responses
//! by member weight and producing a coherent governance recommendation.

use anyhow::Result;
use crate::config::TuckerConfig;
use super::{CouncilResponse, models};

pub struct Synthesizer {
    adapter: models::UnifiedAdapter,
    model: String,
}

impl Synthesizer {
    pub fn new(config: &TuckerConfig) -> Result<Self> {
        // Find the synthesis model configuration
        let (provider, model) = match config.council.synthesis_model.as_str() {
            "claude" => ("anthropic", "claude-sonnet-4-6"),
            "gemini" => ("google", "gemini-2.5-flash"),
            "gpt" => ("openai", "gpt-4o"),
            other => {
                // Try to find it as a council member name
                if let Some(member) = config.council.members.iter().find(|m| m.name.to_lowercase() == other) {
                    (member.provider.as_str(), member.model.as_str())
                } else {
                    ("anthropic", "claude-sonnet-4-6") // default fallback
                }
            }
        };

        let adapter = models::get_adapter(provider, config)?;
        Ok(Self {
            adapter,
            model: model.to_string(),
        })
    }

    /// Synthesize multiple council responses into a unified output
    pub async fn synthesize(
        &self,
        original_question: &str,
        responses: &[CouncilResponse],
    ) -> Result<String> {
        let mut synthesis_prompt = format!(
            "You are the Synthesis Chair of the Pantheon Council, operating under the \
             Tucker Pendragon Protocols. Your role is to produce a single, authoritative \
             synthesis from multiple AI council members' responses.\n\n\
             ORIGINAL QUESTION/TASK:\n{}\n\n\
             COUNCIL RESPONSES:\n",
            original_question
        );

        for resp in responses {
            synthesis_prompt.push_str(&format!(
                "\n--- {} ({}) [weight: {:.1}] ---\n{}\n",
                resp.member, resp.provider, resp.weight, resp.content
            ));
        }

        synthesis_prompt.push_str(&format!(
            "\n\nProduce a synthesis that:\n\
             1. Weights responses by member weight (higher weight = more authority)\n\
             2. Identifies consensus points across members\n\
             3. Flags disagreements and explains which position is stronger\n\
             4. Ensures constitutional compliance (all 6 Pendragon Protocols)\n\
             5. Provides a clear recommendation with confidence score (0-10)\n\
             6. Notes any NPFM (Net Positive Flourishing) implications\n\n\
             Format as:\n\
             CONSENSUS: [key agreement points]\n\
             DIVERGENCE: [disagreements and resolution]\n\
             RECOMMENDATION: [final recommendation]\n\
             CONFIDENCE: [score/10]\n\
             CONSTITUTIONAL STATUS: [compliant/concerns/violation]"
        ));

        let system = "You are the Synthesis Chair of the Pantheon Council. \
                      You produce weighted, authoritative syntheses from multiple AI perspectives. \
                      You operate under the Tucker Pendragon Protocols and ensure all outputs \
                      comply with constitutional governance requirements.";

        self.adapter.generate(&self.model, &synthesis_prompt, Some(system)).await
    }
}
