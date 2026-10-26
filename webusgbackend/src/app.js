const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (env.isDevelopment && env.CORS_ORIGINS.length === 0) {
        return callback(null, true);
      }
      if (env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new AppError('Not allowed by CORS', 403, { code: 'CORS_REJECTED' })
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

// Top-level health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'webusgbackend',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

app.use('/api/v1', routes);
app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorHandler);

module.exports = app;
