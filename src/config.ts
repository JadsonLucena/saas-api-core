import os from 'node:os'

import getGoogleCredentialPathByType from './infrastructure/gateway/SM/googleCredentialsGateway.ts'
import GatewayFactory from './infrastructure/services/GatewayFactory.ts'

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
  throw new Error('HOSTNAME_API is required. Please, set the environment variable HOSTNAME_API with the value of your hostname')
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
export const GOOGLE_CREDENTIAL_TYPE = {
  SERVICE_ACCOUNT: 'service_account',
  EXTERNAL_ACCOUNT: 'external_account'
} as const
export type GOOGLE_CREDENTIAL_TYPE = typeof GOOGLE_CREDENTIAL_TYPE[keyof typeof GOOGLE_CREDENTIAL_TYPE]

export const SM: Record<PROVIDERS, Record<string, string | undefined>> & { PROVIDER?: PROVIDERS } = {
  PROVIDER: process.env.SM_PROVIDER?.trim().toUpperCase() as PROVIDERS,
  [PROVIDERS.GOOGLE]: {
    PROJECT_ID: process.env[`SM_${PROVIDERS.GOOGLE}_CLOUD_PROJECT`]?.trim() ?? process.env[`${PROVIDERS.GOOGLE}_CLOUD_PROJECT`]?.trim(),
    CREDENTIAL: process.env[`SM_${PROVIDERS.GOOGLE}_APPLICATION_CREDENTIALS`]?.trim() ?? getGoogleCredentialPathByType(GOOGLE_CREDENTIAL_TYPE.SERVICE_ACCOUNT, process.env[`${PROVIDERS.GOOGLE}_APPLICATION_CREDENTIALS`]?.trim()),
    FEDERATED_TOKEN_FILE: process.env[`SM_${PROVIDERS.GOOGLE}_APPLICATION_CREDENTIALS`]?.trim() ?? getGoogleCredentialPathByType(GOOGLE_CREDENTIAL_TYPE.EXTERNAL_ACCOUNT, process.env[`${PROVIDERS.GOOGLE}_APPLICATION_CREDENTIALS`]?.trim())
  },
  [PROVIDERS.AWS]: {
    API_VERSION: process.env[`SM_${PROVIDERS.AWS}_API_VERSION`]?.trim() ?? '2017-10-17',
    ROLE_ARN: process.env[`SM_${PROVIDERS.AWS}_ROLE_ARN`]?.trim() ?? process.env[`${PROVIDERS.AWS}_ROLE_ARN`]?.trim(),
    REGION: (process.env[`SM_${PROVIDERS.AWS}_DEFAULT_REGION`]?.trim() ?? process.env[`${PROVIDERS.AWS}_DEFAULT_REGION`]) || 'us-east-1',
    CLIENT_ID: process.env[`SM_${PROVIDERS.AWS}_ACCESS_KEY_ID`]?.trim() ?? process.env[`${PROVIDERS.AWS}_ACCESS_KEY_ID`]?.trim(),
    CLIENT_SECRET: process.env[`SM_${PROVIDERS.AWS}_SECRET_ACCESS_KEY`]?.trim() ?? process.env[`${PROVIDERS.AWS}_SECRET_ACCESS_KEY`]?.trim(),
    FEDERATED_TOKEN_FILE: process.env[`SM_${PROVIDERS.AWS}_WEB_IDENTITY_TOKEN_FILE`]?.trim() ?? process.env[`${PROVIDERS.AWS}_WEB_IDENTITY_TOKEN_FILE`]?.trim()
  },
  [PROVIDERS.AZURE]: {
    URI: process.env[`SM_${PROVIDERS.AZURE}_URI`]?.trim(),
    REGION: process.env[`SM_${PROVIDERS.AZURE}_LOCATION`]?.trim() ?? process.env[`${PROVIDERS.AZURE}_LOCATION`]?.trim(),
    CLIENT_ID: process.env[`SM_${PROVIDERS.AZURE}_CLIENT_ID`]?.trim() ?? process.env[`${PROVIDERS.AZURE}_CLIENT_ID`]?.trim() ?? process.env[`ARM_CLIENT_ID`]?.trim(),
    TENANT_ID: process.env[`SM_${PROVIDERS.AZURE}_TENANT_ID`]?.trim() ?? process.env[`${PROVIDERS.AZURE}_TENANT_ID`]?.trim() ?? process.env[`ARM_TENANT_ID`]?.trim(),
    CLIENT_SECRET: process.env[`SM_${PROVIDERS.AZURE}_CLIENT_SECRET`]?.trim() ?? process.env[`${PROVIDERS.AZURE}_CLIENT_SECRET`]?.trim() ?? process.env[`ARM_CLIENT_SECRET`]?.trim(),
    FEDERATED_TOKEN_FILE: process.env[`SM_${PROVIDERS.AZURE}_FEDERATED_TOKEN_FILE`]?.trim() ?? process.env[`${PROVIDERS.AZURE}_FEDERATED_TOKEN_FILE`]?.trim()
  }
}

const sm = await GatewayFactory.SM(SM, APP_NAME)

export const CACHE_DB = {
  CONNECTION_STRING: (await sm?.get('CACHE_DB_CONNECTION_STRING'))?.getLatestActiveVersion()?.value ?? process.env.CACHE_DB_CONNECTION_STRING?.trim(),
  MAX_MEMORY: parseInt(`${process.env.CACHE_DB_MAX_MEMORY?.trim()}`)
}