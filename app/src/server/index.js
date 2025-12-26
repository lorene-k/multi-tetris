import fs from 'fs';
import debug from 'debug';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { join, extname, dirname } from "path";

const mediaTypes = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".png": "image/png",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');
const clientDist = join(projectRoot, 'src/client/dist');

const logerror = debug('tetris:error')
    , loginfo = debug('tetris:info')

const initApp = (app, params, cb) => {
    const { host, port } = params

    const handler = (req, res) => {
        const filePath = req.url === "/"
            ? join(clientDist, "index.html")
            : join(clientDist, req.url);

        const ext = extname(filePath);
        const contentType = mediaTypes[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                logerror(err)
                res.writeHead(500)
                return res.end('Not found')
            }
            res.writeHead(200, { "Content-Type": contentType });
            res.end(data)
        })
    }

    app.on('request', handler)

    app.listen({ host, port }, () => {
        loginfo(`tetris listen on ${params.url}`)
        cb()
    })
}

const initEngine = io => {
    io.on('connection', function (socket) {
        loginfo("Socket connected: " + socket.id)
        socket.on('action', (action) => {
            if (action.type === 'server/ping') {
                socket.emit('action', { type: 'pong' })
            }
        })
    })
}

export async function create(params) {
    return new Promise((resolve, reject) => {
        const app = createServer();
        initApp(app, params, () => {
            const io = new Server(app);
            const stop = (cb) => {
                io.close();
                app.close(() => {
                    app.unref();
                });
                loginfo(`Engine stopped.`);
                cb();
            };
            initEngine(io);
            resolve({ stop });
        });
    });
}
