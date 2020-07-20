import {Request} from 'mock-http'
import {parseBody} from '../../../src/middleware/util'
import test from 'ava'

test('parseBody should resolve body from IncomingMessage as expected', async t => {
    const testBody = 'name=test&other=thing'
    const req = new Request({
        buffer: Buffer.from(testBody)
    })

    const body = await parseBody(req)

    t.is(testBody, body)
})
