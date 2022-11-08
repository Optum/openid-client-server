import {Request} from 'mock-http'
import test from 'ava'
import {parseBody} from '../../../src/middleware/util'

test('parseBody should resolve body from IncomingMessage as expected', async t => {
    const testBody = 'name=test&other=thing'
    const request = new Request({
        buffer: Buffer.from(testBody)
    })

    const body = await parseBody(request)

    t.is(testBody, body)
})
