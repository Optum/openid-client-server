import {Options, resolveOptions} from './options'
import {MemorySessionStore, SessionStore} from './session'
import {ContentHandler, createRequestListener} from './request-listener'
import {Server, createServer} from 'http'

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
