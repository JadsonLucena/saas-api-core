import { IncomingMessage, ServerResponse } from 'node:http'
import { Http2ServerRequest, Http2ServerResponse } from 'node:http2'

export type IRequest = IncomingMessage | Http2ServerRequest
export type IResponse = ServerResponse | Http2ServerResponse

export interface IServiceHandler {
	handler(req: IRequest, res: IResponse): void
}