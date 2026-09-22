import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const seedManager = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gitsphere';
    await mongoose.connect(mongoUri);
    console.log(`[Seed] Connected to MongoDB: ${mongoUri}`);

    const managerEmail = process.env.INITIAL_MANAGER_EMAIL || 'manager@gitsphere.com';
    const managerPassword = process.env.INITIAL_MANAGER_PASSWORD || 'ManagerPassword123';
    const managerName = process.env.INITIAL_MANAGER_NAME || 'Primary Manager';

    // Check if manager already exists
    const existingManager = await User.findOne({ email: managerEmail });
    if (existingManager) {
      console.log(`[Seed] Manager already exists with email: ${managerEmail} (Role: ${existingManager.role})`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create Manager user
    const manager = await User.create({
      name: managerName,
      email: managerEmail,
      password: managerPassword,
      role: 'MANAGER',
      bio: 'Primary GitSphere Platform Manager',
      isActive: true
    });

    console.log(`[Seed] Successfully created default Manager account:`);
    console.log(`  Name:     ${manager.name}`);
    console.log(`  Email:    ${manager.email}`);
    console.log(`  Role:     ${manager.role}`);
    console.log(`  ID:       ${manager._id}`);
    console.log(`  Password: ${managerPassword}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error]: ${error.message}`);
    process.exit(1);
  }
};

seedManager();
