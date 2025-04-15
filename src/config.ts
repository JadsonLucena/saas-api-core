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

export const PAGINATION = {
  SKIP: Math.max(0, parseInt(process.env.PAGINATION_SKIP ?? '0')),
  TAKE: Math.max(1, parseInt(process.env.PAGINATION_TAKE ?? '50')),
  MAX_TAKE: Math.max(1, parseInt(process.env.PAGINATION_MAX_TAKE ?? '100'))
}

export const PROVIDERS = {
  GOOGLE: 'GOOGLE',
  AWS: 'AWS',
  AZURE: 'AZURE'
} as const
export type PROVIDERS = typeof PROVIDERS[keyof typeof PROVIDERS]

export const SM: Record<PROVIDERS, Record<string, string | undefined>> & { PROVIDER: PROVIDERS } = {
  PROVIDER: process.env.SM_PROVIDER?.trim().toUpperCase() as PROVIDERS ?? PROVIDERS.GOOGLE,
  [PROVIDERS.GOOGLE]: {
    // PROJECT_ID: process.env.SM_GOOGLE_PROJECT_ID?.trim() ?? '',
    CREDENTIAL: process.env[`SM_${PROVIDERS.GOOGLE}_CREDENTIAL`]?.trim()
  },
  [PROVIDERS.AWS]: {
    REGION: process.env[`SM_${PROVIDERS.AWS}_REGION`]?.trim() ?? 'us-east-1',
    CLIENT_ID: process.env[`SM_${PROVIDERS.AWS}_ACCESS_KEY_ID`]?.trim(),
    CLIENT_SECRET: process.env[`SM_${PROVIDERS.AWS}_SECRET_ACCESS_KEY`]?.trim()
  },
  [PROVIDERS.AZURE]: {
    NAME: process.env[`SM_${PROVIDERS.AZURE}_NAME`]?.trim(),
    TENANT_ID: process.env[`SM_${PROVIDERS.AZURE}_TENANT_ID`]?.trim(),
    CLIENT_ID: process.env[`SM_${PROVIDERS.AZURE}_CLIENT_ID`]?.trim(),
    CLIENT_SECRET: process.env[`SM_${PROVIDERS.AZURE}_CLIENT_SECRET`]?.trim()
  }
}

if (!Object.values(PROVIDERS).includes(SM.PROVIDER)) {
  throw new Error(`Invalid SM provider. Supported providers are: ${Object.values(PROVIDERS).join(', ')}`)
} else if (
  SM.PROVIDER === PROVIDERS.GOOGLE &&
  !SM.GOOGLE.CREDENTIAL
) {
  throw new Error('Google SM credentials are required')
} else if (
  SM.PROVIDER === PROVIDERS.GOOGLE &&
  !SM.GOOGLE.CREDENTIAL
) {
  throw new Error('Google SM credentials are required')
} else if (
  SM.PROVIDER === PROVIDERS.AWS &&
  (!SM.AWS.CLIENT_ID || !SM.AWS.CLIENT_SECRET)
) {
  throw new Error('AWS SM credentials are required')
} else if (
  SM.PROVIDER === PROVIDERS.AZURE &&
  (!SM.AZURE.NAME || !SM.AZURE.TENANT_ID || !SM.AZURE.CLIENT_ID || !SM.AZURE.CLIENT_SECRET)
) {
  throw new Error('Azure SM credentials are required')
}