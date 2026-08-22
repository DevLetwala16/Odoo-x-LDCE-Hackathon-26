import './config/env.js'; // Load + validate env vars FIRST
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import User from './models/User.js';
import { config } from './config/env.js';

// Route imports (uncomment as routes are created)
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import stopRoutes from './routes/stopRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import cityRoutes from './routes/cityRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import sharingRoutes from './routes/sharingRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Mount routers (uncomment as routes are created)
app.use('/api/auth',       authRoutes);
app.use('/api/trips',      tripRoutes);
app.use('/api/stops',      stopRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/cities',     cityRoutes);
app.use('/api/budget',     budgetRoutes);
app.use('/api/community',  communityRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/weather',    weatherRoutes);
app.use('/api/sharing',    sharingRoutes);
app.use('/api/calendar',   calendarRoutes);

// Central error handler (MUST be last middleware)
app.use(errorHandler);

// Connect to DB and start server
connectDB().then(async () => {
  // Ensure system admin exists
  try {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      await User.create({
        firstName: 'System',
        lastName: 'Admin',
        username: 'admin',
        email: 'admin@musafir.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Auto-created system administrator account (admin / admin123)');
    }
  } catch (err) {
    console.error('❌ Failed to auto-create admin user:', err.message);
  }

  app.listen(config.port, () => {
    console.log(`🚀 Server running on :${config.port} (${config.nodeEnv})`);
  });
});
