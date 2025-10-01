import test, { before, describe } from 'node:test'
import assert from 'node:assert'

import { PORT } from '../../../src/config.ts'
// import server from '../../../src/index.ts'

// after(() => server.stop())

let isOn = false
before(async () => {
	const maxAttempts = 30
	for (let i = 1; i <= maxAttempts; i++) {
		const res = await fetch(`http://localhost:${PORT.HTTP}/health`, {
			method: 'HEAD'
		}).catch(err => ({
			status: 500,
			error: err
		}))

		if (res.status === 200) {
			isOn = true
			break
		}

		await new Promise(resolve => setTimeout(resolve, 1000 * i))
	}
})

describe('E2E HTTP tests', () => {
	test('Check if the application is online', async () => {
		return assert.strictEqual(isOn, true)
	})

	test('Check if server redirects to HTTPS', async () => {
		const res = await fetch(`http://localhost:${PORT.HTTP}`)

		return assert.strictEqual(res.redirected, true)
	})

	test('Get response message from root path', async () => {
		const res = await fetch(`https://localhost:${PORT.HTTPS}`)

		assert.strictEqual(res.status, 200)
		return assert.deepStrictEqual(await res.json(), {
			message: 'Hello World'
		})
	})

	test('Head request to root path', async () => {
		const res = await fetch(`https://localhost:${PORT.HTTPS}`, {
			method: 'HEAD'
		})

		return assert.strictEqual(res.status, 200)
	})

	test('Check if the server is preventing hotlinking', async () => {
		const res = await fetch(`https://localhost:${PORT.HTTPS}/public/favicon.ico`, {
			headers: {
				Referer: 'https://example.com'
			}
		})

		return assert.strictEqual(res.status, 403)
	})
})