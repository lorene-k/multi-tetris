import { ALERT_POP } from '../actions/gameActions.js';

const alertReducer = (state = {}, action) => {
    switch (action.type) {
        case ALERT_POP:
            return { message: action.message };
        default:
            return state;
    }
};

export default alertReducer;
