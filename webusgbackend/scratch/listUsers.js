require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const env = require('../src/config/env');
(async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const User = mongoose.model('User', new mongoose.Schema({ email: String, role: String }, { collection: 'users' }));
    const users = await User.find({}).lean();
    console.log('All users:', users);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();