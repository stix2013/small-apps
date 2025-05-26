import client from 'prom-client'

// SIMINN SMS
export const gaugeSimInnSMS = new client.Gauge({
  name: 'siminn_sms_healthcheck',
  help: 'SIMINN SMS server is healthcheck',
  labelNames: ['status'] as const
})
