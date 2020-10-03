const fastify = require('fastify')
const path = require('path')
const {AppType} = require('../../dist')
const openIdClientServer = require('../../dist')

const next = require('next')

const port = Number.parseInt(process.env.NEXT_SERVER_PORT || '8080', 10)
const development = process.env.NODE_ENV !== 'production'
const app = next({
    dev: development,
    quiet: development,
    dir: path.join(__dirname, '..', 'app')
})
const contentHandler = app.getRequestHandler()

const appServer = fastify({
    // 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'
    logger: {level: 'error'}
})

const ocsOptions = {
    appType: AppType.NEXTJS,
    dev: development,
    issuer: process.env.OPENID_ISSUER,
    clientMetadata: {
        client_id: process.env.OPENID_CLIENT_ID,
        client_secret: process.env.OPENID_CLIENT_SECRET,
        redirect_uris: [
            process.env.OPENID_REDIRECT_URI ||
                'http://localhost:8080/openid/callback'
        ],
        response_types: ['code']
    },
    scope: 'openid profile offline_access',
    enableCodeChallenge: true,
    signedOutPage: '/',
    proxyOptions: [
        {
            upstream: 'http://localhost:3000',
            prefix: '/api',
            useIdToken: true // optional
        }
    ],
    sessionOptions: {
        sessionName: process.env.OPENID_SESSION_NAME,
        sessionKeys: [process.env.OPENID_SESSION_KEY],
        sameSite: 'strict'
    },
    resolveContentHandler: async () => {
        await app.prepare()
        return contentHandler
    }
}

appServer.register(openIdClientServer, ocsOptions)

appServer.listen(port, (error, address) => {
    if (error) throw error
    console.log(`🚀  App Server ready at ${address}`)
})
