# VAMS Frontend Architecture

## Decision

VAMS uses one React/Vite source tree with three logically separate surfaces:

- `MarketingLayout`: editorial protocol routes and selected lazy Three.js visuals
- `ConsoleLayout`: read-only protocol entity inspection
- `StatusLayout`: operational observations and release-readiness evidence

Documentation remains generated from repository Markdown.

## Route boundary

Marketing:

```text
/
/protocol
/network
/build
/operate
/research
```

Console:

```text
/overview
/nodes
/nodes/:nodeId
/blueprints
/blueprints/:blueprintId
/service-blocks
/service-blocks/:serviceBlockId
/data-availability
/evidence
/system
```

Status:

```text
/status
```

Legacy hashes such as `#vision`, `#manifesto`, `#stack`, `#innovations`, `#router`, `#roadmap`, and `#tokenomics` redirect to their truthful replacements.

## Truthful data boundary

Pages do not call `fetch()` directly. `ExplorerClient` owns transport, common-envelope validation, entity validation, credential omission, and structured errors.

When the Gateway origin is absent, unreachable, or malformed:

1. the request fails closed;
2. an unavailable state is rendered;
3. no synthetic data is substituted.

Simulation is enabled only by `VITE_VAMS_SIMULATION_ENABLED=true` or `npm run dev:simulation`. It renders a persistent disclosure and marks every result `SIMULATED`.

## Capability boundary

Effective capability is the Boolean intersection of frontend configuration and Gateway-advertised support. Sensitive action flags are disabled in frontend configuration, so a Gateway cannot activate them.

```text
frontend flag
AND Gateway support
= effective capability
```

The explorer is always read-only.

## Three.js boundary

`three` is imported only by `components/marketing/NeuralField.jsx`. The component is dynamically imported, rendered only on the marketing home page, skipped when reduced motion is requested, and emitted as `three-marketing` in production builds.

Console and evidence routes do not import or execute Three.js at runtime.

## Release boundary

Polygon Amoy and Cardano Pre-Prod are architectural deployment targets, not deployment claims. Public-testnet exposure remains blocked until browser security, accessibility, phishing, CSP, Gateway, evidence, and dependency gates pass.

All ten protocol invariants remain outside this frontend mutation path. The UI adds no economic or contract-writing controls.
