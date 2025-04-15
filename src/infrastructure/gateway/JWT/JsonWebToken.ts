import type { IJWT, IJWTPayloadDTO } from '../../../application/ports/IJWT.ts'

import jwt from 'jsonwebtoken'

export const ALGORITHMS = ['RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'HS256', 'HS384', 'HS512', 'PS256', 'PS384', 'PS512']
export type ALGORITHMS = typeof ALGORITHMS[number]

export default class JsonWebToken implements IJWT {
	private readonly key: string
	private readonly iss: string
	private readonly kid?: string
	private readonly alg: ALGORITHMS
	private readonly aud: string | string[]
	private readonly sub?: string

	constructor(key: string, iss: string,
		{
			kid,
			alg = 'HS512',
			aud = '*',
			sub
		}: {
			kid?: string,
			alg?: ALGORITHMS,
			aud?: string | string[],
			sub?: string
		} = {}
	) {
		if (key.length < 1) {
			throw new SyntaxError('Invalid key')
		} else if (!ALGORITHMS.includes(alg.trim().toUpperCase())) {
			throw new SyntaxError('Invalid alg')
		}

		this.kid = kid
		this.key = key
		this.iss = iss
		this.alg = alg
		this.aud = aud
		this.sub = sub
	}

	sign({
		iss = this.iss,
		sub = this.sub,
		aud = this.aud,
		...props
	}: IJWTPayloadDTO['payload'] = {}): string {
		return jwt.sign(
			props,
			this.key,
				Object.assign({
				algorithm: this.alg,
				issuer: iss,
				subject: sub,	
				audience: aud
			},
			this.kid ? { keyid: this.kid } : {})
		)
	}

	verify(token: string): boolean {
		try {
			jwt.verify(token, this.key)
			return true
		} catch(_) {
			return false
		}
	}

	decode(token: string, verify = true): IJWTPayloadDTO {
		if (
			verify &&
			!this.verify(token)
		) {
			throw new Error('Invalid token')
		}

		const decoded = jwt.decode(token, {
			json: true,
			complete: true
		})

		if (!decoded) {
			throw new Error('Invalid token')
		}

		return decoded
	}
}