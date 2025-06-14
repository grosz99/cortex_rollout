const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');
const path = require('path');

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
  warehouse: process.env.REACT_APP_SNOWFLAKE_WAREHOUSE, // Use environment variable instead of hardcoded value
  database: process.env.REACT_APP_SNOWFLAKE_DATABASE,
  schema: process.env.REACT_APP_SNOWFLAKE_SCHEMA
  // Not specifying role to use default user role
});

// Connect to Snowflake
connection.connect((err) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err);
  } else {
    console.log('Successfully connected to Snowflake!');
  }
});

// API endpoint to execute SQL queries
app.post('/api/query', (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }
  
  connection.execute({
    sqlText: sql,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: err.message });
      }
      
      const columns = stmt.getColumns().map(col => col.getName());
      return res.json({ data: rows, columns });
    }
  });
});

// API endpoint for Cortex Agent natural language queries
app.post('/api/cortex-agent', (req, res) => {
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
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        return res.status(500).json({ 
          status: 'error',
          error: err.message,
          message: {
            role: 'assistant',
            content: `I encountered an error while querying the database: ${err.message}`
          }
        });
      }
      
      console.log('Query executed successfully, row count:', rows ? rows.length : 0);
    
      // Get column names from the statement
      const columns = stmt.getColumns().map(col => col.getName());
      
      // Format the results for display
      let resultContent = '';
      if (rows.length > 0) {
        resultContent = `${responseMessage}\n\nResults:\n`;
        
        // Create a table-like format for the results
        const table = rows.map(row => {
          const formattedRow = {};
          columns.forEach(col => {
            // Handle VARIANT data types (like METADATA in contract_documents)
            if (typeof row[col] === 'object' && row[col] !== null) {
              formattedRow[col] = row[col];
            } else {
              formattedRow[col] = row[col];
            }
          });
          return formattedRow;
        });
        
        // Special formatting for specific query types
        if (query.toLowerCase().includes('how many sales')) {
          resultContent += `\nWe have a total of ${rows[0].TOTAL_SALES} sales in our database.`;
        } else if (query.toLowerCase().includes('revenue') && query.toLowerCase().includes('region')) {
          resultContent += '\nHere\'s the breakdown of revenue by region:\n\n';
          rows.forEach(row => {
            resultContent += `- ${row.REGION}: $${row.TOTAL_REVENUE.toLocaleString()}\n`;
          });
        } else {
          resultContent += '```json\n' + JSON.stringify(table, null, 2) + '\n```';
        }
      } else {
        resultContent = 'I ran the query but found no results matching your criteria.';
      }
      
      return res.json({
        status: 'success',
        message: {
          role: 'assistant',
          content: resultContent
        },
        data: rows,
        columns: columns
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    status: 'error',
    error: err.message,
    message: {
      role: 'assistant',
      content: `Server error: ${err.message}`
    }
  });
});

// For local development only
if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}, bound to all interfaces (0.0.0.0)`);
    console.log(`API endpoint available at: http://localhost:${PORT}/api/cortex-agent`);
  });
}

// Export the Express API for Vercel serverless deployment
module.exports = app;
