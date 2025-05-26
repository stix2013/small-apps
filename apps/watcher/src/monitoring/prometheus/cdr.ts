import client from 'prom-client'

// data
export const gaugeVolumeData = new client.Counter({
  name: 'siminn_cdr_total_data',
  help: 'Total data in byte',
  labelNames: [
    'type',
    // 'group',
    'valid',
    // 'offset'
  ]
})

// export const gaugeNetworkVolumeData = new client.Gauge({
//   name: 'siminn_cdr_data_network',
//   help: 'Network data in byte',
//   labelNames: ['type', 'group', 'valid', 'network']
// })

export const gaugeMsisdnVolumeData = new client.Gauge({
  name: 'siminn_cdr_data_msisdn',
  help: 'MSISDN data in byte',
  labelNames: [
    'type',
    'group',
    'valid',
    'msisdn',
    'offset',
    'network'
  ]
})

//
export const counterProcess = new client.Counter({
  name: 'siminn_cdr_process',
  help: 'CDR processed files',
  labelNames: [
    // 'label',
    'group',
    'filename'
  ] as const
})
// register.registerMetric(counterProcess)

export const histogramProcess = new client.Histogram({
  name: 'siminn_cdr_process_duration',
  help: 'Duration of a CDR process in ms',
  labelNames: ['label'] as const,
  buckets: [1, 5, 10, 50, 200, 300, 400, 500, 1000, 2000, 3000]// in ms
})
// register.registerMetric(histogramProcess)

export const histogramPostData = new client.Histogram({
  name: 'siminn_cdr_post_duration',
  help: 'Duration of the POST request to webhook',
  labelNames: ['label'] as const,
  buckets: [1, 5, 10, 50, 200, 300, 400, 500, 1000, 2000, 3000, 5000, 10000]// in ms
})
