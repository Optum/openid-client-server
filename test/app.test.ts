import * as ocs from '../src'

const {describe, it} = intern.getPlugin('interface.bdd')
const {expect} = intern.getPlugin('chai')

describe('ocs module', () => {
    it('should be defined', () => {
        expect(ocs).to.not.be.undefined
    })
})
