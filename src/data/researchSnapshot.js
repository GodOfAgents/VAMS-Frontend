const AUDIT_SOURCE_DATE = '2026-07-12'

const arxiv = (id) => `https://arxiv.org/abs/${id}`

const reference = ({ family, title, year, paperId = null, externalUrl = null, researchSummary, vamsRelevance, implementationSurface, maturity = 'partial', evidenceTier = 'research', caveat = 'Research alignment does not prove implementation, deployment, or live operation.' }) => ({
  id: `${family}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  family,
  title,
  year,
  paperId,
  externalUrl,
  researchSummary,
  vamsRelevance,
  implementationSurface,
  maturity,
  evidenceTier,
  sourceDocument: 'audit.md',
  sourceAnchor: `Academic References & Research Foundations · ${family}`,
  sourceDate: AUDIT_SOURCE_DATE,
  caveat,
})

export const researchFamilies = [
  { id: 'R1', title: 'Agentic economy and intelligent delegation', description: 'Scoped authority, agent principals, adaptive routing, and resilient coordination.' },
  { id: 'R2', title: 'Verifiable computation and oracle security', description: 'Randomness, inference proofs, MEV resistance, and hybrid TEE/ZK verification.' },
  { id: 'R3', title: 'Data availability and modular architecture', description: 'Sampling, light-client verification, modular composition, and sidecar scheduling.' },
  { id: 'R4', title: 'Trust, reputation, and Sybil resistance', description: 'Stake-backed discovery, reputation decay, accountability, and permission tiers.' },
  { id: 'R5', title: 'Intelligence and activation-space steering', description: 'Lifelong learning, skill discovery, steering vectors, and anomaly detection.' },
  { id: 'R6', title: 'Account abstraction and confidential computing', description: 'Session keys, TEE abstraction, and root-identity-bound attestations.' },
  { id: 'R7', title: 'Token economics and sustainable DePIN', description: 'Regional emissions, agentic economic simulation, and insurance design.' },
  { id: 'R8', title: 'Cross-chain security and formal verification', description: 'eUTXO properties, bridge isolation, and cross-chain attack detection.' },
  { id: 'R9', title: 'Durable execution and fault tolerance', description: 'Deterministic replay, checkpoints, and crash-recoverable agent workflows.' },
  { id: 'R10', title: 'World-state fidelity and SkillOps hardening', description: 'False-progress telemetry, signed skills, quarantine, and bounded mutation.' },
]

export const researchReferences = [
  reference({ family: 'R1', title: 'Intelligent AI Delegation', year: 2026, paperId: 'arXiv:2602.11865', externalUrl: arxiv('2602.11865'), researchSummary: 'A five-pillar framework for delegating work to intelligent systems with capability assessment, transparency, coordination, and resilience.', vamsRelevance: 'Maps to CLR routing, TrustTier scoring, DA-anchored audit logs, Service Block composition, and transport fallback.', implementationSurface: 'neuron/clr_router.py; ServiceBlockRegistry; routing contracts', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R1', title: 'The Agent Economy', year: 2025, researchSummary: 'Frames autonomous agents as economic principals with identity, custody, and service relationships.', vamsRelevance: 'Supports VAMS agent identity, session-key scoping, and verifiable service composition.', implementationSurface: 'Agent registry; Sequence session keys; composer', maturity: 'partial' }),
  reference({ family: 'R1', title: 'Web 4.0 and Web 3.0 Intelligent Network Infrastructure', year: 2025, researchSummary: 'Reviews the infrastructure gap between programmable blockchains and intelligent, agent-mediated networks.', vamsRelevance: 'Provides the Web4 framing for treating agents as principals rather than transaction-signing tools.', implementationSurface: 'Protocol thesis; dual-host architecture', maturity: 'planned' }),
  reference({ family: 'R1', title: 'AGNT2: Agent-Native Execution Layer', year: 2026, researchSummary: 'Studies execution infrastructure optimized for agent interaction patterns and throughput needs.', vamsRelevance: 'Informs VAMS interaction-optimized routing across velocity and institutional execution environments.', implementationSurface: 'CLR routing strategy; multi-chain adapters', maturity: 'planned' }),
  reference({ family: 'R2', title: 'Commit-Reveal²', year: 2025, paperId: 'arXiv:2504.03936', externalUrl: arxiv('2504.03936'), researchSummary: 'Uses randomized reveal ordering to strengthen commit-reveal randomness beacons.', vamsRelevance: 'Directly informs the CommitRevealOracle design and deadline-safe fallback behavior.', implementationSurface: 'contracts/src/oracle/CommitRevealOracle.sol', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R2', title: 'MEV-ACE', year: 2026, researchSummary: 'Explores proposer-controlled ordering with verifiable-delay randomness for MEV resistance.', vamsRelevance: 'Informs batch settlement ordering and the C01 signature-verification remediation.', implementationSurface: 'BatchSettlement.sol; settlement verification tests', maturity: 'partial' }),
  reference({ family: 'R2', title: 'zkLLM', year: 2024, researchSummary: 'Demonstrates zero-knowledge verification approaches for large-language-model inference.', vamsRelevance: 'Defines a future path for proving inference without disclosing the model or private inputs.', implementationSurface: 'TEE/ZK trust plugins; delivery-proof boundary', maturity: 'planned' }),
  reference({ family: 'R2', title: 'ZKML Survey', year: 2025, researchSummary: 'Surveys zero-knowledge machine-learning schemes and their practical trade-offs.', vamsRelevance: 'Guides the hybrid TEE plus ZK verification roadmap.', implementationSurface: 'Trust plugin roadmap; proof policy', maturity: 'planned' }),
  reference({ family: 'R3', title: 'Sampling by Coding', year: 2025, researchSummary: 'Studies data-availability sampling with random linear network coding.', vamsRelevance: 'Informs the Multi-DA Router split between audit logs and state roots.', implementationSurface: 'neuron/da; PerformanceAnchor; Gateway DA audit', maturity: 'partial' }),
  reference({ family: 'R3', title: 'Polynomial Multiproofs for DAS Light Clients', year: 2025, researchSummary: 'Reduces verification overhead for probabilistic data-availability sampling.', vamsRelevance: 'Provides a research basis for efficient Sentinel sampling and light-client verification.', implementationSurface: 'Sentinel DA verification roadmap', maturity: 'planned' }),
  reference({ family: 'R3', title: 'Swarmchestrate', year: 2025, researchSummary: 'Explores self-organizing modular orchestration with decoupled lifecycle management.', vamsRelevance: 'Validates the ICN-inspired split into independent VAMS logic packages.', implementationSurface: 'Modular package architecture; ServiceBlockRegistry', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R3', title: 'Sidecar-Based Scheduling in Service Meshes', year: 2024, researchSummary: 'Examines sidecar scheduling patterns for decentralized service routing.', vamsRelevance: 'Informs Gateway routing without a centralized control plane.', implementationSurface: 'gateway/server.py; provider adapters', maturity: 'partial' }),
  reference({ family: 'R4', title: 'AgentReputation', year: 2025, researchSummary: 'Presents layered reputation models that separate task outcomes from reputation persistence.', vamsRelevance: 'Maps to VAMSTrustAggregator separation of execution, computation, and on-chain persistence.', implementationSurface: 'contracts/src/trust/VAMSTrustAggregator.sol; neuron/trust.py', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R4', title: 'AetherWeave', year: 2026, researchSummary: 'Studies stake-backed peer discovery and publicly verifiable misbehavior proofs.', vamsRelevance: 'Informs SLA enforcement, bonded participation, and slashing evidence.', implementationSurface: 'SLAEnforcer.sol; Sentinel challenge loop', maturity: 'partial' }),
  reference({ family: 'R4', title: 'MeritRank', year: 2025, researchSummary: 'Explores Sybil-tolerant feedback with transitivity and temporal decay.', vamsRelevance: 'Informs VAMS Trust Score tiers and epoch-based reputation decay.', implementationSurface: 'Trust aggregator; reputation scoring', maturity: 'partial' }),
  reference({ family: 'R4', title: 'Trust and Reputation as a Service', year: 2024, researchSummary: 'Examines objective reputation services for decentralized marketplaces.', vamsRelevance: 'Supports contract-based reputation derived from SLA compliance outcomes.', implementationSurface: 'Trust aggregator; marketplace policy', maturity: 'planned' }),
  reference({ family: 'R5', title: 'AutoSkill', year: 2026, researchSummary: 'Studies experience-driven lifelong skill learning with foreground and background loops.', vamsRelevance: 'Provides the theoretical basis for VAMS AUTOSKILL skill crystallization.', implementationSurface: 'neuron/intelligence; skill discovery tests', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R5', title: 'Activation Steering Vectors', year: 2025, researchSummary: 'Uses residual-stream decompositions to discover and steer semantic directions.', vamsRelevance: 'Informs IncrementalPCA skill discovery and bounded steering.', implementationSurface: 'skill_discovery.py; steering_engine.py', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R5', title: 'Language Guided Skill Discovery', year: 2024, researchSummary: 'Studies autonomous task decomposition and semantic diversity in discovered skills.', vamsRelevance: 'Supports VAMS skill diversity objectives and decomposition heuristics.', implementationSurface: 'Skill discovery; composer requirements', maturity: 'partial' }),
  reference({ family: 'R5', title: 'Mahalanobis Distance for OOD Detection', year: 2024, researchSummary: 'Uses distributional distance to identify out-of-distribution neural activity.', vamsRelevance: 'Provides the basis for activation anomaly detection and adversarial flags.', implementationSurface: 'anomaly_detector.py; Sentinel telemetry', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R6', title: 'ERC-4337 Systematization', year: 2024, researchSummary: 'Surveys account abstraction and UserOperation execution at ecosystem scale.', vamsRelevance: 'Informs TrustTier-scoped session keys and agent wallet custody.', implementationSurface: 'sequence_wallet.py; session-key invariants', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R6', title: 'TEE Abstraction Layers', year: 2025, researchSummary: 'Studies abstractions across SGX, SEV, and CCA confidential-computing ecosystems.', vamsRelevance: 'Informs the multi-TEE strategy and root-EOA attestation binding.', implementationSurface: 'tee_plugin.py; phala_tee.py', maturity: 'partial' }),
  reference({ family: 'R6', title: 'Confidential Web3', year: 2024, researchSummary: 'Examines remote attestation for confidential off-chain verification.', vamsRelevance: 'Supports binding attestations to root identity rather than ephemeral session keys.', implementationSurface: 'TEE trust plugins; OMS identity boundary', maturity: 'partial' }),
  reference({ family: 'R7', title: 'DeTEcT', year: 2023, paperId: 'arXiv:2309.12330', externalUrl: arxiv('2309.12330'), researchSummary: 'Provides a framework for decentralized token economy design and stability controls.', vamsRelevance: 'Informs RegionAwareDEC emission controls and inflation bounds.', implementationSurface: 'RegionAwareDEC.sol; regional economics tests', maturity: 'implemented', evidenceTier: 'locally verified' }),
  reference({ family: 'R7', title: 'EconAgentic', year: 2025, paperId: 'arXiv:2508.21368', externalUrl: arxiv('2508.21368'), researchSummary: 'Uses agent-based simulation to stress-test token economic behavior.', vamsRelevance: 'Supports synthetic campaign testing for linked rewards, capacity capture, and wash returns.', implementationSurface: 'scripts/audit/economic_concentration.py', maturity: 'implemented', evidenceTier: 'locally verified' }),
  reference({ family: 'R7', title: 'Decentralized Insurance Tokenomics', year: 2025, researchSummary: 'Explores parametric triggers and stake-backed underwriting in decentralized insurance.', vamsRelevance: 'Informs the VAMS insurance fund and bounded yield policy.', implementationSurface: 'VAMSInsuranceFund.sol; yield manager', maturity: 'partial' }),
  reference({ family: 'R8', title: 'Blaster', year: 2026, researchSummary: 'Studies automated formal verification for Cardano validators at production scale.', vamsRelevance: 'Identifies target tooling for Aiken validator verification.', implementationSurface: 'cardano/validators; Aiken verification gates', maturity: 'planned' }),
  reference({ family: 'R8', title: 'Validity, Liquidity, Fidelity', year: 2025, researchSummary: 'Defines generalized eUTXO verification properties for Cardano systems.', vamsRelevance: 'Provides the security baseline for Cardano validator findings AK01–AK12.', implementationSurface: 'Cardano validators; conformance tests', maturity: 'partial' }),
  reference({ family: 'R8', title: 'Cross-Chain Bridge Security Taxonomy', year: 2024, researchSummary: 'Classifies common bridge failures and proof-separation risks.', vamsRelevance: 'Informs transport-swap fallback and distinct bridge-proof/payload-hash semantics.', implementationSurface: 'bridge_executor.py; VDSO settlement metadata', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R8', title: 'ConneX', year: 2025, researchSummary: 'Explores LLM-assisted cross-chain attack detection.', vamsRelevance: 'Identifies a future Sentinel monitoring integration.', implementationSurface: 'Sentinel cross-chain monitoring roadmap', maturity: 'planned' }),
  reference({ family: 'R9', title: 'DBOS', year: 2025, researchSummary: 'Presents a database-oriented operating system for durable execution.', vamsRelevance: 'Directly informs deterministic replay and checkpointed Neuron workflows.', implementationSurface: 'neuron/workflows.py; dbos_config.py', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R9', title: 'Durable Execution for AI Agent Reliability', year: 2025, researchSummary: 'Examines checkpointing and replay for nondeterministic agent workflows.', vamsRelevance: 'Validates the use of durable execution to recover agent progress.', implementationSurface: 'Neuron workflow engine; recovery paths', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R10', title: 'World-Model Collapse as a Phase Transition', year: 2026, paperId: 'arXiv:2606.31399', externalUrl: arxiv('2606.31399'), researchSummary: 'Studies how inaccurate internal world models produce false progress and invalid actions.', vamsRelevance: 'Informs fidelity telemetry before rewards or slashing use.', implementationSurface: 'world_state_fidelity.py; Sentinel telemetry', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R10', title: 'SoK: Agentic Skills — Beyond Tool Use', year: 2026, paperId: 'arXiv:2602.20867', externalUrl: arxiv('2602.20867'), researchSummary: 'Surveys agentic skills as governed, composable capabilities beyond simple tool calls.', vamsRelevance: 'Informs signed manifests, permission scopes, quarantine, and fail-closed provisioning.', implementationSurface: 'ServiceBlockRegistry; registry_client.py', maturity: 'implemented', evidenceTier: 'source implemented' }),
  reference({ family: 'R10', title: 'MUSE-Autoskill', year: 2026, paperId: 'arXiv:2605.27366', externalUrl: arxiv('2605.27366'), researchSummary: 'Frames self-evolving skills around creation, memory, management, and evaluation.', vamsRelevance: 'Supports treating skills as versioned, testable assets rather than unbounded self-mutation.', implementationSurface: 'SkillOps manifests; quarantine policy', maturity: 'partial' }),
]

export const architectureTimeline = [
  { id: 'v0.3.0', label: 'Monolithic foundation', detail: 'Five-layer baseline: DA, compute, logic, trust, and economics. Established durable execution, state anchoring, failover, request guarantees, and permanent memory.', status: 'historical', source: 'audit.md' },
  { id: 'v0.4.0', label: 'ICN-inspired modular split', detail: 'Decomposed the monolith into independently managed logic packages with Service Blocks, Sentinel enforcement, and regional emissions.', status: 'historical', source: 'audit.md' },
  { id: 'v0.5.0', label: 'AUTOSKILL intelligence layer', detail: 'Added skill discovery, activation steering, anomaly detection, and intelligence-layer validation.', status: 'historical', source: 'audit.md' },
  { id: 'v0.6.0', label: 'OMS integration baseline', detail: 'Added fail-closed institutional identity, session keys, Trails transport, insurance yield, and the historical 68-finding audit baseline.', status: 'historical baseline', source: 'audit.md' },
  { id: 'v0.7.0', label: 'Cognitive layer', detail: 'Added S-MMU memory hierarchy, SIRA retrieval, HORMA layout, HIPIF folding, EvoMem patches, and ProPlay planning.', status: 'additive', source: 'audit.md' },
  { id: 'v0.8.0', label: 'Cognitive/composer ceiling', detail: 'Added CHC Decagon profiles, 6-axis Composer scoring, dynamic weight normalization, enriched telemetry, and registry visualization.', status: 'current architecture', source: 'docs/team/ARCHITECTURE_v0-8-0.md' },
  { id: 'R10', label: 'World-state and SkillOps hardening', detail: 'Added fidelity telemetry, signed manifests, permission scopes, verifier quarantine, and fail-closed provisioning boundaries.', status: 'current addendum', source: 'audit.md' },
]

export const implementationMap = [
  { surface: 'Neuron runtime', families: ['R1', 'R5', 'R6', 'R9', 'R10'], maturity: 'implemented', evidenceTier: 'locally verified', note: 'Runtime modules and tests exist; live routes remain restricted by environment gates.' },
  { surface: 'Gateway', families: ['R3', 'R6', 'R10'], maturity: 'partial', evidenceTier: 'deployment pending', note: 'Security and provenance boundaries are implemented; live integration evidence remains required.' },
  { surface: 'Solidity contracts', families: ['R2', 'R4', 'R7', 'R8'], maturity: 'implemented', evidenceTier: 'locally verified', note: 'Local contract suites pass; exact-commit CI and independent deployment evidence remain gates.' },
  { surface: 'Cardano validators', families: ['R8'], maturity: 'partial', evidenceTier: 'locally verified', note: 'Aiken checks pass locally; transaction-level and deployment evidence remain required.' },
  { surface: 'Sentinel', families: ['R2', 'R4', 'R5', 'R8', 'R10'], maturity: 'partial', evidenceTier: 'locally verified', note: 'Challenge, anomaly, fidelity, and telemetry paths exist; live observation is not claimed.' },
  { surface: 'Composer and cognitive layer', families: ['R1', 'R5', 'R10'], maturity: 'implemented', evidenceTier: 'source implemented', note: 'CHC profiles and composer scoring are implemented; real node telemetry mapping still needs verification.' },
  { surface: 'Frontend registry', families: ['R3', 'R5', 'R10'], maturity: 'partial', evidenceTier: 'source implemented', note: 'Read-only, provenance-aware presentation; no wallet, economic, or deployment actions.' },
]

export const projectUpdates = [
  { id: 'unreleased', label: 'Unreleased', date: '2026-07-25', detail: 'Current public status and testnet readiness gates were reconciled against source-backed implementation reality.', surface: 'Repository status', evidenceTier: 'source implemented', source: 'REPO_STATUS_REPORT.md' },
  { id: 'v0.8.0', label: 'v0.8.0', date: '2026-06-23', detail: 'CHC cognitive profiles and 6-axis Composer scoring were added with dynamic weight normalization and enriched telemetry.', surface: 'Composer / cognitive layer', evidenceTier: 'source implemented', source: 'docs/CHANGELOG.md' },
  { id: 'v1.3.0-oms', label: 'v1.3.0-oms', date: '2026-05-06', detail: 'OMS identity, Trails transport, ERC-4337 session keys, Coinme rails, insurance yield, and stablecoin payout boundaries were added.', surface: 'Identity / economics', evidenceTier: 'source implemented', source: 'docs/CHANGELOG.md' },
  { id: 'v1.2.0-autoskill', label: 'v1.2.0-autoskill', date: '2026-04-29', detail: 'AUTOSKILL intelligence modules, activation steering, skill discovery, and anomaly detection were added.', surface: 'Intelligence layer', evidenceTier: 'source implemented', source: 'docs/CHANGELOG.md' },
  { id: 'v1.1.0-audit-remediated', label: 'v1.1.0-audit-remediated', date: '2026-04-26', detail: 'Security remediation sprints addressed the historical audit baseline and added explicit evidence controls.', surface: 'Security posture', evidenceTier: 'historical audit', source: 'docs/CHANGELOG.md' },
  { id: 'v1.0.0-icn', label: 'v1.0.0-icn', date: '2026-04-09', detail: 'The stack moved from a monolith to ICN-inspired modular packages with Service Blocks and Sentinel enforcement.', surface: 'Architecture', evidenceTier: 'historical design', source: 'docs/CHANGELOG.md' },
]

export const auditPosture = {
  historical: { label: 'Historical audit baseline', value: '68 / 68 findings resolved', detail: 'The v0.6.0 audit baseline is historical evidence, not current deployment proof.', source: 'audit.md' },
  current: { label: 'Current readiness', value: '3 implemented · 29 partial · 4 blocked · 0 verified', detail: 'The public-testnet candidate remains fail-closed until commit-bound CI, deployment, and independent evidence gates pass.', source: 'REPO_STATUS_REPORT.md' },
  gates: [
    ['Local verification', 'Implemented local test suites pass across the major protocol surfaces.', 'locally verified'],
    ['CI-bound evidence', 'Exact-commit CI reruns and security evidence remain required before release promotion.', 'verification pending'],
    ['Deployment evidence', 'Chain IDs, addresses, transactions, verification, and role ownership are still pending.', 'deployment pending'],
    ['Live observation', 'No public live deployment or live economic activity is claimed by this frontend.', 'not observed'],
  ],
}

export const strategyDocuments = [
  { title: 'Technical whitepaper', type: 'Design context', detail: 'Long-form architecture, tokenomics, security, governance, and roadmap material. Not deployment evidence.', path: 'docs/team/WHITEPAPER.md' },
  { title: 'Market analysis', type: 'Strategy context', detail: 'Market sizing, target segments, competitors, and go-to-market hypotheses. Not a verified market forecast.', path: 'docs/team/MARKET_ANALYSIS.md' },
  { title: 'Pitch deck', type: 'Historical context', detail: 'Partnership and narrative material with historical claims that must not override source-backed status.', path: 'docs/team/PITCH_DECK.md' },
  { title: 'Tokenomics and economic design', type: 'Design context', detail: 'Economic mechanisms and assumptions remain design material until independently verified in the live environment.', path: 'docs/team/TOKENOMICS.md' },
]

export const sourceDocuments = [
  { title: 'Comprehensive audit and architecture evolution', date: '2026-07-12', path: 'audit.md', role: 'Canonical academic alignment and historical audit baseline.' },
  { title: 'Repository status and public testnet roadmap', date: '2026-07-25', path: 'REPO_STATUS_REPORT.md', role: 'Current readiness, blockers, and evidence boundaries.' },
  { title: 'Current architecture', date: '2026-07-12', path: 'docs/ARCHITECTURE.md', role: 'As-built component and trust-boundary map.' },
  { title: 'v0.8.0 architecture addendum', date: '2026-07-12', path: 'docs/team/ARCHITECTURE_v0-8-0.md', role: 'CHC cognitive specification and Composer scoring.' },
  { title: 'Heart Brain research report', date: '2026-06', path: 'docs/team/heart_brain_research.md', role: 'Paper verification and implementability assessment.' },
  { title: 'Project changelog', date: '2026-06-23', path: 'docs/CHANGELOG.md', role: 'Versioned implementation and research updates.' },
]

export const researchSnapshotMeta = {
  architecture: 'v0.8.0 cognitive/composer layer',
  lifecycle: 'Hardened pre-testnet candidate',
  snapshotDate: '2026-07-25',
  scope: 'Bundled research snapshot; no live repository synchronization.',
}

export const maturityOptions = ['all', 'implemented', 'partial', 'prototype', 'planned', 'blocked']
