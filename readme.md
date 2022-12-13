<p>
    <h2 align="center">openid-client-server</h2>
</p>

<p align="center">
    An OpenId Relying Party (RP, Client) application server.
</p>

<p align="center">
    <a href="https://openid.net/">
        <img src=".github/assets/oidc-client-server.svg" title="openid" width="100%" />
    </a>
</p>

<p align="center">
    This module leverages the <a href="https://www.npmjs.com/package/openid-client">openid-client</a> module to implement a web server that secures any Web UI framework that can be hosted by <a href="https://nodejs.org/en/">Node.js</a> with Authorization Code Flow (optional <a href="https://tools.ietf.org/html/rfc7636">Proof Key</a>), Implicit Flow or Hybrid Flow. The module also provides configurable proxy endpoints that include the user token automatically in requests to API endpoints, as well a session management making it easier to create Web UI's that are "secure by default".
</p>

<p align="center">
    <a href="https://www.typescriptlang.org/">
        <img src="https://badgen.net/badge/icon/typescript?icon=typescript&label" title="Built with TypeScript" />
    </a>
    <a href="https://github.com/xojs/xo">
        <img src="https://img.shields.io/badge/code_style-XO-5ed9c7.svg" title="XO code style" />
    </a>
</p>

## Install

with npm

```console
$ npm install @optum/openid-client-server
```

with yarn

```console
$ yarn add @optum/openid-client-server
```

## Usage

### Options

The `resolveOptions` function will leverage environmental variables to auto-build all options with defaults. It can be required in the server setup module via `import {resolveOptions} from '@optum/openid-client-server`.

> For more info see the [.env.example](.env.example) file

### clientServer

Use the `clientServer` function to create a `http` server with an integrated [openid-client](https://www.npmjs.com/package/openid-client) and all features in [@optum/openid-client-server](https://www.npmjs.com/package/@optum/openid-client-server).

> With a Promise

```ts
import {IncomingMessage, ServerResponse} from 'http'
import {clientServer} from '@optum/openid-client-server'

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
```

> With a Async Await

```ts
import {IncomingMessage, ServerResponse} from 'http'
import {clientServer} from '@optum/openid-client-server'

import handle from 'serve-handler'

const port = parseInt(process.env.NEXT_SERVER_PORT ?? '8080', 10)

;(async (): Promise<void> => {
    try {
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

        const server = await clientServer({contentHandler: serveHandler})

        server.listen(port, () => {
            console.log(`> Ready on http://localhost:${port}`)
        })
    } catch (error) {
        console.log('Static content server failed to start')
        console.error(error)
    }
})()
```

> For a [Next.js](https://nextjs.org/) example, see: [examples/nextjs](./examples/nextjs) file

## Background

The original goal of this module was to provide as easy way to implement OpenID flows with [Next.js](https://nextjs.org/) applications via a [custom Next.js](https://nextjs.org/docs/advanced-features/custom-server) server. There were issues leveraging frameworks like [Koa.js](https://koajs.com/) for "easy wins" in session management and out-of-the-box middleware, so tides turned to using Node's core [`http`](https://nodejs.org/api/http.html) module. The result ended up working for any Web UI that could be served by Node.js, so here we are.

## Development

### Environment

<p>
  <ul>
    <li>
        Node.js is required to develop this module. Please install the latest <a href="https://nodejs.org/en/">LTS</a> version if you haven't already.
    </li>
    <li>
        Module dependencies are managed with Yarn. Please install it if you haven't already.
        <pre>$ npm i -g yarn</pre>
    </li>
  </ul>
</p>

### Editors

**VS Code**

-   [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

**IntelliJ**

-   [Prettier](https://www.jetbrains.com/help/idea/prettier.html)
