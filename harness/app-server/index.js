const path = require('path')
const fs = require('fs')
const {AppType, createOCSServer} = require('../../dist')

const next = require('next')

const port = Number.parseInt(process.env.NEXT_SERVER_PORT || '8080', 10)
const development = process.env.NODE_ENV !== 'production'
const app = next({
    dev: development,
    quiet: development,
    dir: path.join(__dirname, '..', 'app')
})

createOCSServer(
    // FastifyServer Options
    {
        logger: {level: 'error'}
    },
    // OpenIDClientServer Options
    {
        appType: AppType.NEXTJS,
        dev: development,
        clientMetadata: {
            client_id: process.env.OPENID_CLIENT_ID,
            client_secret: process.env.OPENID_CLIENT_SECRET,
            redirect_uris: [
                process.env.OPENID_REDIRECT_URI ||
                    'http://localhost:8080/openid/callback'
            ],
            response_types: ['code']
        },
        openidRoutes: {
            signedOut: '/'
        },
        proxyOptions: [
            {
                upstream: 'http://localhost:3000',
                prefix: '/api',
                useIdToken: true // optional
            }
        ],
        sessionOptions: {
            cookieName: process.env.OPENID_SESSION_NAME,
            key: fs.readFileSync(path.join(process.cwd(), 'secret-session-key')),
            cookie: {
                httpOnly: true,
                path: '/',
                sameSite: 'strict'
            }
        },
        securedPaths: {
            securedPaths: ['/books', '/books/(.*)', '/user', '/user/(.*)'],
            // securedAsAllowedPaths: true
            useStartsWithCompare: true
        },
        scope: 'openid profile offline_access',
        enableCodeChallenge: true,
        issuer: process.env.OPENID_ISSUER,
        resolveContentHandler: async () => {
            await app.prepare()
            return app.getRequestHandler()
        }
    }
).listen(port, (error, address) => {
    if (error) throw error
    console.log(`🚀  App Server ready at ${address}`)
})
