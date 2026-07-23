export const FRONTEND_CAPABILITIES = Object.freeze({
  readOnly: true,
  compositionDryRun: true,
  compositionSubmission: false,
  instanceCancellation: false,
  walletConnection: false,
  staking: false,
  rewards: false,
  fiat: false,
  governanceVoting: false,
  operatorRegistration: false,
})

export function intersectCapabilities(frontend, gateway = {}) {
  return Object.fromEntries(
    Object.entries(frontend).map(([key, enabled]) => [
      key,
      Boolean(enabled && gateway[key] === true),
    ]),
  )
}

export function effectiveCapabilities(gateway = {}) {
  return {
    ...intersectCapabilities(FRONTEND_CAPABILITIES, gateway),
    readOnly: true,
  }
}
