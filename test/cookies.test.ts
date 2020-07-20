import http, {IncomingMessage, ServerResponse} from 'http'
import sinon, {stubInterface} from 'ts-sinon'

import {SessionOptions} from '../src/options'
import {ensureCookies} from '../src/cookies'
import test from 'ava'

test('ensureCookies should throw an error when sessionKeys length is not greater than 1', t => {
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()
    const sessionStub = stubInterface<SessionOptions>()

    t.throws(() => ensureCookies(reqStub, resStub, sessionStub), {
        message: 'sessionKeys are required'
    })
})

test('ensureCookies should create a sessionId with a length of 128', t => {
    const reqStub = stubInterface<IncomingMessage>()
    const resStub = stubInterface<ServerResponse>()

    const setHeaderStub = sinon
        .stub(http.OutgoingMessage.prototype, 'setHeader')
        .returns()

    const sessionStub = stubInterface<SessionOptions>()
    sessionStub.sameSite = true
    sessionStub.sessionKeys = ['unit-test-session-key']

    const sessionId = ensureCookies(reqStub, resStub, sessionStub)
    setHeaderStub.reset()

    t.is(sessionId.length, 128)
})
