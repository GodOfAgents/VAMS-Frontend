# Gateway Explorer Contract

The frontend expects the additive, versioned, read-only Gateway namespace below:

```text
GET  /v1/explorer/meta
GET  /v1/explorer/nodes
GET  /v1/explorer/nodes/{nodeId}
GET  /v1/explorer/blueprints
GET  /v1/explorer/blueprints/{blueprintId}
GET  /v1/explorer/service-blocks
GET  /v1/explorer/service-blocks/{serviceBlockId}
GET  /v1/explorer/da/status
GET  /v1/explorer/da/anchors
POST /v1/explorer/compositions/simulate
GET  /v1/explorer/evidence/summary
GET  /v1/explorer/evidence/invariants
```

Every response must have this envelope:

```json
{
  "data": {},
  "api_version": "v1",
  "environment": "LOCAL",
  "provenance": "LIVE",
  "fetched_at": "2026-07-23T00:00:00.000Z",
  "source": "gateway-explorer",
  "commit_sha": "optional-commit",
  "evidence_state": "SOURCE_IMPLEMENTED"
}
```

Accepted provenance values:

```text
LIVE CACHED STALE SIMULATED MOCK UNKNOWN
```

Accepted evidence values:

```text
SOURCE_IMPLEMENTED
LOCALLY_VERIFIED
CI_VERIFIED
DEPLOYMENT_VERIFIED
INDEPENDENTLY_REVIEWED
LIVE_OBSERVED
DEPLOYMENT_PENDING
BLOCKED
UNKNOWN
```

Composition simulation must be non-mutating. It must not create instances, reserve resources, change composer counters, authorize payments, or enter settlement paths. The response must include `mutating: false`, candidate scores, selection decisions, strengths, shortfalls, exclusions, allocation, and estimated cost.

This repository implements the frontend client contract only. The Gateway router and its non-mutation/redaction tests must land in the VAMS protocol repository and pass its independent release gates.
