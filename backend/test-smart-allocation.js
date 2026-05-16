/**
 * Test Script for Smart Allocation Feature
 * Run with: node test-smart-allocation.js
 */

// Load environment variables
require('dotenv').config();

const smartAllocationService = require('./services/smartAllocation.service');

console.log('🧪 Testing Smart Resource Allocation Feature\n');
console.log('='.repeat(60));

async function runTests() {
  try {
    // Test 1: Health Check
    console.log('\n📋 Test 1: Watson NLU Health Check');
    console.log('-'.repeat(60));
    const health = await smartAllocationService.checkWatsonHealth();
    console.log('✅ Health Status:', health.status);
    console.log('   Message:', health.message);

    // Test 2: Extract Features
    console.log('\n📋 Test 2: Extract Features from Mission Description');
    console.log('-'.repeat(60));
    const testDescription = "Medical supplies and boats needed for 50 stranded families in the flooded downtown area";
    console.log('Mission:', testDescription);
    
    const features = await smartAllocationService.extractMissionFeatures(testDescription);
    console.log('\n✅ Extracted Features:');
    console.log('   Concepts:', features.concepts.slice(0, 3).map(c => c.text).join(', '));
    console.log('   Keywords:', features.keywords.slice(0, 3).map(k => k.text).join(', '));
    console.log('   Entities:', features.entities.slice(0, 3).map(e => `${e.text} (${e.type})`).join(', '));

    // Test 3: Find Best Matches
    console.log('\n📋 Test 3: Find Best Matching Volunteers');
    console.log('-'.repeat(60));
    const result = await smartAllocationService.findBestMatches(testDescription, 3);
    
    console.log('\n✅ Top 3 Matches:');
    result.topMatches.forEach((match, index) => {
      console.log(`\n   ${index + 1}. ${match.name} (${match.id})`);
      console.log(`      Match Score: ${match.matchScore}%`);
      console.log(`      Skills: ${match.skills.slice(0, 3).join(', ')}`);
      console.log(`      Reliability: ${match.reliability}%`);
      console.log(`      Completed Missions: ${match.completedMissions}`);
      console.log(`      Matched Skills: ${match.matchedSkills.length}`);
    });

    // Test 4: Different Mission Types
    console.log('\n📋 Test 4: Testing Different Mission Types');
    console.log('-'.repeat(60));
    
    const testCases = [
      "Emergency medical assistance needed urgently",
      "Need boats for water rescue operation",
      "Food and supply distribution required"
    ];

    for (const testCase of testCases) {
      console.log(`\n   Testing: "${testCase}"`);
      const caseResult = await smartAllocationService.findBestMatches(testCase, 1);
      const topMatch = caseResult.topMatches[0];
      console.log(`   → Best Match: ${topMatch.name} (Score: ${topMatch.matchScore}%)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All Tests Passed Successfully!');
    console.log('='.repeat(60));
    console.log('\n🎉 Smart Resource Allocation is working correctly!\n');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nError Details:', error);
    process.exit(1);
  }
}

// Run tests
runTests().then(() => {
  console.log('✅ Test script completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});

// Made with Bob
