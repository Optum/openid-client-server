require('dotenv').config()

import {clientServer} from '../../../src'

import next from 'next'

const port = parseInt(process.env.NEXT_SERVER_PORT ?? '8080', 10)
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

clientServer({
    waitOn: app.prepare(),
    contentHandler: handle
})
    .then(server =>
        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`)
        })
    )
    .catch(error => {
        console.log('Next server failed to start')
        console.error(error)
    })
