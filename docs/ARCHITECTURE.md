# VAMS Frontend Architecture

## Decision

VAMS uses one React/Vite source tree with three logically separate surfaces:

- `MarketingLayout`: editorial protocol routes with the shader-drawn homepage scenes (light slats, liquid-chrome wordmark)
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

## Visual system boundary

The interface is built from one token layer (`styles/tokens.css`) and three shared layers: `base.css`, `components.css`, and a stylesheet per surface (`marketing.css`, `topics.css`, `research.css`, `console.css`, `status.css`). The palette is monochrome (ink, graphite, silver, warm paper) with green, amber, and red reserved for status. The document is light; a subtree opts into the dark stage with `data-theme="dark"` (the home hero and the closing panel), a light island inside it uses `data-theme="light"`, and the marketing header adopts the theme of whatever section sits beneath it. There is no theme switch.

Content is presented on hairlines, rules, and whitespace rather than card grids. Decorative scenes (`LightSlats`, `LiquidChrome`, `ArchitectureOrbit`) are small raw-WebGL shaders with CSS fallbacks or inline SVG; they carry no text or data and are hidden from assistive technology. They are not protocol maps or entity graphs. `motion/liquidGlass.jsx` adds per-element refraction maps to `data-glass` surfaces, and `motion/GooCursor.jsx` supplies the fine-pointer cursor.

No WebGL renderer ships with any surface. The console and status surfaces do not mount homepage visuals.

## Responsive composition boundary

Four layout measures prevent viewport-width and scrollbar coupling:

- header capsule: `1320px`
- editorial: `1200px`
- console/data: `1180px`
- reading measure: `44–62ch`

Gutters, section rhythm, and type sizes are fluid (`clamp()`), with layout changes at the `360px`, `480px`, `640px`, `768px`, `960px`, and `1100px` boundaries. Panels use container queries where their own width matters more than the viewport.

## Motion ownership

`ResponsiveMotionProvider` is the single source of motion capability, entrance distance, and pointer type. Motion for React (`motion/react`, `domMax` features) is the only animation library.

- CSS owns focus, hover, press feedback, borders, and the decorative drawing states.
- Motion owns route presence, in-view reveals, stagger groups, heading word reveals, magnetic links, the navigation indicators (shared layout), research-ledger filtering (layout animations), and data-state transitions.
- Scroll-linked choreography uses `useScroll`/`useTransform` (`motion/scroll.jsx`): the pinned homepage chrome stage, the tilt-in evidence window, the expanding destination panel (which also drives the closing slats), and the lifecycle rail. Route changes use the View Transitions API (`motion/viewTransitions.js`) so page titles morph between routes.
- Active lifecycle steps and architecture boundaries are tracked with one `IntersectionObserver` each.

Reduced motion (system setting or the in-page pause control) removes pinning, scrubbing, transforms, and looping cues while retaining the complete static composition.

## Release boundary

Polygon Amoy and Cardano Pre-Prod are architectural deployment targets, not deployment claims. Public-testnet exposure remains blocked until browser security, accessibility, phishing, CSP, Gateway, evidence, and dependency gates pass.

All ten protocol invariants remain outside this frontend mutation path. The UI adds no economic or contract-writing controls.
