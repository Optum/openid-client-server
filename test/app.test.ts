import plugin from '../src'

const {describe, it} = intern.getPlugin('interface.bdd')
const {expect} = intern.getPlugin('chai')

describe('ocs plugin', () => {
    it('should be defined as default module', () => {
        expect(plugin).to.not.be.undefined
    })
})
