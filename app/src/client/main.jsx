import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style/index.css';
import App from './App.jsx';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { storeStateMiddleWare } from './middleware/storeStateMiddleWare.js';
import reducer from './reducers/index.js';
import { alert } from './actions/alert.js';
import { BrowserRouter } from "react-router";

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(storeStateMiddleWare),
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </StrictMode>,
)

store.dispatch(alert('Soon, will be here a fantastic Tetris ...'));