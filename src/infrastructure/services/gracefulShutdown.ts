export default async function gracefulShutdown() {
	console.info(`Shutting down gracefully...`, `Should terminate all tasks, save current state, call cleanup, and notify about interruption`)
}