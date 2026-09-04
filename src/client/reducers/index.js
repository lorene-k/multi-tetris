import { combineReducers } from 'redux';
import gameReducer from './gameReducer.js';
import playerReducer from './playerReducer.js';
import opponentsReducer from './opponentsReducer.js';
import connectionReducer from './connectionReducer.js';

const rootReducer = combineReducers({
    game: gameReducer,
    player: playerReducer,
    opponents: opponentsReducer,
    connection: connectionReducer,
});

export default rootReducer;
