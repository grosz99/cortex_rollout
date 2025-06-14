const axios = require('axios');

// Test the API endpoint directly
async function testApiEndpoint() {
  try {
    console.log('Testing API endpoint with simple query...');
    
    const response = await axios.post('http://localhost:3001/api/cortex-agent', {
      query: 'How many sales do we have in total?'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing API endpoint:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    console.error('Error config:', error.config);
  }
}

// Run the test
testApiEndpoint();
