import os from 'node:os'

const LOOPBACK = 'localhost'

export const APP_NAME = process.env.APP_NAME?.trim() ?? 'API'

export const NodeEnv = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
} as const
export type NodeEnv = typeof NodeEnv[keyof typeof NodeEnv]
export const NODE_ENV: NodeEnv = Object.values(NodeEnv).find(nodeEnv => nodeEnv === process.env.NODE_ENV?.trim()) ?? 'development'

export const HOSTNAME = {
  API: process.env.HOSTNAME_API?.trim()?.toLowerCase() ?? LOOPBACK,
  GUI: process.env.HOSTNAME_GUI?.trim()?.toLowerCase() ?? LOOPBACK,
  ASSETS: process.env.HOSTNAME_ASSETS?.trim()?.toLowerCase() ?? LOOPBACK
}

if (
  NODE_ENV !== NodeEnv.DEVELOPMENT &&
  HOSTNAME.API.includes(LOOPBACK)
) {
  throw new Error('HOSTNAME is required. Please, set the environment variable HOSTNAME with the value of your hostname')
}

export const PORT = {
  HTTP: parseInt(process.env.PORT_HTTP?.trim() ?? '8080'),
  HTTPS: parseInt(process.env.PORT_HTTPS?.trim() ?? '8443')
}

if (
  PORT.HTTP === PORT.HTTPS
) {
  throw new Error('HTTP and HTTPS ports must be different')
} else if (
  PORT.HTTP !== 80 &&
  (PORT.HTTP < 1024 || PORT.HTTP > 49151)
) {
  throw new Error('Invalid HTTP port number')
} else if (
  PORT.HTTPS !== 443 &&
  (PORT.HTTPS < 1024 || PORT.HTTPS > 49151)
) {
  throw new Error('Invalid HTTPS port number')
}

export const TLS = {
  CERT_PATH: process.env.TLS_CERT_PATH?.trim(),
  KEY_PATH: process.env.TLS_KEY_PATH?.trim()
}

export const USE_HTTP2 = !/^(false|0|undefined|null|NaN|)$/.test(process.env.USE_HTTP2?.trim() || 'false')

export const ORIGIN = {
	API: new URL(`${TLS.CERT_PATH && TLS.KEY_PATH ? 'https' : 'http'}://${HOSTNAME.API}:${TLS.CERT_PATH && TLS.KEY_PATH ? PORT.HTTPS : PORT.HTTP}`.replace(/:(80|443)/, '')),
	GUI: new URL(`${TLS.CERT_PATH && TLS.KEY_PATH ? 'https' : 'http'}://${HOSTNAME.GUI}:${TLS.CERT_PATH && TLS.KEY_PATH ? PORT.HTTPS : PORT.HTTP}`.replace(/:(80|443)/, '')),
	ASSETS: new URL(`${TLS.CERT_PATH && TLS.KEY_PATH ? 'https' : 'http'}://${HOSTNAME.ASSETS}:${TLS.CERT_PATH && TLS.KEY_PATH ? PORT.HTTPS : PORT.HTTP}`.replace(/:(80|443)/, ''))
}

export const ASSETS = {
  DIR_ROOT_PATH: process.env.ASSETS_DIR_ROOT_PATH?.trim() ?? 'public',
}

export const SECURITY = {
  KEEP_ALIVE_TIMEOUT: Math.max(0, parseInt(process.env.SECURITY_KEEP_ALIVE_TIMEOUT?.trim() || '5_000')), // In milliseconds
  MAX_EXECUTION_TIME: Math.max(0, parseInt(process.env.SECURITY_MAX_EXECUTION_TIME?.trim() || '30_000')), // In milliseconds
  MAX_CONNECTIONS: Math.max(1, parseInt(process.env.SECURITY_MAX_CONNECTIONS?.trim() || '1_000')),
  BODY_MAX_SIZE: Math.max(1, parseInt(process.env.SECURITY_POST_MAX_SIZE?.trim() || '10_485_760')), // 10 MB in bytes
  UPLOAD_MAX_FILESIZE: Math.max(1, parseInt(process.env.SECURITY_UPLOAD_MAX_FILESIZE?.trim() || '15_728_640')), // 15 MB  in bytes
  PREVENT_HOTLINK: !/^(false|0|undefined|null|NaN|)$/.test(process.env.SECURITY_PREVENT_HOTLINK?.trim() || 'false')
}

export const SPOT_TERMINATION_NOTICE_TIME = Math.max(1, parseInt(process.env.SPOT_TERMINATION_NOTICE_TIME?.trim() || '30_000')) // In milliseconds

export const CLUSTER = {
  WORKERS: Math.min(os.cpus().length, Math.max(1, parseInt(process.env.CLUSTER_WORKERS?.trim() || `${os.cpus().length}`)))
}