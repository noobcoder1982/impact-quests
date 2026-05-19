const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

// Set security HTTP headers - allow cross-origin resource sharing
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS with dynamic local IP & localhost support for dev
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    // Allow any localhost, 127.0.0.1, or local area network (192.168.x.x) during development
    const isLocal = origin.startsWith('http://localhost:') || 
                    origin.startsWith('http://127.0.0.1:') || 
                    /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin);
                    
    if (isLocal || origin === process.env.CORS_ORIGIN || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting - prevent brute force / DDoS
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─────────────────────────────────────────────
// BODY PARSING MIDDLEWARE
// ─────────────────────────────────────────────

app.use(express.json({ limit: '10kb' })); // Body limit to prevent large payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─────────────────────────────────────────────
// LOGGING
// ─────────────────────────────────────────────

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Resource Allocation API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

const routes = require('./routes');
app.use('/api/v1', routes);

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

module.exports = app;
