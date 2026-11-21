require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const env = require('../src/config/env');
(async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const User = mongoose.model('User', new mongoose.Schema({ email: String, password: String }, { collection: 'users' }));
    const admin = await User.findOne({ email: env.ADMIN_EMAIL }).lean();
    console.log('Admin document:', admin);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();