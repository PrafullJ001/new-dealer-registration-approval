require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error('Set MONGO_URI and JWT_SECRET in backend/.env');
  process.exit(1);
}

const port = process.env.PORT || 5000;

connectDB(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`🚀 Server running on port ${port}`)))
  .catch((err) => {
    console.error('Could not start:', err.message);
    process.exit(1);
  });