import test from 'node:test'
import assert from 'node:assert'

import { PORT } from '../../../src/config.ts'

test('Check if server redirects to HTTPS', async () => {
	const res = await fetch(`http://localhost:${PORT.HTTP}`)

	return assert.strictEqual(res.redirected, true)
})

test('Check application health status', async () => {
	const res = await fetch(`https://localhost:${PORT.HTTPS}/health`)

	return assert.strictEqual(res.status, 200)
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