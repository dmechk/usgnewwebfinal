require('dotenv').config({path:'../.env'});
const mongoose = require('mongoose');
(async()=>{
 try {
   await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:5000});
   const User = mongoose.model('User', new mongoose.Schema({email:String, role:String}, {collection:'users'}));
   const users = await User.find({}).lean();
   console.log('Users:', users);
   process.exit(0);
 } catch(e){
   console.error('Connect error:', e.message);
   process.exit(1);
 }
})();