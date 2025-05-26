import client from 'prom-client'

// SIMINN API
export const gaugeSimInnApi = new client.Gauge({
  name: 'siminn_api_ping',
  help: 'To check SIMINN API server is alive',
  labelNames: ['status'] as const
})
