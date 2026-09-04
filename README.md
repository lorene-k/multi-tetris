# Red Tetris

A multiplayer Tetris game built with a Full Stack JavaScript stack: Node.js + socket.io on the server, React + Redux on the client.

## Stack

- **Server** — Node.js, socket.io, prototype-based OOP (`Player`, `Piece`, `Game`)
- **Client** — React 18, Redux Toolkit, React Router, socket.io-client (no `this`, no Canvas/SVG/jQuery)
- **Shared** — pure, immutable Tetris engine (board, pieces, rules, rotations)
- **Tests** — Mocha, Chai, Sinon · **92%+ coverage** across statements, branches, functions, and lines

## Getting Started

### Prerequisites

```bash
npm install
```

### 1. Build the client

```bash
npm run client-dist
```

This compiles the React app into `src/client/dist/`.

### 2. Start the server

```bash
npm run srv-dev      # development (nodemon + debug logs)
# or
npm run srv-dist     # production
```

The server runs at **http://localhost:3004** by default (configurable in `params.js`).

### 3. Play

Open `http://localhost:3004/<room>/<your_name>` in a browser, or navigate to `/` and fill in the form.

- The **first player** to join a room becomes the host and can start the game.
- Multiple rooms run concurrently.
- Once a game is started, new players must wait for the next round.

**Controls:** `← →` move · `↑` rotate · `↓` soft drop · `Space` hard drop

## Running Tests

```bash
npm test
```

### Coverage report

```bash
npm run coverage
```

Coverage targets (all met):

| Metric     | Required | Actual |
|------------|----------|--------|
| Statements | ≥ 70%    | ~93%   |
| Functions  | ≥ 70%    | ~95%   |
| Lines      | ≥ 70%    | ~93%   |
| Branches   | ≥ 50%    | ~92%   |

## Project Structure

```
src/
├── shared/tetris/     # Pure game engine (shared by client and server)
├── server/
│   ├── classes/       # Player, Piece, Game (prototype-based OOP)
│   ├── game/          # gameLoop, applyInput, step
│   └── index.js       # HTTP + socket.io server
└── client/
    ├── pages/         # Home, Game (React)
    ├── components/    # Board, Spectrum, NextPiece
    ├── reducers/      # Redux slices
    └── socket/        # socket.io client wrapper

test/
├── shared/            # Pure engine unit tests
└── server/            # Game, Player, Piece, gameLoop, server integration
```
