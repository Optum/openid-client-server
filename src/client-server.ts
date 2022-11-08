import type {Server} from 'http'
import {createServer} from 'http'
import type {Options} from './options'
import {resolveOptions} from './options'
import type {SessionStore} from './session'
import {MemorySessionStore} from './session'
import type {ContentHandler} from './request-listener'
import {createRequestListener} from './request-listener'

export const clientServer = async (options: {
    coreOptions?: Options
    waitOn?: Promise<unknown>
    contentHandler?: ContentHandler
    sessionStore?: SessionStore
}): Promise<Server> => {
    const {contentHandler, waitOn} = options
    const coreOptions = options.coreOptions ?? resolveOptions()
    const sessionStore = options.sessionStore ?? new MemorySessionStore()

    const connectServer = async (): Promise<Server> => {
        if (waitOn) {
            await Promise.resolve(waitOn)
        }

        const requestListener = await createRequestListener(
            coreOptions,
            sessionStore,
            contentHandler
        )

        return createServer(requestListener)
    }

    return connectServer()
}
