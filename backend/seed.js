require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Dealer = require('./models/Dealer');
const Master = require('./models/Master');
const { ROLES } = require('./config/constants');

const admin = {
  name: process.env.ADMIN_NAME || 'Prafull Jadhav',
  email: process.env.ADMIN_EMAIL || 'prafull.jadhav@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
};

const states = ['Maharashtra', 'Gujarat', 'Karnataka', 'Telangana', 'Delhi'];
const types = ['Distributor', 'Retailer', 'Sub-dealer'];

async function run() {
  await connectDB(process.env.MONGO_URI);

  if (process.argv.includes('--reset')) {
    await Promise.all([
      User.deleteMany({}),
      Dealer.deleteMany({}),
      Master.deleteMany({}),
      mongoose.connection.collection('counters').deleteMany({}),
    ]);
    console.log('Old data removed');
  }

  let user = await User.findOne({ email: admin.email.toLowerCase() });
  if (user) {
    console.log('Admin already exists, left as it is');
  } else {
    user = new User({ name: admin.name, email: admin.email, role: ROLES.ADMIN });
    await user.setPassword(admin.password);
    await user.save();
    console.log(`Admin created: ${admin.name}`);
  }

  const lists = [
    ...states.map((value) => ({ type: 'STATE', value })),
    ...types.map((value) => ({ type: 'DEALER_TYPE', value })),
  ];
  for (const item of lists) {
    const found = await Master.exists({ type: item.type, value: item.value });
    if (!found) await Master.create(item);
  }
  console.log('State and dealer type lists are ready');

  console.log(`\nLog in with:\n  email:    ${user.email}\n  password: ${admin.password}\n`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});