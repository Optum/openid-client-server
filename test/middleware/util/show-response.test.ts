import {ServerResponse} from 'http'
import {showResponse} from '../../../src/middleware/util'
import {stubInterface} from 'ts-sinon'
import test from 'ava'

test('sendJsonResponse should set location as expected', t => {
    const resStub = stubInterface<ServerResponse>()
    const testPayload = '<html></html>'
    const testStatus = 200

    showResponse(testStatus, testPayload, resStub)

    t.is(resStub.statusCode, testStatus)
    t.true(resStub.end.calledOnce)
    t.is(resStub.end.args[0][0], testPayload)
})
