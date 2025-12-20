import chai, { expect } from "chai"
import React from 'react'
import equalJSX from 'chai-equal-jsx'
import { createRenderer } from 'react-addons-test-utils'
import { Tetris, Board } from '../../src/client/components/test'

chai.use(equalJSX)

describe('Fake react test', function () {
    it('rendres Board component', function () {
        const renderer = createRenderer()
        renderer.render(React.createElement(Tetris))
        const output = renderer.getRenderOutput()
        expect(output).to.equalJSX(<Board />)
    })

})
