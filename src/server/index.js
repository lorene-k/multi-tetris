import debug from 'debug';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initApp } from './staticServer.js';
import { initEngine } from './game/gameEngine.js';
import { games } from './game/gameRegistry.js';

const loginfo = debug('tetris:info');

// ─── Public API ────────────────────────────────────────────────────────────

export async function create(params) {
    return new Promise((resolve, reject) => {
        const app = createServer();
        initApp(app, params, () => {
            const io = new Server(app, {
                cors: { origin: '*' },
            });
            const stop = (cb) => {
                io.close();
                app.close(() => { app.unref(); });
                loginfo('Engine stopped.');
                if (cb) cb();
            };
            initEngine(io);
            resolve({ stop });
        });
    });
}

// Expose games map for testing
export { games };
