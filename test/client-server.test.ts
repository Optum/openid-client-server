import type {IncomingMessage, ServerResponse} from 'http'
import sinon from 'ts-sinon'
import test from 'ava'
import * as requestListener from '../src/request-listener'
import {clientServer} from '../src/client-server'
import {MemorySessionStore} from '../src'
import {testOptions} from './helpers/test-options'

test('clientServer should create server and pass through expected options', async t => {
    const createRequestListenerStub = sinon
        .stub(requestListener, 'createRequestListener')
        .resolves(
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            (_request: IncomingMessage, _response: ServerResponse): void => {}
        )

    const server = await clientServer({coreOptions: testOptions})

    t.truthy(server)
    t.true(createRequestListenerStub.calledOnce)
    t.is(createRequestListenerStub.getCall(0).args[0], testOptions)
    t.true(
        createRequestListenerStub.getCall(0).args[1] instanceof
            MemorySessionStore
    )
    t.is(createRequestListenerStub.getCall(0).args[2], undefined)
})
