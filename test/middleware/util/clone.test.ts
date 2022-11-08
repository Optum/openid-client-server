import test from 'ava'
import {clone} from '../../../src/middleware/util'

test('clone should create a plain object from a json string based on the original object', t => {
    const testObject = {
        something: 'thing1',
        somethingElse: 'thing2'
    }

    const testCloneObject = clone(testObject)

    t.false(testObject === testCloneObject)
    t.is(testCloneObject.something, testObject.something)
    t.is(testCloneObject.somethingElse, testObject.somethingElse)
})
