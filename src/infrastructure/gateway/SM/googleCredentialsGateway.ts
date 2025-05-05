import fs from 'node:fs'
import { GOOGLE_CREDENTIAL_TYPE } from '../../../config'

export function getGoogleCredentialPathByType(type: GOOGLE_CREDENTIAL_TYPE, filePath?: string): string | undefined {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      return undefined
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const json = JSON.parse(content)

    if (json.type === type) {
      return filePath
    }
  } catch (err) {
    console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS:', err)
  }

  return undefined
}