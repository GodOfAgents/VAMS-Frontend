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

### Changed

- Replaced the 68 KB monolithic landing page with one shared route-ready frontend system.
- Reorganized public content around Protocol, Network, Build, Operate, Research, and Status.
- Replaced Avalanche, active rewards/yield, and fixed-roadmap claims with Polygon Amoy/Cardano Pre-Prod deployment-pending architecture.
- Restricted Three.js to a lazy, reduced-motion-aware marketing visual.

### Removed

- Wallet, staking, rewards, payment, governance, insurance, and economic-action presentation.
- Automatic simulated-data fallback and page-level data transport.

### Security

- Gateway origins fail closed on non-local HTTP, credentials, paths, queries, or fragments.
- Explorer requests omit credentials and validate the common provenance envelope.
- A baseline content security policy is present in `index.html`; production response-header verification remains a deployment gate.

### Testing

- Added unit coverage for routing, capabilities, environment validation, response validation, simulation provenance, non-mutation, and text-based status semantics.

### Known release blocks

- The dependency audit must be clean before public-testnet exposure.
- Gateway explorer implementation, public DTO redaction, signed commit-bound evidence export, CSP response headers, browser security, accessibility, and phishing reviews remain external gates.
