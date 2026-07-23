# VAMS Frontend

One React/Vite source tree for the VAMS protocol website, read-only explorer, and verification status surface.

## Surfaces

| Build | Intended host | Default route |
| --- | --- | --- |
| Marketing | `vams.network` | `/` |
| Console | `app.vams.network` | `/overview` |
| Status | `status.vams.network` | `/status` |

Documentation remains repository-generated and is linked from the interface.

The current profile is a hardened pre-testnet candidate. It exposes no wallet connection, payment, staking, rewards, governance, operator registration, provisioning, or settlement controls.

## Commands

```bash
npm ci
npm run dev
npm run dev:simulation
npm run lint
npm run test
npm run build:marketing
npm run build:console
npm run build:status
```

`dev:simulation` is the only built-in mode that enables deterministic synthetic explorer records. The interface displays a persistent `SIMULATED` disclosure in that mode. Missing or malformed Gateway data never triggers an automatic fixture fallback.

## Gateway configuration

Copy `.env.example` and set `VITE_VAMS_GATEWAY_ORIGIN`. Non-local origins must use HTTPS and cannot contain credentials, a path, query parameters, or fragments.

Explorer responses are schema validated and must use the common `/v1/explorer` envelope. See [docs/GATEWAY_EXPLORER_CONTRACT.md](docs/GATEWAY_EXPLORER_CONTRACT.md).

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for routing, data provenance, capability intersection, Three.js isolation, and release boundaries.
