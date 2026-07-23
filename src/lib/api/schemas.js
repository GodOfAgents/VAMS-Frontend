import { z } from 'zod'

export const provenanceSchema = z.enum([
  'LIVE',
  'CACHED',
  'STALE',
  'SIMULATED',
  'MOCK',
  'UNKNOWN',
])

export const evidenceStateSchema = z.enum([
  'SOURCE_IMPLEMENTED',
  'LOCALLY_VERIFIED',
  'CI_VERIFIED',
  'DEPLOYMENT_VERIFIED',
  'INDEPENDENTLY_REVIEWED',
  'LIVE_OBSERVED',
  'DEPLOYMENT_PENDING',
  'BLOCKED',
  'UNKNOWN',
])

export const envelopeMetaSchema = z.object({
  api_version: z.string().min(1),
  environment: z.string().min(1),
  provenance: provenanceSchema,
  fetched_at: z.string().datetime(),
  source: z.string().min(1),
  commit_sha: z.string().min(7).optional().nullable(),
  evidence_state: evidenceStateSchema,
})

export function envelopeSchema(dataSchema) {
  return envelopeMetaSchema.extend({ data: dataSchema })
}

export const capabilitiesSchema = z.record(z.string(), z.boolean())

export const explorerMetaSchema = z.object({
  capabilities: capabilitiesSchema,
  gateway_status: z.string(),
  release_profile: z.string(),
}).passthrough()

export const nodeSchema = z.object({
  id: z.string(),
  status: z.enum(['ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN']),
  region: z.string(),
  last_heartbeat: z.string().datetime(),
  resources: z.object({
    cpu_cores: z.number().nonnegative(),
    memory_gb: z.number().nonnegative(),
    gpu: z.string().nullable().optional(),
  }),
  skills: z.array(z.string()),
  chc: z.record(z.string(), z.number().min(0).max(1)),
  trust: z.object({
    tee: z.boolean(),
    tier: z.string(),
    reputation: z.number().min(0).max(1),
  }),
  indicative_cost_per_hour: z.number().nonnegative(),
}).passthrough()

export const blueprintSchema = z.object({
  id: z.string(),
  name: z.string(),
  purpose: z.string(),
  trust_tier: z.string(),
  required_compute: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  cognitive_requirements: z.record(z.string(), z.number().min(0).max(1)),
  service_blocks: z.array(z.string()),
}).passthrough()

export const serviceBlockSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  integration_state: z.string(),
  provenance: provenanceSchema,
  compatible_blueprints: z.array(z.string()),
}).passthrough()

export const daStatusSchema = z.object({
  routes: z.array(z.object({
    name: z.string(),
    implementation: z.string(),
    operational_state: z.string(),
    provenance: provenanceSchema,
  }).passthrough()),
}).passthrough()

export const evidenceRecordSchema = z.object({
  id: z.string(),
  claim: z.string(),
  state: evidenceStateSchema,
  source: z.string(),
  verified_at: z.string().datetime().nullable(),
  detail: z.string(),
}).passthrough()

export const simulationInputSchema = z.object({
  blueprint_id: z.string(),
  region: z.string().optional(),
  budget_per_hour: z.number().positive().optional(),
  required_chc: z.record(z.string(), z.number().min(0).max(1)).optional(),
})

export const simulationResultSchema = z.object({
  simulation_id: z.string(),
  candidates: z.array(z.object({
    node_id: z.string(),
    score: z.number().min(0).max(1),
    decision: z.string(),
    strengths: z.array(z.string()),
    shortfalls: z.array(z.string()),
    exclusions: z.array(z.string()),
    estimated_cost_per_hour: z.number().nonnegative(),
  })),
  allocation: z.array(z.string()),
  estimated_cost_per_hour: z.number().nonnegative(),
  mutating: z.literal(false),
})
