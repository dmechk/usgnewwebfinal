const mongoose = require('mongoose');
const env = require('./src/config/env');
(async () => {
  try {
    await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const User = mongoose.model('User', new mongoose.Schema({ email: String }, { collection: 'users' }));
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL || env.ADMIN_EMAIL }).lean();
    console.log('Admin user:', admin);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
