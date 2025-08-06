export async function waitForDatabase(
	HealthCheckCallback: () => Promise<void>,
	{
		maxRetries = 10,
		delay = 1000,
		exponentialBackoff = true,
		maxDelay = 5000
	}: WaitForDatabaseOptions = {}
): Promise<void | never> {
	let retries = 0
	let currentDelay = delay

	while (retries < maxRetries) {
		try {
			await HealthCheckCallback()
			console.log(`Database is ready after ${retries} attempts`)
			return
		} catch (err) {
			retries++
			
			if (retries >= maxRetries) {
				throw new Error(`Database not ready after ${maxRetries} attempts: ${err}`)
			}

			console.log(
				`Database not ready, retrying in ${currentDelay}ms... ` +
				`(attempt ${retries}/${maxRetries})`
			)

			await new Promise(resolve => setTimeout(resolve, currentDelay))

			if (exponentialBackoff) {
				currentDelay = Math.min(currentDelay * 1.5, maxDelay)
			}
		}
	}
}

export interface WaitForDatabaseOptions {
	maxRetries?: number
	delay?: number
	exponentialBackoff?: boolean
	maxDelay?: number
}