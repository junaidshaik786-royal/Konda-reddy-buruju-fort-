import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Real-time Multiplayer Logic
  io.on('connection', (socket) => {
    console.log('Warrior connected:', socket.id);

    socket.on('join-duel', (room) => {
      socket.join(room);
      console.log(`Warrior joined room: ${room}`);
      socket.to(room).emit('warrior-joined', { id: socket.id });
    });

    socket.on('player-move', (data) => {
      socket.to(data.room).emit('player-moved', data);
    });

    socket.on('disconnect', () => {
      console.log('Warrior departed:', socket.id);
    });
  });

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'Citadel Online' });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Empire established at http://localhost:${PORT}`);
  });
}

startServer();
