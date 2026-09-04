const initialState = {
    name: '',
    room: '',
    isHost: false,
};

const playerReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'player/gameState':
            return {
                ...state,
                isHost: action.payload.isHost || false,
                name: action.payload.playerName || state.name,
                room: action.payload.room || state.room,
            };

        case 'player/setInfo':
            return {
                ...state,
                name: action.payload.name,
                room: action.payload.room,
            };

        case 'player/joined':
        case 'player/left':
            // Update host status if the lobby players list changed
            return state;

        default:
            return state;
    }
};

export default playerReducer;
