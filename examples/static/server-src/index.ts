require('dotenv').config()

import {IncomingMessage, ServerResponse} from 'http'
import {clientServer} from '../../../src'

import handle from 'serve-handler'

const port = parseInt(process.env.NEXT_SERVER_PORT ?? '8080', 10)

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

clientServer({
    contentHandler: serveHandler
})
    .then(server =>
        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`)
        })
    )
    .catch(error => {
        console.log('Static content server failed to start')
        console.error(error)
    })
