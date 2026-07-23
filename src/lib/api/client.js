import {
  blueprintSchema,
  daStatusSchema,
  envelopeSchema,
  evidenceRecordSchema,
  explorerMetaSchema,
  nodeSchema,
  serviceBlockSchema,
  simulationInputSchema,
  simulationResultSchema,
} from './schemas.js'
import { simulationFixtures } from './fixtures.js'

const routes = {
  meta: ['/v1/explorer/meta', explorerMetaSchema],
  nodes: ['/v1/explorer/nodes', nodeSchema.array()],
  blueprints: ['/v1/explorer/blueprints', blueprintSchema.array()],
  serviceBlocks: ['/v1/explorer/service-blocks', serviceBlockSchema.array()],
  daStatus: ['/v1/explorer/da/status', daStatusSchema],
  evidence: ['/v1/explorer/evidence/summary', evidenceRecordSchema.array()],
}

export class ProtocolApiError extends Error {
  constructor(message, details = {}) {
    super(message)
    this.name = 'ProtocolApiError'
    this.details = details
  }
}

function simulatedEnvelope(data) {
  return {
    data,
    api_version: 'v1',
    environment: 'SIMULATION',
    provenance: 'SIMULATED',
    fetched_at: new Date().toISOString(),
    source: 'explicit-local-simulation-fixture',
    commit_sha: null,
    evidence_state: 'SOURCE_IMPLEMENTED',
  }
}

export class ExplorerClient {
  constructor({ origin, simulationEnabled = false, fetchImpl = globalThis.fetch } = {}) {
    this.origin = origin
    this.simulationEnabled = simulationEnabled
    this.fetchImpl = fetchImpl
  }

  async request(path, schema, init) {
    if (!this.origin) {
      throw new ProtocolApiError('Gateway origin is not configured. No simulated data was substituted.', {
        code: 'GATEWAY_NOT_CONFIGURED',
      })
    }

    const response = await this.fetchImpl(`${this.origin}${path}`, {
      ...init,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
      credentials: 'omit',
    })

    if (!response.ok) {
      throw new ProtocolApiError(`Gateway returned HTTP ${response.status}.`, {
        code: 'GATEWAY_HTTP_ERROR',
        status: response.status,
      })
    }

    const payload = await response.json()
    const parsed = envelopeSchema(schema).safeParse(payload)
    if (!parsed.success) {
      throw new ProtocolApiError('Gateway response failed schema validation.', {
        code: 'MALFORMED_GATEWAY_RESPONSE',
        issues: parsed.error.issues,
      })
    }
    return parsed.data
  }

  async get(key) {
    const definition = routes[key]
    if (!definition) throw new ProtocolApiError(`Unknown explorer resource: ${key}`)
    if (this.simulationEnabled) return simulatedEnvelope(simulationFixtures[key])
    return this.request(...definition)
  }

  async getById(key, id) {
    if (this.simulationEnabled) {
      const collection = simulationFixtures[key]
      return simulatedEnvelope(collection?.find((item) => item.id === id) || null)
    }

    const definition = routes[key]
    const singularSchema = definition?.[1]?.element
    if (!definition || !singularSchema) throw new ProtocolApiError(`Unknown explorer entity: ${key}`)
    return this.request(`${definition[0]}/${encodeURIComponent(id)}`, singularSchema)
  }

  async simulate(input) {
    const validated = simulationInputSchema.parse(input)
    if (this.simulationEnabled) {
      const candidates = simulationFixtures.nodes.map((node, index) => ({
        node_id: node.id,
        score: index === 0 ? 0.92 : 0.79,
        decision: index === 0 ? 'SELECTED' : 'ELIGIBLE',
        strengths: ['Resource requirement satisfied', 'Region allowed', 'Required skills available'],
        shortfalls: index === 0 ? ['Working memory is 0.04 below the preferred target'] : ['TEE requirement not satisfied'],
        exclusions: index === 0 ? [] : ['Excluded when TEE is mandatory'],
        estimated_cost_per_hour: node.indicative_cost_per_hour,
      }))
      return simulatedEnvelope({
        simulation_id: `sim_${validated.blueprint_id}`,
        candidates,
        allocation: [candidates[0].node_id],
        estimated_cost_per_hour: candidates[0].estimated_cost_per_hour,
        mutating: false,
      })
    }
    return this.request(
      '/v1/explorer/compositions/simulate',
      simulationResultSchema,
      { method: 'POST', body: JSON.stringify(validated) },
    )
  }
}
