import {pathFromReferer} from '../../../src/middleware/util'
import test from 'ava'

test('pathFromReferer should get path with or without qs', t => {
    const testQs1 = 'val1=123,val2=456'
    const testPath = '/resources'
    const testUrl1 = `http://unit-test.test${testPath}`
    const testUrl2 = `${testUrl1}?${testQs1}`

    const path1 = pathFromReferer(testUrl1)

    t.is(testPath, path1)

    const path2 = pathFromReferer(testUrl2)

    t.is(`${testPath}?${testQs1}`, path2)
})
