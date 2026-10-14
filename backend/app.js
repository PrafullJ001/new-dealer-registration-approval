const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// Allowed frontend origins: local dev + any URL(s) in APP_URL (comma separated)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.APP_URL
    ? process.env.APP_URL.split(',').map((u) => u.trim().replace(/\/$/, ''))
    : []),
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/dealers', require('./routes/dealer.routes'));
app.use('/api/masters', require('./routes/master.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;