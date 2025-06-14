const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting simple Snowflake connection test...');

// Create a connection to Snowflake
const connection = snowflake.createConnection({
  account: process.env.REACT_APP_SNOWFLAKE_ACCOUNT,
  username: process.env.REACT_APP_SNOWFLAKE_USERNAME,
  password: process.env.REACT_APP_SNOWFLAKE_PASSWORD,
  warehouse: 'SuperstoreWarehouse',
  database: 'CORTEX_AGENT_DB',
  schema: 'CORTEX_AGENT_SCHEMA'
});

// Connect to Snowflake
connection.connect((err) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err);
    process.exit(1);
  } else {
    console.log('Successfully connected to Snowflake!');
    
    // Test query to check if tables exist
    const testQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'CORTEX_AGENT_SCHEMA'
    `;
    
    connection.execute({
      sqlText: testQuery,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Error executing query:', err);
          process.exit(1);
        }
        
        console.log('Available tables in CORTEX_AGENT_SCHEMA:');
        if (rows.length === 0) {
          console.log('No tables found in the schema.');
        } else {
          rows.forEach(row => {
            console.log(`- ${row.TABLE_NAME}`);
          });
        }
        
        // Close the connection
        connection.destroy((err) => {
          if (err) {
            console.error('Error disconnecting from Snowflake:', err);
          } else {
            console.log('Successfully disconnected from Snowflake!');
          }
          process.exit(0);
        });
      }
    });
  }
});
