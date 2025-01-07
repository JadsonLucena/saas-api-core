export default async function gracefulShutdown(signal: NodeJS.Signals) {
	console.info(`Received ${signal}. Shutting down gracefully...`, `Instance draining. Should terminate all tasks, save current state, call cleanup, and notify about interruption`)
}