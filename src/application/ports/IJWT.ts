export interface IJWT {
	sign(props: Omit<IJWTPayloadDTO, 'iat'>): string
	verify(token: string): boolean
	decode(token: string, verify?: boolean): IJWTPayloadDTO
}

export interface IJWTPayloadDTO {
	header?: {
		alg?: string, // Algorithm used to sign the token
		enc?: string, // Encryption algorithm used to encrypt the token
		typ?: string, // Type of the token (usually JWT)
		kid?: string, // Key identifier (used to identify the key used to sign the token)
		[k: string]: unknown
	},
	payload: {
		iss?: string, // Who issued the token
		sub?: string, // Who owns the token (usually the user ID)
		aud?: string | string[], // Who the token is intended for
		exp?: number, // Token expiration date and time (Timestamp Unix)
		nbf?: number, // Date and time from when the token is valid (Timestamp Unix)
		iat?: number, // Date and time the token was issued (Timestamp Unix in seconds)
		jti?: string, // Unique token identifier
		kid?: string, // Key identifier (used to identify the key used to sign the token)
		[k: string]: unknown
	},
	signature: string // The signature of the token (used to verify the token)
}