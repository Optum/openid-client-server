import type {IncomingMessage, RequestListener, ServerResponse} from 'http'
import type {UrlWithParsedQuery} from 'url'
import {parse} from 'url'
import {EventEmitter} from 'events'
import type {Client} from 'openid-client'
import {Issuer} from 'openid-client'
import type {Logger} from 'pino'
import pino from 'pino'
import type {Context} from './context'
import {createContext} from './context'
// eslint-disable-next-line node/no-deprecated-api

import type {Options} from './options'
import type {SessionStore} from './session'
import {createMiddleware} from './middleware'
import {securePathCheckMiddleware} from './middleware/secure-path-check-middleware'

export const RequestListenerEvents = {
    STARTED: 'started',
    COMPLETED: 'completed',
    ERROR: 'error'
}

export const RequestListenerEventEmitter = new EventEmitter()

export type ContentHandler = (
    request: IncomingMessage,
    res: ServerResponse,
    parsedUrl?: UrlWithParsedQuery | undefined
) => Promise<void>

export const createRequestListener = async (
    options: Options,
    sessionStore: SessionStore,
    requestHandler?: ContentHandler
): Promise<RequestListener> => {
    const {
        clientServerOptions: {discoveryEndpoint, emitEvents},
        clientMetadata
    } = options
    let issuer: Issuer<Client>

    const emitEvent = (eventName: string, action?: any): void => {
        if (emitEvents) {
            RequestListenerEventEmitter.emit(eventName)
        }

        if (action) {
            action()
        }
    }

    if (options.clientServerOptions.enableOauth2) {
        issuer = new Issuer({
            issuer: 'oauth2',
            authorization_endpoint:
                options.clientServerOptions.authorizationEndpoint,
            token_endpoint: options.clientServerOptions.tokenEndpoint,
            userinfo_endpoint: options.clientServerOptions.userInfoEndpoint
        })
    } else {
        issuer = await Issuer.discover(discoveryEndpoint)
    }

    const client = new issuer.Client(clientMetadata)
    const {loggerOptions, loggerDestination} = options

    let log: Logger

    log = loggerDestination
        ? pino(loggerOptions, loggerDestination)
        : pino(loggerOptions)

    const middleware = createMiddleware(
        issuer.metadata,
        client,
        options,
        sessionStore
    )

    const securePathCheck = securePathCheckMiddleware(
        options,
        sessionStore,
        client
    )

    log.debug(
        `PKCE ${
            options.clientServerOptions.enablePKCE ? 'enabled' : 'disabled'
        }`
    )

    log.debug(
        `Oauth2 ${
            options.clientServerOptions.enableOauth2 ? 'enabled' : 'disabled'
        }`
    )

    /* eslint-disable promise/prefer-await-to-then */
    return (request: IncomingMessage, res: ServerResponse): void => {
        emitEvent(RequestListenerEvents.STARTED)
        if (request.url) {
            const parsedUrl = parse(request.url, true)

            middleware(createContext(request, res, parsedUrl, log))
                .then(async (ctx: Context) => {
                    if (ctx.done) {
                        log.info(
                            `Context indicates 'done'. Skipping requestHandler for pathname ${String(
                                parsedUrl.pathname
                            )}`
                        )
                        emitEvent(RequestListenerEvents.COMPLETED)
                    } else if (requestHandler) {
                        try {
                            const passToHandler = await securePathCheck(ctx)
                            if (passToHandler) {
                                log.debug(
                                    `invoking requestHandler with parsedQuery pathname ${String(
                                        parsedUrl.pathname
                                    )} for session ${String(ctx.sessionId)}`
                                )
                                await requestHandler(request, res, parsedUrl)
                                emitEvent(RequestListenerEvents.COMPLETED)
                            } else {
                                log.debug(
                                    'secure path check indicated to not pass request to handler'
                                )
                                emitEvent(RequestListenerEvents.COMPLETED)
                            }
                        } catch (error) {
                            log.error(error)
                            emitEvent(RequestListenerEvents.ERROR)
                        }
                    } else {
                        log.debug(
                            "Context indicates 'not done' and no request handler was provided"
                        )
                        emitEvent(RequestListenerEvents.COMPLETED)
                    }
                })
                .catch(error => {
                    emitEvent(RequestListenerEvents.ERROR, () => {
                        log.error(error)
                    })
                })
        } else if (requestHandler) {
            log.debug('req url not defined. invoking requestHandler')
            requestHandler(request, res)
                .then(() => {
                    log.debug('requestHandler complete')
                })
                .then(() => {
                    emitEvent(RequestListenerEvents.COMPLETED)
                })
                .catch(error => {
                    emitEvent(RequestListenerEvents.ERROR, () => {
                        log.error(error)
                    })
                })
        } else {
            log.debug('req url & requestHandler not defined')
            emitEvent(RequestListenerEvents.COMPLETED)
        }
    }
    /* eslint-enable promise/prefer-await-to-then */
}
