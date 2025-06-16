// Serverless function for the /api/cortex-agent endpoint
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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

// Main handler function for Vercel serverless function
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
    
    // Execute the SQL query using a promise wrapper
    const executeQuery = () => {
      return new Promise((resolve, reject) => {
        connection.execute({
          sqlText: sqlQuery,
          complete: function(err, stmt, rows) {
            if (err) {
              console.error('Error executing SQL query:', err);
              reject(err);
            } else {
              // Get column metadata
              const columns = stmt.getColumns().map(col => ({
                name: col.getName(),
                type: col.getType()
              }));
              
              resolve({ rows, columns });
            }
          }
        });
      });
    };

    try {
      const { rows, columns } = await executeQuery();
      
      // Format response
      const response = {
        message: responseMessage,
        data: rows,
        columns: columns
      };
      
      return res.status(200).json(response);
    } catch (sqlError) {
      return res.status(500).json({ 
        error: 'Error executing SQL query', 
        details: sqlError.message 
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};

