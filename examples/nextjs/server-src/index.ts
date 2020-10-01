import fastify from 'fastify'
import ocs, {AppType, ContentHandler, OCSOptions} from '../../../dist'

import next from 'next'

const port = Number.parseInt(process.env.NEXT_SERVER_PORT ?? '8080', 10)
const development = process.env.NODE_ENV !== 'production'
const app = next({dev: development})
const handle = app.getRequestHandler()

// 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
const server = fastify({
    logger: {level: 'warn'}
})

const ocsOptions: OCSOptions = {
    appType: AppType.NEXTJS,
    dev: development,
    issuer: 'https://example.idp.com/',
    clientMetadata: {
        client_id: 'CLIENT_ID_HERE',
        client_secret:
            'CLIENT_SECRET_HERE',
        redirect_uris: ['http://localhost:8080/openid/callback'],
        response_types: ['code']
    },
    scope: 'openid profile offline_access',
    enableCodeChallenge: true,
    signedOutPage: '/',
    proxyOptions: [{
        upstream: 'http://localhost:3000',
        prefix: '/api',
        useIdToken: true // optional
    }],
    sessionOptions: {
        sessionName: 'example-app-session',
        sessionKeys: ['SESSION_KEYS_HERE'],
        sameSite: 'strict'
    },
    resolveContentHandler: async (): Promise<ContentHandler> => {
        await app.prepare()
        return handle
    }
}

server.register(ocs, ocsOptions)

server.listen(port, (error, address) => {
    if (error) throw error
    console.log(`🚀  Web App Server ready at ${address}`)
})
