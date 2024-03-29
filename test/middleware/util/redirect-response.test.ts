import type {ServerResponse} from 'http'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {redirectResponse} from '../../../src/middleware/util'

test('redirectResponse should set location as expected', t => {
    const resStub = stubInterface<ServerResponse>()
    const testLocation = '/unit-test-location'

    redirectResponse(testLocation, resStub)

    t.is(resStub.writeHead.args[0][1]?.Location, testLocation)
    t.true(resStub.end.calledOnce)
})
