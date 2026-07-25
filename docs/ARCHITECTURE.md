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

The marketing hero renders a deterministic shader-displaced neural topography:

- `wide`, `desktop`, `tablet`, and `mobile` profiles independently cap geometry and device pixel ratio;
- widths below `360px`, reduced-motion clients, low-power devices, and WebGL failures use the complete CSS topology;
- pointer proof waves are available only to fine pointers;
- rendering pauses when the hero or browser document is not visible;
- geometry, materials, renderer state, observers, and the canvas are disposed on teardown.

## Responsive composition boundary

Four layout measures prevent viewport-width and scrollbar coupling:

- hero: `1440px`
- editorial: `1280px`
- console/data: `1180px`
- reading measure: `60–72ch`

Page gutters, section rhythm, and heading gaps change at the `360px`, `480px`, `768px`, `1200px`, and `1600px` boundaries. Component grids also use container queries where panel width is more important than viewport width.

## Motion ownership

`ResponsiveMotionProvider` is the single source of motion capability, entrance distance, pointer type, and hero quality.

- CSS/WAAPI owns focus, hover, borders, table rows, and CHC bar entrances.
- Motion React owns route presence, in-view reveals, stagger groups, smoke text, magnetic links, drawers, and data-state transitions.
- GSAP ScrollTrigger is dynamically imported only for the desktop marketing lifecycle.
- Three.js owns only the marketing-home neural topography.

A component is never transformed by Motion React and GSAP simultaneously. Reduced motion removes blur, transform distance, parallax, scrubbing, magnetic response, and looping cues while retaining the complete static composition.

## Release boundary

Polygon Amoy and Cardano Pre-Prod are architectural deployment targets, not deployment claims. Public-testnet exposure remains blocked until browser security, accessibility, phishing, CSP, Gateway, evidence, and dependency gates pass.

All ten protocol invariants remain outside this frontend mutation path. The UI adds no economic or contract-writing controls.
