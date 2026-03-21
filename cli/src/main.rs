//! Tucker CLI — Constitutional AI Governance Agent
//!
//! Standalone binary that also registers as a UWS subcommand.
//! Council mode orchestrates GPT-4o, Gemini 2.5, Claude, DeepSeek, and Grok.

use anyhow::Result;
use clap::{Parser, Subcommand};
use tracing_subscriber::EnvFilter;

mod chat;
mod council;
mod governance;
mod sync;
mod uws;

pub mod config;

#[derive(Parser)]
#[command(
    name = "tucker",
    version = "4.0.0-alpha",
    about = "Tucker — Constitutional AI Governance CLI\nPendragon Protocol enforcement with 5-model council mode.",
    long_about = "Tucker V4 is a constitutional compliance enforcement agent that operates as both \
    a standalone CLI and a UWS subcommand. It orchestrates a 5-model council \
    (GPT-4o, Gemini 2.5, Claude, DeepSeek, Grok) for governance decisions and \
    maintains autonomous sync with Aluminum OS constitutional documents."
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Config file path (default: ~/.tucker/config.toml)
    #[arg(short, long, env = "TUCKER_CONFIG")]
    config: Option<String>,

    /// Verbose output
    #[arg(short, long, default_value_t = false)]
    verbose: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Start interactive chat with Tucker (council-aware)
    Chat {
        /// Enable council mode (all models deliberate)
        #[arg(short = 'C', long, default_value_t = false)]
        council: bool,

        /// Specific model to use in solo mode
        #[arg(short, long, default_value = "gemini")]
        model: String,

        /// Topic or context for the session
        #[arg(short, long)]
        topic: Option<String>,
    },

    /// Convene the full council for a governance review
    Council {
        #[command(subcommand)]
        action: CouncilAction,
    },

    /// Run constitutional compliance check
    Govern {
        /// Path to proposal or document to evaluate
        #[arg(short, long)]
        input: String,

        /// Protocol to enforce (all, caal, clause81, habeas, local-first, fractal, mission)
        #[arg(short, long, default_value = "all")]
        protocol: String,
    },

    /// Sync constitutional documents and protocol updates
    Sync {
        #[command(subcommand)]
        action: SyncAction,
    },

    /// UWS integration management
    Uws {
        #[command(subcommand)]
        action: UwsAction,
    },

    /// Show system status and configuration
    Status,

    /// Initialize Tucker configuration
    Init,
}

#[derive(Subcommand)]
enum CouncilAction {
    /// Convene council to review content
    Review {
        /// URL or file path to review
        #[arg(short, long)]
        target: String,

        /// Review type: code, architecture, governance, general
        #[arg(short, long, default_value = "general")]
        review_type: String,
    },

    /// Ask the council a question
    Ask {
        /// The question to deliberate on
        question: String,
    },

    /// Show council member status
    Status,

    /// Configure council members and weights
    Config,
}

#[derive(Subcommand)]
enum SyncAction {
    /// Pull latest from all sources (GitHub, Notion)
    Pull,

    /// Push local changes to GitHub
    Push,

    /// Show sync status
    Status,

    /// Run full sync cycle (pull + validate + push)
    Full,

    /// Configure sync schedule
    Schedule {
        /// Cron expression or preset (daily, weekly, hourly)
        #[arg(short, long, default_value = "daily")]
        interval: String,
    },
}

#[derive(Subcommand)]
enum UwsAction {
    /// Register Tucker as a UWS subcommand
    Register,

    /// Unregister from UWS
    Unregister,

    /// Show UWS integration status
    Status,

    /// Bridge mode — run as UWS subprocess
    Bridge {
        /// UWS command to handle
        command: Vec<String>,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Initialize logging
    let filter = if cli.verbose {
        EnvFilter::new("tucker=debug,tucker_lib=debug")
    } else {
        EnvFilter::new("tucker=info")
    };

    tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(false)
        .init();

    tracing::info!("PENDRAGON OS v4.0 — Tucker Constitutional Governance CLI");

    // Load configuration
    let config = config::load_config(cli.config.as_deref())?;

    match cli.command {
        Commands::Chat { council, model, topic } => {
            if council {
                tracing::info!("Council mode activated — all models will deliberate");
                chat::interactive_council_chat(&config, topic.as_deref()).await?;
            } else {
                tracing::info!("Solo chat with model: {}", model);
                chat::interactive_chat(&config, &model, topic.as_deref()).await?;
            }
        }

        Commands::Council { action } => match action {
            CouncilAction::Review { target, review_type } => {
                tracing::info!("Council review: {} (type: {})", target, review_type);
                council::review(&config, &target, &review_type).await?;
            }
            CouncilAction::Ask { question } => {
                tracing::info!("Council deliberation requested");
                council::ask(&config, &question).await?;
            }
            CouncilAction::Status => {
                council::status(&config).await?;
            }
            CouncilAction::Config => {
                council::configure(&config).await?;
            }
        },

        Commands::Govern { input, protocol } => {
            tracing::info!("Governance check: {} (protocol: {})", input, protocol);
            governance::evaluate(&config, &input, &protocol).await?;
        }

        Commands::Sync { action } => match action {
            SyncAction::Pull => sync::pull(&config).await?,
            SyncAction::Push => sync::push(&config).await?,
            SyncAction::Status => sync::status(&config).await?,
            SyncAction::Full => sync::full_cycle(&config).await?,
            SyncAction::Schedule { interval } => sync::schedule(&config, &interval).await?,
        },

        Commands::Uws { action } => match action {
            UwsAction::Register => uws::register(&config).await?,
            UwsAction::Unregister => uws::unregister(&config).await?,
            UwsAction::Status => uws::status(&config).await?,
            UwsAction::Bridge { command } => uws::bridge(&config, &command).await?,
        },

        Commands::Status => {
            print_status(&config).await?;
        }

        Commands::Init => {
            config::init_config().await?;
        }
    }

    Ok(())
}

async fn print_status(config: &config::TuckerConfig) -> Result<()> {
    println!("╔══════════════════════════════════════════════╗");
    println!("║  TUCKER V4 — Constitutional Governance CLI   ║");
    println!("║  PendragonOS Ring 2 Agent Runtime             ║");
    println!("╠══════════════════════════════════════════════╣");
    println!("║                                              ║");
    println!("║  Version:    4.0.0-alpha                     ║");
    println!("║  Mode:       Standalone + UWS Plugin         ║");
    println!("║  Council:    5 models configured             ║");
    println!("║  Protocols:  6 active (Pendragon)            ║");
    println!("║  Sync:       {} ║",
        if config.sync.enabled { "Enabled (scheduled)              " }
        else { "Disabled                         " }
    );
    println!("║  UWS:        {} ║",
        if config.uws.registered { "Registered                       " }
        else { "Not registered                   " }
    );
    println!("║                                              ║");
    println!("╠══════════════════════════════════════════════╣");
    println!("║  Council Members:                            ║");

    for member in &config.council.members {
        let status = if member.enabled { "●" } else { "○" };
        println!("║    {} {:<12} ({:<10}) w={:.1}       ║",
            status, member.name, member.provider, member.weight
        );
    }

    println!("║                                              ║");
    println!("╠══════════════════════════════════════════════╣");
    println!("║  Pendragon Protocols:                        ║");
    println!("║    ● P1: CAAL (Tri-Key Governance)           ║");
    println!("║    ● P2: Autonomous Mission Allocation       ║");
    println!("║    ● P3: Digital Habeas Corpus               ║");
    println!("║    ● P4: Local First Execution               ║");
    println!("║    ● P5: Fractal Governance & Redundancy     ║");
    println!("║    ● P6: Clause 81 Mandate                   ║");
    println!("║                                              ║");
    println!("╚══════════════════════════════════════════════╝");

    Ok(())
}
