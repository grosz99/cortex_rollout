// Serverless function for the /api/cortex-agent endpoint
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.VERCEL_URL
    ];
    
    // Allow all vercel.app subdomains
    if(origin.endsWith('.vercel.app') || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(bodyParser.json());

// Add OPTIONS handling for preflight requests
app.options('/*', cors());

// Snowflake connection
const connection = snowflake.createConnection({
  account: process.env.REACT_APP_SNOWFLAKE_ACCOUNT,
  username: process.env.REACT_APP_SNOWFLAKE_USERNAME,
  password: process.env.REACT_APP_SNOWFLAKE_PASSWORD,
  warehouse: process.env.REACT_APP_SNOWFLAKE_WAREHOUSE,
  database: process.env.REACT_APP_SNOWFLAKE_DATABASE,
  schema: process.env.REACT_APP_SNOWFLAKE_SCHEMA
});

// Connect to Snowflake
connection.connect((err) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err);
  } else {
    console.log('Successfully connected to Snowflake!');
  }
});

// API endpoint handler
app.post('/', (req, res) => {
  const { query, history } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  console.log(`Received query: ${query}`);
  
  // Simple mapping of natural language to SQL
  let sqlQuery = '';
  let responseMessage = '';
  
  if (query.toLowerCase().includes('how many sales')) {
    sqlQuery = 'SELECT COUNT(*) AS TOTAL_SALES FROM SALES_DATA';
    responseMessage = 'Here\'s the total number of sales:';
  } else if (query.toLowerCase().includes('revenue') && query.toLowerCase().includes('region')) {
    sqlQuery = 'SELECT REGION, SUM(REVENUE) AS TOTAL_REVENUE FROM SALES_DATA GROUP BY REGION ORDER BY TOTAL_REVENUE DESC';
    responseMessage = 'Here\'s the revenue breakdown by region:';
  } else if (query.toLowerCase().includes('contract') && query.toLowerCase().includes('acme')) {
    sqlQuery = "SELECT * FROM CONTRACT_DOCUMENTS WHERE METADATA:customer_name = 'Acme Corp'";
    responseMessage = 'Here are the contract details for Acme Corp:';
  } else if (query.toLowerCase().includes('customer 360')) {
    sqlQuery = 'SELECT * FROM CUSTOMER_360 LIMIT 10';
    responseMessage = 'Here\'s a sample from the customer 360 view:';
  } else {
    // Default query
    sqlQuery = 'SELECT * FROM SALES_DATA LIMIT 5';
    responseMessage = 'I\'m not sure what you\'re asking for, but here\'s some sample sales data:';
  }
  
  console.log(`Executing SQL query: ${sqlQuery}`);
  
  // Execute the SQL query
  connection.execute({
    sqlText: sqlQuery,
    complete: function(err, stmt, rows) {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ error: 'Error executing SQL query', details: err.message });
      }
      
      // Get column metadata
      const columns = stmt.getColumns().map(col => ({
        name: col.getName(),
        type: col.getType()
      }));
      
      // Format response
      const response = {
        message: responseMessage,
        data: rows,
        columns: columns
      };
      
      return res.json(response);
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Export the Express API
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
