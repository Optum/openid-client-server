import {ServerResponse} from 'http'
import {sendResponse} from '../../../src/middleware/util'
import {stubInterface} from 'ts-sinon'
import test from 'ava'

test('sendResponse should set location as expected', t => {
    const resStub = stubInterface<ServerResponse>()
    const testObj = {
        testValue: 'something'
    }

    const testPayload = JSON.stringify(testObj)
    const testContentLength = Buffer.byteLength(testPayload)
    const testContentType = 'application/json; charset=utf-8'
    const testStatus = 200

    sendResponse(
        testStatus,
        {
            'Content-Type': testContentType,
            'Content-Length': testContentLength
        },
        testPayload,
        resStub
    )

    t.is(resStub.writeHead.args[0][0], testStatus)
    t.is(resStub.writeHead.args[0][1]?.['Content-Type'], testContentType)
    t.is(resStub.writeHead.args[0][1]?.['Content-Length'], testContentLength)
    t.true(resStub.end.calledOnce)
    t.is(resStub.end.args[0][0], testPayload)
})
