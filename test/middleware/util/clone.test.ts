import {clone} from '../../../src/middleware/util'
import test from 'ava'

test('clone should create a plain object from a json string based on the original object', t => {
    const testObj = {
        something: 'thing1',
        somethingElse: 'thing2'
    }

    const testCloneObj = clone(testObj)

    t.false(testObj === testCloneObj)
    t.is(testCloneObj.something, testObj.something)
    t.is(testCloneObj.somethingElse, testObj.somethingElse)
})
