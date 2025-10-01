export default interface ICacheDB {
	// connect(): Promise<void>
	disconnect(): Promise<void>
	isConnected(): boolean
	increment(key: string, props: {
		expires: number,
		slidingWindow?: boolean
	}): Promise<number>
	get(key: string): Promise<string | null>
	has(key: string): Promise<boolean>
	set(key: string, value: string, props: {
		expires: number,
		replace?: boolean
	}): Promise<void>
	delete(key: string): Promise<void>
	clear(): Promise<void>
}