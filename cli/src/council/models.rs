//! Model Adapters — Unified interface for all council members
//!
//! Each adapter normalizes the API interface so the council
//! orchestrator can treat all models uniformly.

use anyhow::{bail, Result};
use crate::config::TuckerConfig;
use reqwest::Client;
use serde_json::json;

/// Trait for all model adapters
#[async_trait::async_trait]
pub trait ModelAdapter: Send + Sync {
    async fn generate(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String>;
    fn provider_name(&self) -> &str;
}

// We use a simple trait-object approach without async_trait for now
// by returning boxed futures. For simplicity, we use a unified adapter.

/// Unified model adapter that handles all providers via HTTP
pub struct UnifiedAdapter {
    client: Client,
    provider: String,
    api_key: Option<String>,
}

impl UnifiedAdapter {
    pub fn new(provider: &str, api_key: Option<String>) -> Self {
        Self {
            client: Client::new(),
            provider: provider.to_string(),
            api_key,
        }
    }

    pub async fn generate(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String> {
        match self.provider.as_str() {
            "openai" => self.generate_openai(model, prompt, system).await,
            "google" => self.generate_gemini(model, prompt, system).await,
            "anthropic" => self.generate_anthropic(model, prompt, system).await,
            "deepseek" => self.generate_deepseek(model, prompt, system).await,
            "xai" => self.generate_xai(model, prompt, system).await,
            _ => bail!("Unknown provider: {}", self.provider),
        }
    }

    /// OpenAI / GPT-4o adapter
    async fn generate_openai(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String> {
        let api_key = self.api_key.as_deref()
            .ok_or_else(|| anyhow::anyhow!("OPENAI_API_KEY not set"))?;

        let mut messages = Vec::new();
        if let Some(sys) = system {
            messages.push(json!({"role": "system", "content": sys}));
        }
        messages.push(json!({"role": "user", "content": prompt}));

        let response = self.client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&json!({
                "model": model,
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.7,
            }))
            .send()
            .await?;

        let body: serde_json::Value = response.json().await?;
        let content = body["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();

        Ok(content)
    }

    /// Google Gemini adapter
    async fn generate_gemini(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String> {
        let api_key = self.api_key.as_deref()
            .ok_or_else(|| anyhow::anyhow!("GEMINI_API_KEY not set"))?;

        let full_prompt = match system {
            Some(sys) => format!("{}\n\n{}", sys, prompt),
            None => prompt.to_string(),
        };

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            model, api_key
        );

        let response = self.client
            .post(&url)
            .json(&json!({
                "contents": [{"parts": [{"text": full_prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,
                }
            }))
            .send()
            .await?;

        let body: serde_json::Value = response.json().await?;
        let content = body["candidates"][0]["content"]["parts"][0]["text"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();

        Ok(content)
    }

    /// Anthropic Claude adapter
    async fn generate_anthropic(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String> {
        let api_key = self.api_key.as_deref()
            .ok_or_else(|| anyhow::anyhow!("ANTHROPIC_API_KEY not set"))?;

        let mut body = json!({
            "model": model,
            "max_tokens": 4096,
            "messages": [{"role": "user", "content": prompt}],
        });

        if let Some(sys) = system {
            body["system"] = json!(sys);
        }

        let response = self.client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&body)
            .send()
            .await?;

        let resp_body: serde_json::Value = response.json().await?;
        let content = resp_body["content"][0]["text"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();

        Ok(content)
    }

    /// DeepSeek adapter (OpenAI-compatible API)
    async fn generate_deepseek(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String> {
        let api_key = self.api_key.as_deref()
            .ok_or_else(|| anyhow::anyhow!("DEEPSEEK_API_KEY not set"))?;

        let mut messages = Vec::new();
        if let Some(sys) = system {
            messages.push(json!({"role": "system", "content": sys}));
        }
        messages.push(json!({"role": "user", "content": prompt}));

        let response = self.client
            .post("https://api.deepseek.com/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&json!({
                "model": model,
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.7,
            }))
            .send()
            .await?;

        let body: serde_json::Value = response.json().await?;
        let content = body["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();

        Ok(content)
    }

    /// xAI Grok adapter (OpenAI-compatible API)
    async fn generate_xai(&self, model: &str, prompt: &str, system: Option<&str>) -> Result<String> {
        let api_key = self.api_key.as_deref()
            .ok_or_else(|| anyhow::anyhow!("XAI_API_KEY not set"))?;

        let mut messages = Vec::new();
        if let Some(sys) = system {
            messages.push(json!({"role": "system", "content": sys}));
        }
        messages.push(json!({"role": "user", "content": prompt}));

        let response = self.client
            .post("https://api.x.ai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&json!({
                "model": model,
                "messages": messages,
                "max_tokens": 4096,
                "temperature": 0.7,
            }))
            .send()
            .await?;

        let body: serde_json::Value = response.json().await?;
        let content = body["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("(no response)")
            .to_string();

        Ok(content)
    }
}

/// Factory function to get the right adapter for a provider
pub fn get_adapter(provider: &str, config: &TuckerConfig) -> Result<UnifiedAdapter> {
    let api_key = match provider {
        "openai" => config.api_keys.openai.clone(),
        "google" => config.api_keys.gemini.clone(),
        "anthropic" => config.api_keys.anthropic.clone(),
        "deepseek" => config.api_keys.deepseek.clone(),
        "xai" => config.api_keys.xai.clone(),
        _ => bail!("Unknown provider: {}", provider),
    };

    Ok(UnifiedAdapter::new(provider, api_key))
}