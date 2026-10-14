const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.APP_URL }));
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