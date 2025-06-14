const http = require('http');

// Create a direct HTTP request to test the API endpoint using IPv4 explicitly on port 3002
const options = {
  hostname: '127.0.0.1', // Explicitly use IPv4 localhost address
  port: 3002,            // Updated to use port 3002
  path: '/api/cortex-agent',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const data = JSON.stringify({
  query: 'How many sales do we have in total?'
});

console.log('Sending direct HTTP request to API endpoint...');
console.log(`Request URL: http://${options.hostname}:${options.port}${options.path}`);
console.log(`Request body: ${data}`);

const req = http.request(options, (res) => {
  console.log(`Response status code: ${res.statusCode}`);
  console.log('Response headers:', res.headers);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
    console.log('Received chunk of data');
  });
  
  res.on('end', () => {
    console.log('Response completed');
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Response data (parsed):', JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.log('Response data (raw):', responseData);
      console.log('Error parsing JSON:', e.message);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error.message);
  console.error('Error details:', error);
});

// Write data to request body
req.write(data);
req.end();

console.log('Request sent, waiting for response...');
