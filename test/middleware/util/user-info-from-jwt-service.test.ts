import type {GetPublicKeyOrSecret, Secret, VerifyCallback} from 'jsonwebtoken'
import sinon, {stubInterface} from 'ts-sinon'

import type jwksClient from 'jwks-rsa'
import test from 'ava'
import {v4 as uuid} from 'uuid'
import {createUserInfoFromJwtService} from '../../../src/middleware/util'

const jwtVerifyStub = sinon
    .stub()
    .callsFake(
        (
            token: string,
            secretOrPublicKey: Secret | GetPublicKeyOrSecret,
            callback?: VerifyCallback
        ): void => {
            try {
                const jwtParts = token.split('.')
                const header = JSON.parse(
                    Buffer.from(jwtParts[0], 'base64').toString('utf8')
                )
                const body = JSON.parse(
                    Buffer.from(jwtParts[1], 'base64').toString('utf8')
                )

                const getKey = secretOrPublicKey as GetPublicKeyOrSecret

                const signingKeyCallback = (
                    error: any,
                    signingKey?: Secret
                ): void => {
                    if (error) {
                        throw error
                    }

                    if (!signingKey) {
                        throw new Error('no signing key provide')
                    }

                    if (callback) {
                        callback(error, body)
                    }
                }

                getKey(header, signingKeyCallback)
            } catch (error) {
                throw error
            }
        }
    )

type JwtParts = {
    header: any
    body: any
    signature: string
}

const buildTestJwt = (jwtParts: JwtParts): string => {
    const headerBase64 = Buffer.from(JSON.stringify(jwtParts.header)).toString(
        'base64'
    )
    const bodyBase64 = Buffer.from(JSON.stringify(jwtParts.body)).toString(
        'base64'
    )
    const signatureBase64 = Buffer.from(
        JSON.stringify(jwtParts.signature)
    ).toString('base64')
    return [headerBase64, bodyBase64, signatureBase64].join('.')
}

test('userInfoFromJwt should return jwt body as json', async t => {
    const iat = Date.now() / 1000
    const dt = new Date()
    dt.setMinutes(dt.getMinutes() + 10)
    const exp = dt.getTime() / 1000

    const testJwtParts: JwtParts = {
        header: {
            typ: 'JWT',
            alg: 'RS256',
            kid: uuid().split('-')[0]
        },
        body: {
            aud: 'api://test-audience',
            iss: 'https://test-auth-issuer',
            iat,
            exp,
            appid: uuid(),
            family_name: 'Joe',
            given_name: 'Mary',
            name: 'Joe, Mary',
            sub: uuid(),
            unique_name: 'mary.joe@email.test',
            upn: 'mary.joe@email.test'
        },
        signature: 'asdfasdfasdf123412341234'
    }

    const jwksClientStub = stubInterface<jwksClient.JwksClient>()
    const signingKeyStub = stubInterface<jwksClient.SigningKey>()
    signingKeyStub.getPublicKey.returns('test-key')
    jwksClientStub.getSigningKey.callsFake(
        (
            kid: string,
            cb: (error: Error | null, key: jwksClient.SigningKey) => void
        ): void => {
            t.is(kid, testJwtParts.header.kid)
            cb(null, signingKeyStub)
        }
    )

    const testJwt = buildTestJwt(testJwtParts)

    const {userInfoFromJwt} = createUserInfoFromJwtService(
        jwksClientStub,
        jwtVerifyStub
    )

    const jwtJsonBody = await userInfoFromJwt(testJwt)

    t.true(jwtVerifyStub.calledOnce)
    t.is(JSON.stringify(jwtJsonBody), JSON.stringify(testJwtParts.body))
})
