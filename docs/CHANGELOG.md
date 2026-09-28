# Changelog

All notable frontend changes are documented here following Keep a Changelog.

## Unreleased

### Monochrome light theme and flagship motion

- The site is now one light, monochrome theme (ink, graphite, silver, warm paper); the blue signal accent is gone and green, amber, and red remain only for status. The theme toggle and pre-paint theme script were removed.
- The home hero is a dark island: the silver light slats stay, and the floating navigation capsule adopts the theme of whatever section sits beneath it.
- The planet horizon was replaced by a liquid-chrome stage: a light panel opens beneath the hero and the VAMS wordmark pours together from mercury droplets as it grows (WebGL2, with a CSS chrome fallback), with the protocol readouts following.
- The closing panel now mirrors the hero's slats, growing as it opens, and lights up around the primary action.
- Page titles morph between routes through the View Transitions API, with a plain fade on history navigation and no animation under reduced motion.
- Added liquid-glass refraction and a pointer sheen to the navigation capsule and ghost buttons (Chromium; other browsers keep blurred glass), and a gooey cursor that snaps onto controls on fine pointers.
- All displayed copy, links, labels, and data are unchanged.

### Frontend redesign

- Replaced the visual layer across the marketing, console, and status surfaces with a new token-driven design system: Inter and Geist Mono typography, a near-black primary theme with a warm-paper light theme, hairline structure, and a single azure signal accent.
- Rebuilt the homepage around scroll-driven storytelling: a centred hero, a pinned horizon stage that opens to full bleed and reveals the protocol readouts, a lifecycle timeline that tracks the step in view, an orbital architecture diagram synchronised with a ruled component list, a tilt-in evidence window, editorial entry-point rows, and an expanding destination panel.
- Recomposed topic pages, the research hub, the status register, and the console as editorial rows, timelines, and open sections; card and cell grids were removed.
- Added a floating navigation capsule with shared-layout hover and active indicators, a compact mobile sheet, and a scrim-backed console drawer.
- Removed the Three.js neural field and GSAP timeline, and their dependencies; Motion for React is now the only animation library.
- Added a pre-paint theme script, focusable scrollable regions, and colour-contrast fixes; browser tests and screenshot baselines were updated for the new layouts.
- All displayed copy, links, labels, and data are unchanged.

### Added

- Distinct Protocol, Network, Build, Operate, and Research public-page compositions with clearer builder and operator pathways.
- A persistent animation preference and improved public navigation focus, dismissal, and route-title behavior.

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
- A fixed full-homepage neural scene with lifecycle, architecture, evidence, journey, and CTA chapter art direction.

### Changed

- Reframed the homepage around one fluid neural-topography experience with scroll chapters, pointer lift, and evidence-aware explanatory content.
- Added a restrained pointer light and copy-depth parallax layer that follows the same neural field while respecting reduced-motion preferences.
- Added localized neural-point luminance and echo ripples around the pointer signal without adding geometry or draw calls.
- Extended the same fluid interaction language to public-page principle, migration, and operator-requirement surfaces.

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
- Extended the hero terrain behind the complete homepage while preserving theme-aware contrast and a dark cinematic hero in light mode.
- Tightened the `<360px` hero composition so the first primary action remains visible in the initial `320×568` viewport.

### Performance

- Reduced hero DPR to `1.0` on mobile/tablet and `1.25` on desktop while lowering procedural geometry density.
- Added frame-cadence monitoring, tier-specific frame ceilings, low-tier antialiasing removal, and automatic sustained-budget downgrades.
- Preserved one procedural neural geometry and draw call with no additional models, textures, or console/status bundle cost.
- Reused one adaptive neural scene across homepage chapters with passive scroll sampling, cached section metrics, and shader-only morphing.

### Removed

- Wallet, staking, rewards, payment, governance, insurance, and economic-action presentation.
- Automatic simulated-data fallback and page-level data transport.

### Security

- Gateway origins fail closed on non-local HTTP, credentials, paths, queries, or fragments.
- Explorer requests omit credentials and validate the common provenance envelope.
- A baseline content security policy is present in `index.html`; production response-header verification remains a deployment gate.
- Updated React Router and transitive build dependencies to versions with no reported npm audit vulnerabilities.

### Testing

- Added unit coverage for routing, capabilities, environment validation, response validation, simulation provenance, non-mutation, and text-based status semantics.
- Added frozen reduced-motion visual baselines and separate animation behavior checks.
- Added runtime assertions that console and status profiles do not request Three.js or GSAP chunks.
- Added unit coverage for quality selection, low-power detection, downgrade ordering, and sustained frame-budget hysteresis.
- Added browser checks for first-frame readiness, one-shot proof-wave behavior, low-DPR mobile rendering, and WebGL fallback.
- Added browser coverage for neural chapter interpolation, theme handoff, CTA marker forwarding, full-page scene continuity, compact-mobile fallback, and route disposal.

### Known release blocks

- Gateway explorer implementation, public DTO redaction, signed commit-bound evidence export, CSP response headers, browser security, accessibility, and phishing reviews remain external gates.
### 2026-09-26
- Added a restrained scroll-progress rail to keep the long neural narrative spatially legible, with reduced-motion-safe transitions.
- Kept the neural pointer field responsive across every scroll chapter instead of muting it after the hero.
- Added a clean pointer-exit reset so the neural glow settles immediately when the viewport is left.
- Made public-page hover and focus treatments respect reduced-motion preferences across topic, migration, and operator surfaces.
- Added six quiet chapter ticks to the scroll rail so the long-form neural narrative has a clear visual rhythm.
- Clarified the architecture boundary: the Three.js layer is only the interactive neural backdrop, never a protocol map.
- Highlighted the active chapter tick so scroll position reads as a living narrative state.
- Added a continuous scroll-progress horizon veil to the neural scene, preserving one fluid spatial field between chapter transitions.
