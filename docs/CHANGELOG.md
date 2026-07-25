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

### Changed

- Replaced the 68 KB monolithic landing page with one shared route-ready frontend system.
- Reorganized public content around Protocol, Network, Build, Operate, Research, and Status.
- Replaced Avalanche, active rewards/yield, and fixed-roadmap claims with Polygon Amoy/Cardano Pre-Prod deployment-pending architecture.
- Restricted Three.js to a lazy, reduced-motion-aware marketing visual.
- Replaced viewport-width container calculations with role-based percentage containers, responsive gutters, and component-aware grids.
- Rebalanced hero, navigation, editorial, console, status, and evidence spacing from `320px` through ultrawide layouts.
- Limited GSAP ScrollTrigger to the desktop homepage lifecycle; tablet and mobile use one-time in-view reveals.

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

### Known release blocks

- `npm audit --omit=dev --audit-level=high` reports `GHSA-qwww-vcr4-c8h2` in React Router 7.18.1. VAMS does not expose React Server Components or action endpoints, but public-testnet exposure remains blocked until an upstream patched release is available or the router is replaced.
- Gateway explorer implementation, public DTO redaction, signed commit-bound evidence export, CSP response headers, browser security, accessibility, and phishing reviews remain external gates.
