const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hkili';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function setupAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hkili.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    console.log(`Checking for admin user: ${adminEmail}`);
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      // Optional: Update password if needed
      // const hashedPassword = await bcrypt.hash(adminPassword, 12);
      // existingAdmin.password = hashedPassword;
      // await existingAdmin.save();
      // console.log('Admin password updated');
    } else {
      console.log('Creating new admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        name: 'Admin User'
      });

      console.log('Admin user created successfully');
      console.log(`Email: ${adminEmail}`);
      console.log('Password: [HIDDEN] (Admin@123)');
    }
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

setupAdmin();
