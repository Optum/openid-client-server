import type {IncomingMessage, ServerResponse} from 'http'

import type {UrlWithParsedQuery} from 'url'
import type {Logger} from 'pino'
import type {TokenSet} from 'openid-client'

export type Context = {
    req: IncomingMessage
    res: ServerResponse
    url: UrlWithParsedQuery
    log: Logger
    sessionId: string | undefined
    tokenSet: TokenSet | undefined
    done: boolean
}

export const createContext = (
    request: IncomingMessage,
    res: ServerResponse,
    url: UrlWithParsedQuery,
    log: Logger
): Context => {
    return {
        req: request,
        res,
        url,
        log,
        sessionId: undefined,
        tokenSet: undefined,
        done: false
    }
}
