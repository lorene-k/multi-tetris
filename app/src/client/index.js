import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { storeStateMiddleWare } from './middleware/storeStateMiddleWare.js';
import reducer from './reducers/index.js';
import App from './containers/app.js';
import { alert } from './actions/alert.js';

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(storeStateMiddleWare),
});

const root = createRoot(document.getElementById('tetris'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

store.dispatch(alert('Soon, will be here a fantastic Tetris ...'));