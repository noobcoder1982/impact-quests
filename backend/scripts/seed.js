require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const connectDB = require('../config/db');

/**
 * Database Seed Script
 * Populates the database with realistic test data
 * Run: npm run seed
 * 
 * IMPORTANT: Only runs in development/test environments
 * Use --production flag to initialize production user setup
 */

/**
 * Initialize a new production user with empty data
 */
const initializeNewUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize empty inventory (handled by model defaults)
    // Set default energy
    user.energy = 100;
    
    // Set onboarding flags
    user.onboarding = {
      completed: false,
      step: 0
    };
    
    // Initialize activity patterns (empty by default)
    user.activityPatterns = [];
    
    // Set default trust score
    user.reliabilityScore = 100;
    
    await user.save();
    console.log('✅ Production user initialized successfully');
    return user;
  } catch (error) {
    console.error('❌ Failed to initialize production user:', error.message);
    throw error;
  }
};

const seedData = async () => {
  // Check environment - prevent seeding in production
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--production')) {
    console.log('\n⚠️  SEED BLOCKED: Cannot seed database in production environment');
    console.log('   If you need to initialize a production user, use the auth service registration');
    console.log('   Or run with --production flag for production user setup only\n');
    process.exit(0);
  }

  // Production mode - only initialize user setup
  if (process.argv.includes('--production')) {
    console.log('\n🔧 Production Mode: User initialization only\n');
    await connectDB();
    // This would be called after user registration in production
    console.log('✅ Production setup ready. Users will be initialized on registration.\n');
    process.exit(0);
  }

  try {
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ── Create NGOs ──────────────────────────
    const ngos = await User.create([
      {
        role: 'ngo',
        name: 'Sushant Mohanty',
        organizationName: 'Odisha Relief Foundation',
        email: 'odisharelief@ngo.org',
        password: 'password123',
        verified: true,
      },
      {
        role: 'ngo',
        name: 'Pragnya Dash',
        organizationName: 'Kalinga Care Alliance',
        email: 'kalinga@ngo.org',
        password: 'password123',
        verified: true,
      },
    ]);
    console.log(`✅ Created ${ngos.length} NGOs`);

    // ── Create Volunteers ─────────────────────
    const volunteers = await User.create([
      {
        role: 'volunteer',
        name: 'Subrat Nayak',
        email: 'subrat@volunteer.com',
        password: 'password123',
        skills: ['first-aid', 'driving', 'cooking'],
        location: { type: 'Point', coordinates: [85.8245, 20.2961] }, // Bhubaneswar Central
        availability: [
          { day: 'monday', startTime: '09:00', endTime: '17:00' },
          { day: 'wednesday', startTime: '09:00', endTime: '17:00' },
          { day: 'saturday', startTime: '10:00', endTime: '14:00' },
        ],
        reliabilityScore: 88,
        points: 350,
        tasksCompleted: 15,
      },
      {
        role: 'volunteer',
        name: 'Ananya Sahoo',
        email: 'ananya@volunteer.com',
        password: 'password123',
        skills: ['teaching', 'counseling', 'first-aid'],
        location: { type: 'Point', coordinates: [85.8150, 20.3500] }, // Patia, Bhubaneswar
        availability: [
          { day: 'tuesday', startTime: '10:00', endTime: '16:00' },
          { day: 'thursday', startTime: '10:00', endTime: '16:00' },
          { day: 'saturday', startTime: '09:00', endTime: '13:00' },
        ],
        reliabilityScore: 94,
        points: 520,
        tasksCompleted: 22,
      },
      {
        role: 'volunteer',
        name: 'Bikash Pradhan',
        email: 'bikash@volunteer.com',
        password: 'password123',
        skills: ['construction', 'driving', 'logistics'],
        location: { type: 'Point', coordinates: [85.8330, 20.2400] }, // Old Town, Bhubaneswar
        availability: [
          { day: 'monday', startTime: '08:00', endTime: '18:00' },
          { day: 'friday', startTime: '08:00', endTime: '18:00' },
        ],
        reliabilityScore: 75,
        points: 150,
        tasksCompleted: 8,
      },
      {
        role: 'volunteer',
        name: 'Snigdha Rout',
        email: 'snigdha@volunteer.com',
        password: 'password123',
        skills: ['teaching', 'translation', 'data-entry'],
        location: { type: 'Point', coordinates: [85.8100, 20.3150] }, // Salia Sahi area
        availability: [
          { day: 'monday', startTime: '14:00', endTime: '20:00' },
          { day: 'tuesday', startTime: '14:00', endTime: '20:00' },
          { day: 'wednesday', startTime: '14:00', endTime: '20:00' },
          { day: 'thursday', startTime: '14:00', endTime: '20:00' },
          { day: 'friday', startTime: '14:00', endTime: '20:00' },
        ],
        reliabilityScore: 96,
        points: 850,
        tasksCompleted: 38,
      },
      {
        role: 'volunteer',
        name: 'Manas Behera',
        email: 'manas@volunteer.com',
        password: 'password123',
        skills: ['first-aid', 'logistics', 'cooking', 'driving'],
        location: { type: 'Point', coordinates: [85.8335, 20.2660] }, // Master Canteen
        availability: [
          { day: 'saturday', startTime: '07:00', endTime: '19:00' },
          { day: 'sunday', startTime: '07:00', endTime: '19:00' },
        ],
        reliabilityScore: 82,
        points: 180,
        tasksCompleted: 9,
      },
    ]);

    // Recalculate levels for seeded volunteers
    for (const vol of volunteers) {
      vol.calculateLevel();
      await vol.save({ validateBeforeSave: false });
    }
    console.log(`✅ Created ${volunteers.length} Volunteers`);

    // ── Create Tasks ──────────────────────────
    const tasks = await Task.create([
      {
        title: 'Post-Cyclone Medical Camp - Unit 8',
        description: 'Following recent severe weather warnings, we are setting up a preventative medical camp for vulnerable families in Unit 8. We need volunteers with first-aid experience to assist doctors and manage the pharmacy counter.',
        category: 'healthcare',
        location: { type: 'Point', coordinates: [85.8150, 20.2750], address: 'Unit-8, Bhubaneswar' },
        urgency: 'critical',
        requiredSkills: ['first-aid', 'logistics'],
        maxVolunteers: 4,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        createdBy: ngos[0]._id,
      },
      {
        title: 'Digital Literacy Drive in Salia Sahi',
        description: 'Join our weekend initiative to teach basic computer skills, internet safety, and UPI usage to young adults and shop owners in the Salia Sahi community. Laptops will be provided.',
        category: 'education',
        location: { type: 'Point', coordinates: [85.8100, 20.3150], address: 'Salia Sahi, Bhubaneswar' },
        urgency: 'medium',
        requiredSkills: ['teaching', 'translation'],
        maxVolunteers: 6,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdBy: ngos[1]._id,
      },
      {
        title: 'Kuakhai River Bank Restoration',
        description: 'Help us clear plastic waste and debris from the Kuakhai river bank near Patia to prevent waterlogging during the upcoming monsoon season. Gloves and garbage bags will be provided.',
        category: 'environment',
        location: { type: 'Point', coordinates: [85.8650, 20.3250], address: 'Kuakhai River Bank, Patia' },
        urgency: 'low',
        requiredSkills: [],
        maxVolunteers: 15,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
        createdBy: ngos[0]._id,
      },
      {
        title: 'Emergency Ration Distribution - Old Town',
        description: 'Immediate requirement for local volunteers and drivers to help distribute emergency food packets, tarpaulins, and clean drinking water to waterlogged areas in Old Town.',
        category: 'disaster-relief',
        location: { type: 'Point', coordinates: [85.8330, 20.2400], address: 'Old Town, Bhubaneswar' },
        urgency: 'high',
        requiredSkills: ['driving', 'logistics'],
        maxVolunteers: 8,
        deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        createdBy: ngos[0]._id,
      },
      {
        title: 'Mega Blood Donation Drive Coordination',
        description: 'We need proactive coordinators to manage the registration desk, guide donors, and distribute refreshments at the upcoming mega blood donation camp near Master Canteen Square.',
        category: 'healthcare',
        location: { type: 'Point', coordinates: [85.8335, 20.2660], address: 'Master Canteen Square, Bhubaneswar' },
        urgency: 'medium',
        requiredSkills: ['data-entry', 'first-aid'],
        maxVolunteers: 5,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        createdBy: ngos[1]._id,
      },
    ]);
    console.log(`✅ Created ${tasks.length} Tasks`);

    // ── Print Summary ─────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SEED COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Summary:`);
    console.log(`   NGOs:        ${ngos.length}`);
    console.log(`   Volunteers:  ${volunteers.length}`);
    console.log(`   Tasks:       ${tasks.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   NGO Login:       greenearth@ngo.org / password123');
    console.log('   Volunteer Login: amit@volunteer.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

// Export for use in auth service
module.exports = { seedData, initializeNewUser };

// Run if called directly
if (require.main === module) {
  seedData();
}

// Made with Bob
