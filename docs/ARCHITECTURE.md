# VAMS Frontend Architecture

## Decision

VAMS uses one React/Vite source tree with three logically separate surfaces:

- `MarketingLayout`: editorial protocol routes and one lazy neural topography visual
- `ConsoleLayout`: read-only protocol entity inspection
- `StatusLayout`: operational observations and release-readiness evidence

Documentation remains generated from repository Markdown.

## Route boundary

All current surfaces are served from `https://www.vams.network`. The Vercel SPA rewrite sends application routes to `index.html`, while Vercel serves existing static files first. `app.vams.network` and `status.vams.network` remain planned destinations until separately deployed.

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

The public preview distinguishes an unconfigured Gateway, a connection or retryable HTTP failure, a rejected HTTP response, a malformed envelope, an empty collection, and loaded records. Retry appears only when the failure can plausibly recover without configuration changes. Website availability is reported independently from Gateway availability.

Simulation is enabled only by `VITE_VAMS_SIMULATION_ENABLED=true` or `npm run dev:simulation`. It renders a persistent disclosure and marks every result `SIMULATED`.

## Capability boundary

Effective capability is the Boolean intersection of frontend configuration and Gateway-advertised support. Sensitive action flags are disabled in frontend configuration, so a Gateway cannot activate them.

```text
frontend flag
AND Gateway support
= effective capability
```

The explorer is always read-only.

## Neural renderer boundary

Three.js is isolated in the lazy marketing-home renderer and its pointer helper. The renderer stays on one canvas while the shader-displaced neural topography converges into a planetary network. Console and evidence routes do not import or execute Three.js at runtime.

This scene is an illustrative network, not a protocol map, entity graph, or representation of deployed infrastructure. It does not read ExplorerClient data.

- Source node IDs and the original sparse grid edge pairs remain stable during scroll, rotation, resize, and quality degradation.
- Equal-area spherical rings preserve source-grid locality without duplicate poles or a duplicated longitude seam. Both points and subdivided spherical edges evaluate the same GLSL morph function.
- A native scroll interval ends at the dedicated planetary chapter. Reversing scroll restores the source field; pause only freezes ambient motion.
- `GlobeChapter` provides a scoped drag region, keyboard rotation, bounded zoom, pause, reset, and explicit touch exploration. Accessible controls remain outside the aria-hidden visual backdrop. Wheel input continues scrolling the document.
- `wide`, `high`, `medium`, and `low` profiles cap initial geometry and DPR. A quality change reduces density or DPR without recreating the renderer or changing node IDs.
- Reduced motion and WebGL failures retain the CSS topology and a static planetary composition, with no unusable interaction controls.
- Rendering stops when the document is hidden. Geometry, materials, observers, listeners, and the canvas are disposed on home exit. Context loss switches to the fallback.
- A monochrome shader rim supplies restrained atmosphere without additional rendering dependencies. Bundled public-domain Natural Earth land coordinates classify the existing nodes and add coastlines that share the globe orientation and zoom. Ocean nodes and grid lines recede during closure; the same geography supplies the static fallback. Photographic textures, live geographic markers, and full atmospheric-scattering packages remain outside this change.
- After globe completion, a second reversible scroll interval grows an illustrative network outward from India and Bangladesh. Forty-three geographic anchors reuse existing grid node IDs; raised great-circle routes connect local, regional, and distant junctions before two orbital paths appear. The geometry is allocated once and follows the same rotation and zoom uniforms. These anchors do not represent deployment locations.
- The planetary chapter occupies 280 viewport heights with a sticky viewport stage. Network growth spans 1.45 viewport heights after a short completed-globe pause. Reduced motion and renderer fallback remove the extended sticky sequence. Browser coverage specifies growth, reversal, canvas identity, and stage visibility; running that coverage requires the browser QA environment.

The hosted preview is a separate Site; publishing it does not update vams.network or the GitHub repository. Browser/device visual and performance verification must be recorded separately from unit tests and build results.

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
