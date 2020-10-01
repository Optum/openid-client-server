import {IncomingMessage, ServerResponse} from 'http'

import Cookies from 'cookies'
import {v4 as uuid} from 'uuid'
import {replace} from 'ramda'
import {OCSSessionOptions} from './types'

export const ensureCookies = (
    request: IncomingMessage,
    res: ServerResponse,
    options: OCSSessionOptions
): string => {
    const {sessionName, sessionKeys, sameSite, path} = options

    const cookies = new Cookies(request, res, {keys: sessionKeys})
    let sessionId = cookies.get(sessionName, {signed: true})

    if (!sessionId) {
        sessionId = replace(/-/g, '', `${uuid()}${uuid()}`)
        cookies.set(sessionName, sessionId, {
            sameSite,
            httpOnly: true,
            path: path ?? '/',
            signed: true
        })
    }

    return sessionId
}
