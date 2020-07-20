require('dotenv').config()

import {
    MemorySessionStore,
    createRequestListener,
    resolveOptions
} from '../../../src'

import {createServer} from 'http'
import next from 'next'

const port = parseInt(process.env.NEXT_SERVER_PORT ?? '8080', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

/* eslint-disable promise/prefer-await-to-then */
const main = (): void => {
    app.prepare()
        .then(() => {
            // resolveOptions is a pure environment variable approach to building options
            // NOTE: this can be swapped out for any Options impl
            const options = resolveOptions()

            // NOTE: this can be swapped out for any SessionStore impl
            const sessionStore = new MemorySessionStore()

            // use OpenID RequestListener to handle all requests
            createRequestListener(options, sessionStore, handle)
                .then(requestListener => {
                    createServer(requestListener).listen(port, () => {
                        console.log(`> Ready on http://localhost:${port}`)
                    })
                })
                .catch(error => {
                    console.log('Failed to create & attache RequestListener')
                    console.error(error)
                })
        })
        .catch(error => {
            console.log('Next server failed to start')
            console.error(error)
        })
}
/* eslint-enable promise/prefer-await-to-then */

main()
