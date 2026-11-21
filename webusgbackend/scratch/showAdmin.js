require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    const User = mongoose.model('User', new mongoose.Schema({ email: String }, { collection: 'users' }));
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL }).lean();
    console.log('Admin document:', admin);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();