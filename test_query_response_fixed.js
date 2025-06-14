const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting test query response flow with fixed queries...');

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
    sqlQuery = 'SELECT region, SUM(revenue) AS total_revenue FROM sales_data GROUP BY region ORDER BY total_revenue DESC';
    responseIntro = 'Here\'s the breakdown of total revenue by region:';
  } else if (query.toLowerCase().includes('contract') && query.toLowerCase().includes('acme')) {
    // First, let's check if there's a DOCUMENT column or similar in CONTRACT_DOCUMENTS
    const checkContractQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'CONTRACT_DOCUMENTS' 
      AND table_schema = 'CORTEX_AGENT_SCHEMA'
    `;
    
    connection.execute({
      sqlText: checkContractQuery,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Error checking contract_documents schema:', err);
          processQuery(index + 1);
          return;
        }
        
        console.log('CONTRACT_DOCUMENTS columns:');
        rows.forEach(row => {
          console.log(`${row.COLUMN_NAME} | ${row.DATA_TYPE}`);
        });
        
        // Try to find a VARIANT column that might contain our document data
        const variantColumns = rows.filter(row => row.DATA_TYPE === 'VARIANT');
        
        if (variantColumns.length > 0) {
          const variantColumn = variantColumns[0].COLUMN_NAME;
          console.log(`Found VARIANT column: ${variantColumn}`);
          
          // Now try the query with the correct column name
          const contractQuery = `
            SELECT * FROM contract_documents 
            WHERE ${variantColumn}:customer_name = 'Acme Corp'
          `;
          
          executeContractQuery(contractQuery, index);
        } else {
          // If no VARIANT column, try a simple SELECT * to see what's in the table
          console.log('No VARIANT column found. Trying a simple SELECT to see table contents...');
          
          const simpleQuery = 'SELECT * FROM contract_documents LIMIT 1';
          
          connection.execute({
            sqlText: simpleQuery,
            complete: (err, stmt, rows) => {
              if (err) {
                console.error('Error executing simple contract query:', err);
                processQuery(index + 1);
                return;
              }
              
              console.log('Sample contract_documents row:');
              console.log(JSON.stringify(rows[0], null, 2));
              
              // Move to the next query
              processQuery(index + 1);
            }
          });
        }
      }
    });
    
    return; // Skip the normal execution flow for this query
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

function executeContractQuery(contractQuery, index) {
  console.log(`Translated to SQL: ${contractQuery}`);
  
  connection.execute({
    sqlText: contractQuery,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Error executing contract query:', err);
        processQuery(index + 1);
        return;
      }
      
      const responseIntro = 'I found the following contract details for Acme Corp:';
      console.log(responseIntro);
      
      if (rows.length > 0) {
        console.log('Results:');
        console.log('--------');
        console.log(JSON.stringify(rows, null, 2));
        
        // Create a user-friendly response
        let userResponse = `${responseIntro}\n\n`;
        
        rows.forEach((row, idx) => {
          userResponse += `Contract #${idx + 1}:\n`;
          
          // Try to extract contract details from the row
          const variantColumns = Object.keys(row).filter(key => 
            typeof row[key] === 'object' && row[key] !== null
          );
          
          if (variantColumns.length > 0) {
            const variantColumn = variantColumns[0];
            const document = row[variantColumn];
            
            if (document) {
              Object.keys(document).forEach(key => {
                userResponse += `- ${key}: ${document[key]}\n`;
              });
            } else {
              userResponse += `- Raw data: ${JSON.stringify(row)}\n`;
            }
          } else {
            // If no variant column found, just show the raw data
            Object.keys(row).forEach(key => {
              userResponse += `- ${key}: ${row[key]}\n`;
            });
          }
          
          userResponse += '\n';
        });
        
        console.log('\nUser-friendly response:');
        console.log('----------------------');
        console.log(userResponse);
      } else {
        console.log('No contract details found for Acme Corp.');
      }
      
      // Process the next query
      processQuery(index + 1);
    }
  });
}
