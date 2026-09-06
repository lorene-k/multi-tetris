import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import rootReducer from './reducers/index.js';
import './style/index.css';

const store = configureStore({
    reducer: rootReducer,
});

// Expose state for tests
if (typeof window !== 'undefined') {
    store.subscribe(() => {
        window.__tetrisState = store.getState();
    });
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    </StrictMode>,
);

