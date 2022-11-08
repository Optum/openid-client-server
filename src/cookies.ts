import type {IncomingMessage, ServerResponse} from 'http'

import Cookies from 'cookies'
import crs from 'crypto-random-string'
import type {SessionOptions} from './options'

export const ensureCookies = (
    request: IncomingMessage,
    res: ServerResponse,
    {sessionName, sessionKeys, sameSite}: SessionOptions
): string => {
    if (!sessionKeys || sessionKeys.length === 0) {
        throw new Error('sessionKeys are required')
    }

    const cookies = new Cookies(request, res, {keys: sessionKeys})
    let sessionId = cookies.get(sessionName, {signed: true})

    if (!sessionId) {
        sessionId = crs({length: 128})
        cookies.set(sessionName, sessionId, {
            sameSite,
            httpOnly: true,
            path: '/',
            signed: true
        })
    }

    return sessionId
}

export const getSessionId = (
    request: IncomingMessage,
    res: ServerResponse,
    sessionName: string,
    sessionKeys: string[]
): string | undefined => {
    const cookies = new Cookies(request, res, {keys: sessionKeys})
    return cookies.get(sessionName, {
        signed: true
    })
}

export const clearCookies = (
    request: IncomingMessage,
    res: ServerResponse,
    {sessionName, sameSite}: SessionOptions
): void => {
    const cookies = new Cookies(request, res)
    cookies.set(sessionName, '', {
        sameSite,
        httpOnly: true,
        path: '/'
    })
    cookies.set(`${sessionName}.sig`, '', {
        sameSite,
        httpOnly: true,
        path: '/'
    })
}
