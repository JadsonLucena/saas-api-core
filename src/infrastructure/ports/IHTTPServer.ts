import http from 'node:http'
import https from 'node:https'
import http2 from 'node:http2'

export const ExitStatus = {
  SUCCESS: 0,
  FAILURE: 1
} as const
export type ExitStatus = typeof ExitStatus[keyof typeof ExitStatus]

export type IServer = http.Server | http2.Http2Server
export type ISecureServer = https.Server | http2.Http2SecureServer

export interface IHTTPServer {
	connectionsCount(): number
	start(): Promise<void>
	stop(): Promise<void>
}