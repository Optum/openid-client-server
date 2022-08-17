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

Example contentHandler with "server-handler"

```ts
import handle from "serve-handler";

const port = parseInt(process.env.SERVER_PORT ?? "8080", 10);

// serve handler for current directory to serve as static content
const contentHandler = async (
    req: IncomingMessage,
    res: ServerResponse
): Promise<void> => {
    handle(req, res, {
        headers: [
            {
                source: "**/*.*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "max-age=0",
                    },
                ],
            },
        ],
    });
};
```
