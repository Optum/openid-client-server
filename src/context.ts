import {IncomingMessage, ServerResponse} from 'http'

import {Logger} from 'pino'
import {TokenSet} from 'openid-client'
import {UrlWithParsedQuery} from 'url'

export interface Context {
    req: IncomingMessage
    res: ServerResponse
    url: UrlWithParsedQuery
    log: Logger
    sessionId: string | null
    tokenSet: TokenSet | null
    done: boolean
}

export const createContext = (
    req: IncomingMessage,
    res: ServerResponse,
    url: UrlWithParsedQuery,
    log: Logger
): Context => {
    return {
        req,
        res,
        url,
        log,
        sessionId: null,
        tokenSet: null,
        done: false
    }
}
