import {Client, IssuerMetadata} from 'openid-client'
import {
    GetPublicKeyOrSecret,
    Secret,
    VerifyCallback,
    verify as jwtVerify
} from 'jsonwebtoken'
import createAsyncPipe, {Pipeline} from 'p-pipe'
import {createUserInfoFromJwtService, withBreaker} from './util'

import {Context} from '../context'
import {OpenIdClientMiddleware} from './types'
import {Options} from '../options'
import {SessionStore} from '../session'
import {callbackMiddleware} from './callback-middleware'
import {cookiesMiddleware} from './cookies-middleware'
import jwksClient from 'jwks-rsa'
import ms from 'ms'
import {processCallbackMiddleware} from './process-callback-middleware'
import {proxyMiddleware} from './proxy-middleware'
import {signInMiddleware} from './signin-middleware'
import {signOutMiddleware} from './signout-middleware'
import {userInfoMiddleware} from './userinfo-middleware'

export const createMiddleware = (
    issuerMetadata: IssuerMetadata,
    client: Client,
    options: Options,
    sessionStore: SessionStore
): Pipeline<Context, Context> => {
    const {clientServerOptions, proxyOptions} = options
    const {
        signInPath,
        callbackPath,
        userInfoPath,
        signOutPath,
        processCallbackPath
    } = clientServerOptions

    if (!issuerMetadata.jwks_uri && !options.clientServerOptions.enableOauth2) {
        throw new Error('issuer must support jwks_uri')
    }

    const userInfoFromJwtService = createUserInfoFromJwtService(
        jwksClient({
            cache: true,
            cacheMaxEntries: 5,
            cacheMaxAge: ms('8hr'),
            jwksUri: String(issuerMetadata.jwks_uri)
        }),
        (
            token: string,
            secretOrPublicKey: Secret | GetPublicKeyOrSecret,
            callback?: VerifyCallback
        ): void => jwtVerify(token, secretOrPublicKey, callback)
    )

    const coreMiddlewares: OpenIdClientMiddleware[] = [
        withBreaker(
            cookiesMiddleware(options, sessionStore),
            options,
            'cookieMiddleware'
        ),
        withBreaker(
            signInMiddleware(client, signInPath, options, sessionStore),
            options,
            'signInMiddleware'
        ),
        withBreaker(
            callbackMiddleware(
                client,
                callbackPath,
                processCallbackPath,
                options
            ),
            options,
            'callbackMiddleware'
        ),
        withBreaker(
            processCallbackMiddleware(
                client,
                processCallbackPath,
                options,
                sessionStore
            ),
            options,
            'processCallbackMiddleware'
        ),
        withBreaker(
            signOutMiddleware(signOutPath, options, sessionStore),
            options,
            'signOutMiddleware'
        ),
        withBreaker(
            userInfoMiddleware({
                client,
                pathname: userInfoPath,
                sessionStore,
                options,
                userInfoFromJwtService
            }),
            options,
            'userInfoMiddleware'
        )
    ]

    const corePipeline = createAsyncPipe(...coreMiddlewares) as Pipeline<
        Context,
        Context
    >

    const proxyMiddlewares: OpenIdClientMiddleware[] = []

    if (proxyOptions.proxyPaths.length === proxyOptions.proxyHosts.length) {
        let excludeCookie = false
        let useIdToken = false
        const includeCookieFlag = proxyOptions.excludeCookie
            ? proxyOptions.proxyPaths.length ===
              proxyOptions.excludeCookie.length
            : false
        const includeUseIdTokenFlag = proxyOptions.excludeCookie
            ? proxyOptions.proxyPaths.length ===
              proxyOptions.excludeCookie.length
            : false
        for (let i = 0; i < proxyOptions.proxyPaths.length; i++) {
            const proxyHost = proxyOptions.proxyHosts[i]
            const proxyPath = proxyOptions.proxyPaths[i]

            if (includeCookieFlag) {
                excludeCookie = proxyOptions.excludeCookie[i]
            }

            if (includeUseIdTokenFlag) {
                useIdToken = proxyOptions.useIdToken[i]
            }

            proxyMiddlewares.push(
                withBreaker(
                    proxyMiddleware({
                        host: proxyHost,
                        pathname: proxyPath,
                        excludeCookie,
                        useIdToken,
                        sessionStore,
                        client
                    }),
                    options,
                    `proxyMiddleware ${proxyPath}:${proxyHost}`
                )
            )
        }
    }

    if (proxyMiddlewares.length !== 0) {
        const proxyPipeline = createAsyncPipe(...proxyMiddlewares) as Pipeline<
            Context,
            Context
        >

        return createAsyncPipe(corePipeline, proxyPipeline)
    }

    return corePipeline
}
