const initialState = [];

const opponentsReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'opponents/update':
            return action.payload || [];

        case 'game/started':
        case 'game/over':
            return [];

        default:
            return state;
    }
};

export default opponentsReducer;
