import type {ServerResponse} from 'http'
import {stubInterface} from 'ts-sinon'
import test from 'ava'
import {sendResponse} from '../../../src/middleware/util'

test('sendResponse should set location as expected', t => {
    const resStub = stubInterface<ServerResponse>()
    const testObject = {
        testValue: 'something'
    }

    const testPayload = JSON.stringify(testObject)
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
