const initialState = {
    connected: false,
    error: null,
};

const connectionReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'connection/connected':
            return { ...state, connected: true, error: null };

        case 'connection/disconnected':
            return { ...state, connected: false };

        case 'connection/error':
            return { ...state, error: action.payload };

        default:
            return state;
    }
};

export default connectionReducer;
