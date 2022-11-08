// eslint-disable-next-line node/no-deprecated-api
import {parse} from 'url'
import test from 'ava'
import {pathsMatch} from '../../../src/middleware/util'

test('pathsMatch should detect base path matches', t => {
    const testUrl = 'http://unit-test.test/resources/123/items/456'
    const testPath = '/resources'

    const match1 = pathsMatch(parse(testUrl, true), testPath)

    t.true(match1)

    const testPath2 = '/widgets'

    const match2 = pathsMatch(parse(testUrl, true), testPath2)

    t.false(match2)
})
