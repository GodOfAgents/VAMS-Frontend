# Changelog

All notable frontend changes are documented here following Keep a Changelog.

## Unreleased

### Added

- Shared marketing, console, and status layouts with route-specific navigation.
- Read-only node, blueprint, Service Block, DA, evidence, and system explorer routes.
- Schema-validated `/v1/explorer` clients and fail-closed capability intersection.
- Explicit simulation mode with persistent disclosure and explainable non-mutating composition output.
- Provenance, claim, capability, evidence, and environment status components.
- Keyboard navigation, skip links, reduced-motion handling, mobile inspection navigation, and CHC text tables.
- Marketing, console, and status production build profiles.
- Contract, routing, simulation, malformed-response, and accessible-status tests.
- Responsive motion primitives for route presence, in-view reveals, stagger groups, smoke text, magnetic links, drawers, and data-state transitions.
- A deterministic shader-driven neural-topography hero with responsive quality profiles and static fallbacks.
- Browser regression coverage for the responsive viewport matrix and cinematic-bundle isolation.
- A word-by-word hero heading reveal with a complete reduced-motion presentation.
- Shared subtle, panel, and strong glass-surface treatments across marketing, console, and status views.
- A single-play semantic proof wave synchronized with the completed hero heading reveal.
- Explicit loading, ready, and fallback states for the lazy Three.js renderer.

### Changed

- Replaced the 68 KB monolithic landing page with one shared route-ready frontend system.
- Reorganized public content around Protocol, Network, Build, Operate, Research, and Status.
- Replaced Avalanche, active rewards/yield, and fixed-roadmap claims with Polygon Amoy/Cardano Pre-Prod deployment-pending architecture.
- Restricted Three.js to a lazy, reduced-motion-aware marketing visual.
- Replaced viewport-width container calculations with role-based percentage containers, responsive gutters, and component-aware grids.
- Rebalanced hero, navigation, editorial, console, status, and evidence spacing from `320px` through ultrawide layouts.
- Limited GSAP ScrollTrigger to the desktop homepage lifecycle; tablet and mobile use one-time in-view reveals.
- Restored the original full-hero rolling topography, grayscale shimmer, fog depth, pointer lift, and camera drift using GPU vertex displacement.
- Replaced the right-biased mobile hero stage with a full-background composition that keeps calls to action in the content flow.
- Rebalanced the neural terrain around a deliberate focal ridge, restrained desktop scroll depth, and responsive contrast masks.
- Replaced viewport-only hero quality with performance-first tiers that can degrade only downward during a route visit.

### Performance

- Reduced hero DPR to `1.0` on mobile/tablet and `1.25` on desktop while lowering procedural geometry density.
- Added frame-cadence monitoring, tier-specific frame ceilings, low-tier antialiasing removal, and automatic sustained-budget downgrades.
- Preserved one procedural geometry and draw call with no new 3D dependencies, models, textures, or console/status bundle cost.

### Removed

- Wallet, staking, rewards, payment, governance, insurance, and economic-action presentation.
- Automatic simulated-data fallback and page-level data transport.

### Security

- Gateway origins fail closed on non-local HTTP, credentials, paths, queries, or fragments.
- Explorer requests omit credentials and validate the common provenance envelope.
- A baseline content security policy is present in `index.html`; production response-header verification remains a deployment gate.

### Testing

- Added unit coverage for routing, capabilities, environment validation, response validation, simulation provenance, non-mutation, and text-based status semantics.
- Added frozen reduced-motion visual baselines and separate animation behavior checks.
- Added runtime assertions that console and status profiles do not request Three.js or GSAP chunks.
- Added unit coverage for quality selection, low-power detection, downgrade ordering, and sustained frame-budget hysteresis.
- Added browser checks for first-frame readiness, one-shot proof-wave behavior, low-DPR mobile rendering, and WebGL fallback.

### Known release blocks

- `npm audit --omit=dev --audit-level=high` reports `GHSA-qwww-vcr4-c8h2` in React Router 7.18.1. VAMS does not expose React Server Components or action endpoints, but public-testnet exposure remains blocked until an upstream patched release is available or the router is replaced.
- Gateway explorer implementation, public DTO redaction, signed commit-bound evidence export, CSP response headers, browser security, accessibility, and phishing reviews remain external gates.
