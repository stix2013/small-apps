export const internetUnit = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'BB'] as const
export const internetSpeedUnit = ['Kbps', 'Mbps'] as const
export const timeUnit = ['Second', 'Minute', 'Hour', 'Day', 'Week', 'Month', 'Year'] as const

export type InternetUnit = typeof internetUnit[number] // 'Bytes' | 'KB' | 'MB' | 'GB'
export type InternetSpeedUnit = typeof internetSpeedUnit[number]
export type TimeUnit = typeof timeUnit[number]
