# Multiplayer Tetris

A real-time multiplayer Tetris game built in JavaScript.  
It follows a strict client/server architecture where the server is authoritative and all
game rules are deterministic and testable. This project focuses on functional programming,
asynchronous systems, and scalable multiplayer design.


## Features
- Classic Tetris gameplay with original Tetrimino rules
- Solo and real-time multiplayer modes
- Deterministic piece distribution (server-authoritative)
- Live spectrum view of opponents’ boards
- Single Page Application (SPA)
- Functional, immutable game logic
- High unit-test coverage with automated testing

## Tech Stack
- **Language:** JavaScript (latest)
- **Client:** React, Redux
- **Server:** Node.js
- **Shared Logic:** Pure functional modules (no mutation)
- **Styling:** CSS Grid / Flexbox
- **Testing:** Mocha, Chai
- **Build Tools:** Webpack, Babel
- **Real-time Communication:** Socket.IO

## Usage
1. Install dependencies:
```bash
npm install
````

2. Start the server and client:
```bash
npm start
```

3. Open the game in your browser:
```bash
http://localhost:<port>/<room>/<player_name>
```

4. Run tests with coverage:
```bash
npm test
```