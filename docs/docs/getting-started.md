---
id: getting-started
title: Getting Started
---

TypeScript

```ts
import fastify from "fastify";
import openIdClientServer, {
    AppType,
    ContentHandler,
    OCSOptions,
} from "@optum/openid-client-server";

const app = fastify();

const port = 8080;

const options: OCSOptions = {
    appType: AppType.STATIC,
    dev: development,
    issuer: "https://example.idp.com/",
    clientMetadata: {
        client_id: "CLIENT_ID_HERE",
        client_secret: "CLIENT_SECRET_HERE",
        redirect_uris: ["http://localhost:8080/openid/callback"],
        response_types: ["code"],
    },
    scope: "openid profile offline_access",
    enableCodeChallenge: true,
    signedOutPage: "/",
    proxyOptions: [
        {
            upstream: "http://localhost:3000",
            prefix: "/api",
            useIdToken: false, // optional
        },
    ],
    sessionOptions: {
        sessionName: "example-app-session",
        sessionKeys: ["SESSION_KEYS_HERE"],
        sameSite: "strict",
    },
    securedPaths: ["/dashboard"],
    resolveContentHandler: async (): Promise<ContentHandler> => {
        // create content handler and return
        return contentHandler;
    },
};

app.register(openIdClientServer, options);

server.listen(port, (error, address) => {
    if (error) throw error;
    console.log(`🚀  content ready at ${address}`);
});
```

JavaScript

```ts
const fastify = require("fastify");
const openIdClientServer = require("@optum/openid-client-server");

const app = fastify();

const port = 8080;

const options = {
    appType: AppType.STATIC,
    dev: development,
    issuer: "https://example.idp.com/",
    clientMetadata: {
        client_id: "CLIENT_ID_HERE",
        client_secret: "CLIENT_SECRET_HERE",
        redirect_uris: ["http://localhost:8080/openid/callback"],
        response_types: ["code"],
    },
    scope: "openid profile offline_access",
    enableCodeChallenge: true,
    signedOutPage: "/",
    proxyOptions: [
        {
            upstream: "http://localhost:3000",
            prefix: "/api",
            useIdToken: false, // optional
        },
    ],
    sessionOptions: {
        sessionName: "example-app-session",
        sessionKeys: ["SESSION_KEYS_HERE"],
        sameSite: "strict",
    },
    securedPaths: ["/dashboard"],
    resolveContentHandler: async () => {
        // create content handler and return
        return contentHandler;
    },
};

app.register(openIdClientServer, options);

server.listen(port, (error, address) => {
    if (error) throw error;
    console.log(`🚀  content ready at ${address}`);
});
```

Next.js

```ts
import fastify from 'fastify';
import openIdClientServer, {
    AppType,
    ContentHandler,
    OCSOptions,
} from "@optum/openid-client-server";

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

server.register(openIdClientServer, ocsOptions)

server.listen(port, (error, address) => {
    if (error) throw error
    console.log(`🚀  Web App Server ready at ${address}`)
})

```
