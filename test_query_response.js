const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting test query response flow...');

// Create a connection to Snowflake
const connection = snowflake.createConnection({
  account: process.env.REACT_APP_SNOWFLAKE_ACCOUNT,
  username: process.env.REACT_APP_SNOWFLAKE_USERNAME,
  password: process.env.REACT_APP_SNOWFLAKE_PASSWORD,
  warehouse: 'SuperstoreWarehouse',
  database: 'CORTEX_AGENT_DB',
  schema: 'CORTEX_AGENT_SCHEMA'
});

// Sample natural language queries to test
const testQueries = [
  "How many sales do we have in total?",
  "What's the total revenue by region?",
  "Show me contract details for Acme Corp"
];

// Connect to Snowflake
connection.connect((err) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err);
    process.exit(1);
  } else {
    console.log('Successfully connected to Snowflake!');
    
    // Process each test query
    processQuery(0);
  }
});

function processQuery(index) {
  if (index >= testQueries.length) {
    // All queries processed, close connection
    connection.destroy((err) => {
      if (err) {
        console.error('Error disconnecting from Snowflake:', err);
      } else {
        console.log('Successfully disconnected from Snowflake!');
      }
      process.exit(0);
    });
    return;
  }
  
  const query = testQueries[index];
  console.log(`\n----- Processing query: "${query}" -----`);
  
  // Simulate natural language processing to SQL
  let sqlQuery = '';
  let responseIntro = '';
  
  if (query.toLowerCase().includes('how many sales')) {
    sqlQuery = 'SELECT COUNT(*) AS total_sales FROM sales_data';
    responseIntro = 'Based on your question about total sales, I found:';
  } else if (query.toLowerCase().includes('revenue') && query.toLowerCase().includes('region')) {
    sqlQuery = 'SELECT region, SUM(amount) AS total_revenue FROM sales_data GROUP BY region ORDER BY total_revenue DESC';
    responseIntro = 'Here\'s the breakdown of total revenue by region:';
  } else if (query.toLowerCase().includes('contract') && query.toLowerCase().includes('acme')) {
    sqlQuery = 'SELECT * FROM contract_documents WHERE document:customer_name = \'Acme Corp\'';
    responseIntro = 'I found the following contract details for Acme Corp:';
  } else {
    console.log('Query not recognized. Moving to next query.');
    processQuery(index + 1);
    return;
  }
  
  console.log(`Translated to SQL: ${sqlQuery}`);
  
  // Execute the SQL query
  connection.execute({
    sqlText: sqlQuery,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        console.log('Moving to next query...');
        processQuery(index + 1);
        return;
      }
      
      // Get column names from the statement
      const columns = stmt.getColumns().map(col => col.getName());
      
      // Format the results for display
      console.log(responseIntro);
      
      if (rows.length > 0) {
        // Create a table-like format for the results
        console.log('Results:');
        console.log('--------');
        
        // Print column headers
        console.log(columns.join(' | '));
        console.log('-'.repeat(columns.join(' | ').length));
        
        // Print rows
        rows.forEach(row => {
          const rowValues = columns.map(col => {
            const value = row[col];
            return typeof value === 'object' ? JSON.stringify(value) : value;
          });
          console.log(rowValues.join(' | '));
        });
        
        // Create a user-friendly response
        let userResponse = `${responseIntro}\n\n`;
        
        if (query.toLowerCase().includes('how many sales')) {
          userResponse += `We have a total of ${rows[0].TOTAL_SALES} sales in our database.`;
        } else if (query.toLowerCase().includes('revenue') && query.toLowerCase().includes('region')) {
          userResponse += 'Here\'s the breakdown of revenue by region:\n\n';
          rows.forEach(row => {
            userResponse += `- ${row.REGION}: $${row.TOTAL_REVENUE.toLocaleString()}\n`;
          });
        } else if (query.toLowerCase().includes('contract') && query.toLowerCase().includes('acme')) {
          userResponse += 'Here are the contract details for Acme Corp:\n\n';
          rows.forEach((row, index) => {
            userResponse += `Contract #${index + 1}:\n`;
            userResponse += `- Customer: ${row.DOCUMENT.customer_name}\n`;
            userResponse += `- Contract Value: $${row.DOCUMENT.contract_value}\n`;
            userResponse += `- Start Date: ${row.DOCUMENT.start_date}\n`;
            userResponse += `- End Date: ${row.DOCUMENT.end_date}\n`;
            userResponse += `- Status: ${row.DOCUMENT.status}\n\n`;
          });
        }
        
        console.log('\nUser-friendly response:');
        console.log('----------------------');
        console.log(userResponse);
      } else {
        console.log('No results found for this query.');
      }
      
      // Process the next query
      processQuery(index + 1);
    }
  });
}
