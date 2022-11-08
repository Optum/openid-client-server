import type {IncomingMessage, ServerResponse} from 'http'
import http from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import test from 'ava'
import type {SessionOptions} from '../src/options'
import {ensureCookies} from '../src/cookies'

test('ensureCookies should throw an error when sessionKeys length is not greater than 1', t => {
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const sessionStub = stubInterface<SessionOptions>()

    t.throws(() => ensureCookies(requestStub, resStub, sessionStub), {
        message: 'sessionKeys are required'
    })
})

test('ensureCookies should create a sessionId with a length of 128', t => {
    const requestStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()

    const setHeaderStub = sinon
        .stub(http.OutgoingMessage.prototype, 'setHeader')
        .returns()

    const sessionStub = stubInterface<SessionOptions>()
    sessionStub.sameSite = true
    sessionStub.sessionKeys = ['unit-test-session-key']

    const sessionId = ensureCookies(requestStub, resStub, sessionStub)
    setHeaderStub.reset()

    t.is(sessionId.length, 128)
})
