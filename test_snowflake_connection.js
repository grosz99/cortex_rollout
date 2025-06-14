const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Starting Snowflake connection test...');

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
      SELECT table_name, table_schema, table_catalog 
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
            console.log(`- ${row.TABLE_NAME} (in ${row.TABLE_SCHEMA}.${row.TABLE_CATALOG})`);
          });
        }
        
        // Test query for sales_data if it exists
        const salesDataQuery = `
          SELECT COUNT(*) as total_sales FROM sales_data
        `;
        
        connection.execute({
          sqlText: salesDataQuery,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error('Error executing sales_data query:', err);
              console.log('sales_data table might not exist or there might be another issue.');
            } else {
              console.log('Sales data count:', rows[0].TOTAL_SALES);
            }
            
            // Test query for contract_documents if it exists
            const contractDocumentsQuery = `
              SELECT COUNT(*) as total_contracts FROM contract_documents
            `;
            
            connection.execute({
              sqlText: contractDocumentsQuery,
              complete: (err, stmt, rows) => {
                if (err) {
                  console.error('Error executing contract_documents query:', err);
                  console.log('contract_documents table might not exist or there might be another issue.');
                } else {
                  console.log('Contract documents count:', rows[0].TOTAL_CONTRACTS);
                }
                
                // Test query for customer_360 view if it exists
                const customer360Query = `
                  SELECT COUNT(*) as total_customers FROM customer_360
                `;
                
                connection.execute({
                  sqlText: customer360Query,
                  complete: (err, stmt, rows) => {
                    if (err) {
                      console.error('Error executing customer_360 query:', err);
                      console.log('customer_360 view might not exist or there might be another issue.');
                    } else {
                      console.log('Customer 360 count:', rows[0].TOTAL_CUSTOMERS);
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
          }
        });
      }
    });
  }
});
