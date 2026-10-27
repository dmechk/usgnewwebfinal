const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const env = require('./config/env');
const AppError = require('./utils/appError');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const openapi = require('./docs/openapi');

const app = express();

// Configure trusted proxy to reliably resolve real client IP addresses
if (env.TRUST_PROXY) {
  app.set('trust proxy', env.TRUST_PROXY);
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Gzip compression — reduces payload by 60-80%, speeds up every response
app.use(compression({
  level: 6,         // Balanced speed vs compression ratio
  threshold: 1024,  // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// HTTP keep-alive + cache-control defaults for API responses
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=30, max=100');
  // API responses: no-store (always fresh data)
  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
});
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      // Allow localhost and 127.0.0.1 on any port (development and local testing)
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Allow local network IPs (e.g. 192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      if (/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Allow Netlify deployment domains (*.netlify.app)
      if (/^https?:\/\/([a-zA-Z0-9-]+\.)*netlify\.app$/.test(origin)) {
        return callback(null, true);
      }
      // Allow Render deployment domains (*.onrender.com)
      if (/^https?:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/.test(origin)) {
        return callback(null, true);
      }
      // Allow empty CORS_ORIGINS in development mode
      if (env.isDevelopment && env.CORS_ORIGINS.length === 0) {
        return callback(null, true);
      }
      // Allow explicitly configured origins from env
      if (env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      // Allow CLIENT_APP_URL from env (production frontend URL)
      if (env.CLIENT_APP_URL && origin === env.CLIENT_APP_URL) {
        return callback(null, true);
      }
      return callback(
        new AppError(`Not allowed by CORS: ${origin}`, 403, { code: 'CORS_REJECTED' })
      );
    },
    credentials: true,
  })
);

if (!env.isTest) {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.JSON_BODY_LIMIT }));
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', etag: true }));

app.use(
  '/api/docs',
  helmet({ contentSecurityPolicy: false }),
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    customSiteTitle: 'WebUSG API Docs',
  })
);

app.get('/api/docs.json', (req, res) => {
  res.json(openapi);
});

// Health endpoints (must come before static/catch-all)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'webusgbackend',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'webusgbackend',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/v1', routes);
app.use('/api', routes);

// ---------------------------------------------------------------------------
// Serve the built React frontend (production only)
// The build step copies usgweb-main/dist → webusgbackend/public/dist
// ---------------------------------------------------------------------------
const frontendDist = path.join(__dirname, '../public/dist');
const frontendIndex = path.join(frontendDist, 'index.html');

if (fs.existsSync(frontendDist)) {
  // Serve static assets (JS, CSS, images)
  app.use(express.static(frontendDist, { maxAge: '1d', etag: true }));

  // React Router catch-all — serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (fs.existsSync(frontendIndex)) {
      res.sendFile(frontendIndex);
    } else {
      res.status(404).json({ success: false, message: 'Frontend not built' });
    }
  });
} else {
  // No frontend built — API-only mode (development / Netlify frontend)
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Ubumwe SACCO Gakenke Web API is active & operational',
      service: 'webusgbackend',
      version: '1.0.0',
      status: 'healthy',
      apiRoot: '/api',
      healthCheck: '/health',
    });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
  });
}

app.use(errorHandler);

module.exports = app;
