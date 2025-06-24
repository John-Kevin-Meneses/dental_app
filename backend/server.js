const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/database');

dotenv.config();

const app = express();

// Enhanced CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173', // Your local dev frontend
  'http://localhost:5174', // Your local dev frontend
  'https://dental-app-oxff.onrender.com', // Your production frontend
  'https://dental-app-frontend.onrender.com' // Alternative production URL
].filter(Boolean); // Remove any undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // Cache preflight response for 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes

// Rest of your server configuration...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach pool to app
app.locals.pool = pool;

// DB Test
(async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL');
    
    // Initialize database tables if they don't exist
    await initDB();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  }
})();

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'Patient',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables verified');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', require('./routes/authRoutes')); // Add this line
app.use('/api/dentists', require('./routes/dentistRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/users', require('./routes/userRoutes')); 
app.use('/api/appointments', require('./routes/appointmentRoutes')); 
 
// Health Check
app.get('/api/health', (_, res) => res.status(200).json({ status: 'ok' }));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));