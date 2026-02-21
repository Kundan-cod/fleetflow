import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import driverRoutes from './routes/drivers.js';
import tripRoutes from './routes/trips.js';
import maintenanceRoutes from './routes/maintenance.js';
import fuelRoutes from './routes/fuel.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to req
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Client disconnected'));
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white;">
      <h1 style="color: #3b82f6;">🚀 FleetFlow API is Live</h1>
      <p style="color: #94a3b8;">All operational systems are GO.</p>
      <a href="/api/health" style="color: #3b82f6; text-decoration: none; margin-top: 20px; padding: 10px 20px; border: 1px solid #3b82f6; rounded: 8px;">Check API Health</a>
    </div>
  `);
});

// Connect to MongoDB and start server
const startServer = async () => {
  let mongoUri = process.env.MONGODB_URI;

  // Try connecting to external MongoDB first, fallback to in-memory
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected (external)');
  } catch {
    console.log('⚠️  External MongoDB not available, starting in-memory server...');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected (in-memory)');

    // Auto-seed in-memory DB
    const { default: seed } = await import('./seedFn.js');
    await seed();
    console.log('✅ Demo data seeded automatically');
  }

  httpServer.listen(PORT, () => {
    console.log(`🚀 FleetFlow API + Real-time running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('❌ Server start failed:', err.message);
  process.exit(1);
});
