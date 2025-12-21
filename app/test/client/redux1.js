import { createStore } from '../helpers/server.js'
import rootReducer from '../../src/client/reducers/index.js'
import { ALERT_POP, alert } from '../../src/client/actions/alert.js'
import { expect } from "chai"

const MESSAGE = "message"

describe('Fake redux test', function () {
    it('alert it', function (done) {
        const initialState = {}
        const store = createStore(rootReducer, null, initialState, {
            ALERT_POP: ({ dispatch, getState }) => {
                const state = getState()
                expect(state.message).to.equal(MESSAGE)
                done()
            }
        })
        store.dispatch(alert(MESSAGE))
    });
});
