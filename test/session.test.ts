import sinon from 'ts-sinon'
import test from 'ava'
import {MemorySessionStore} from '../src/session'

test('MemorySessionStore should set new and patch as expected', async t => {
    const store = new MemorySessionStore()
    const getStub = sinon.stub(store, 'get').callThrough()
    const setStub = sinon.stub(store, 'set').callThrough()

    const testSessionId = 'unit-test-session-id'
    const testCreatedAt = Date.now()

    const testSession = {
        sesionId: testSessionId,
        createdAt: testCreatedAt
    }

    await store.set(testSessionId, testSession)

    t.true(getStub.calledOnce)
    t.true(setStub.calledOnce)

    let actualSession = await store.get(testSessionId)

    t.is(actualSession?.sessionId, testSessionId)

    await store.destroy(testSessionId)

    actualSession = await store.get(testSessionId)

    t.falsy(actualSession)
})
