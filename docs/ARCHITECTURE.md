# VAMS Frontend Architecture

## Decision

VAMS uses one React/Vite source tree with three logically separate surfaces:

- `MarketingLayout`: editorial protocol routes with a CSS-rendered horizon visual on the homepage
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

The interface is built from one token layer (`styles/tokens.css`) and three shared layers: `base.css`, `components.css`, and a stylesheet per surface (`marketing.css`, `topics.css`, `research.css`, `console.css`, `status.css`). Dark is the primary theme; light is a warm editorial variant, and any subtree can opt into the dark stage with `data-theme="dark"`. `public/theme-init.js` applies the stored or preferred theme before first paint (the CSP forbids inline scripts).

Content is presented on hairlines, rules, and whitespace rather than card grids. Decorative drawings (`HorizonBackdrop`, `ArchitectureOrbit`) are CSS or inline SVG, carry no text or data, and are hidden from assistive technology. They are not protocol maps or entity graphs.

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
- Scroll-linked choreography uses `useScroll`/`useTransform` (`motion/scroll.jsx`): the pinned homepage horizon stage, the tilt-in evidence window, the expanding destination panel, and the lifecycle rail.
- Active lifecycle steps and architecture boundaries are tracked with one `IntersectionObserver` each.

Reduced motion (system setting or the in-page pause control) removes pinning, scrubbing, transforms, and looping cues while retaining the complete static composition.

## Release boundary

Polygon Amoy and Cardano Pre-Prod are architectural deployment targets, not deployment claims. Public-testnet exposure remains blocked until browser security, accessibility, phishing, CSP, Gateway, evidence, and dependency gates pass.

All ten protocol invariants remain outside this frontend mutation path. The UI adds no economic or contract-writing controls.
