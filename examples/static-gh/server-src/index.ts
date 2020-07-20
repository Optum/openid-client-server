require('dotenv').config()

import {IncomingMessage, ServerResponse, createServer} from 'http'
import {
    MemorySessionStore,
    createRequestListener,
    resolveOptions
} from '../../../src'

import handle from 'serve-handler'

const port = parseInt(process.env.NEXT_SERVER_PORT ?? '8080', 10)

/* eslint-disable promise/prefer-await-to-then */
const main = (): void => {
    // resolveOptions is a pure environment variable approach to building options
    // NOTE: this can be swapped out for any Options impl
    const options = resolveOptions()

    // NOTE: this can be swapped out for any SessionStore impl
    const sessionStore = new MemorySessionStore()

    const serveHandler = async (
        req: IncomingMessage,
        res: ServerResponse
    ): Promise<void> => {
        handle(req, res, {
            headers: [
                {
                    source: '**/*.*',
                    headers: [
                        {
                            key: 'Cache-Control',
                            value: 'max-age=0'
                        }
                    ]
                }
            ]
        })
    }

    // use OpenID RequestListener to handle all requests
    createRequestListener(options, sessionStore, serveHandler)
        .then(requestListener => {
            createServer(requestListener).listen(port, () => {
                console.log(`> Ready on http://localhost:${port}`)
            })
        })
        .catch(error => {
            console.log('Failed to create & attache RequestListener')
            console.error(error)
        })
}
/* eslint-enable promise/prefer-await-to-then */

main()
