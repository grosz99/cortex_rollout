/**
 * Test script to verify API functionality for Vercel deployment
 * 
 * This script tests the API endpoints to ensure they work correctly
 * when deployed to Vercel. It can be run locally to simulate the
 * Vercel environment.
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const API_URL = process.env.VERCEL_URL || 'http://localhost:3002';
const TEST_QUERY = 'Show me total sales by region';

// Test the API endpoint
async function testApiEndpoint() {
  console.log(`Testing API endpoint at: ${API_URL}/api/cortex-agent`);
  
  try {
    const response = await axios.post(`${API_URL}/api/cortex-agent`, {
      query: TEST_QUERY
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    return false;
  }
}

// Run the test
(async () => {
  console.log('Starting Vercel API test...');
  const success = await testApiEndpoint();
  
  if (success) {
    console.log('✅ API test successful! The endpoint is working correctly.');
  } else {
    console.log('❌ API test failed. Please check the error messages above.');
  }
})();
