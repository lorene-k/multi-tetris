import { configureStore } from '../helpers/server'
import rootReducer from '../../src/client/reducers'
import { ALERT_POP, alert } from '../../src/client/actions/alert'
import chai, { expect } from "chai"

const MESSAGE = "message"

describe('Fake redux test', function () {
    it('alert it', function (done) {
        const initialState = {}
        const store = configureStore(rootReducer, null, initialState, {
            ALERT_POP: ({ dispatch, getState }) => {
                const state = getState()
                expect(state.message).to.equal(MESSAGE)
                done()
            }
        })
        store.dispatch(alert(MESSAGE))
    });
});
