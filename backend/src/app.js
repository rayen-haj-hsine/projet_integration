
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import tripsRoutes from './routes/trips.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import chatsRoutes from './routes/chats.routes.js'; // ✅ Add this import
import adminRoutes from './routes/admin.routes.js'; // ✅ Add this import
import ratingsRoutes from './routes/ratings.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/openapi.js';
import path from 'path';

dotenv.config();

const app = express(); // ✅ Must come BEFORE app.use()

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Serve uploads statically
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => res.send('TripShare API is running 🚀'));
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { swaggerOptions: { persistAuthorization: true } }));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // ✅ Admin routes
app.use('/api/trips', tripsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chats', chatsRoutes); // ✅ Now safe
app.use('/api/ratings', ratingsRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
