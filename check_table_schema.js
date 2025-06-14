const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Checking table schemas...');

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
    
    // Check schema for sales_data table
    checkTableSchema('SALES_DATA');
  }
});

function checkTableSchema(tableName) {
  console.log(`\nChecking schema for ${tableName}...`);
  
  const query = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = '${tableName}' 
    AND table_schema = 'CORTEX_AGENT_SCHEMA'
  `;
  
  connection.execute({
    sqlText: query,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error(`Error checking schema for ${tableName}:`, err);
      } else {
        console.log(`Columns in ${tableName}:`);
        if (rows.length === 0) {
          console.log(`No columns found for ${tableName}`);
        } else {
          console.log('COLUMN_NAME | DATA_TYPE');
          console.log('------------|----------');
          rows.forEach(row => {
            console.log(`${row.COLUMN_NAME} | ${row.DATA_TYPE}`);
          });
        }
      }
      
      // Check the next table or finish
      if (tableName === 'SALES_DATA') {
        checkTableSchema('CONTRACT_DOCUMENTS');
      } else if (tableName === 'CONTRACT_DOCUMENTS') {
        checkTableSchema('CUSTOMER_360');
      } else {
        // All tables checked, close connection
        connection.destroy((err) => {
          if (err) {
            console.error('Error disconnecting from Snowflake:', err);
          } else {
            console.log('\nSuccessfully disconnected from Snowflake!');
          }
          process.exit(0);
        });
      }
    }
  });
}
