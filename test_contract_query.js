const snowflake = require('snowflake-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('Testing contract documents query...');

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
    
    // First, examine the CONTRACT_DOCUMENTS table structure
    const schemaQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'CONTRACT_DOCUMENTS' 
      AND table_schema = 'CORTEX_AGENT_SCHEMA'
    `;
    
    connection.execute({
      sqlText: schemaQuery,
      complete: (err, stmt, rows) => {
        if (err) {
          console.error('Error examining CONTRACT_DOCUMENTS schema:', err);
          process.exit(1);
        }
        
        console.log('CONTRACT_DOCUMENTS table structure:');
        console.log('COLUMN_NAME | DATA_TYPE');
        console.log('------------|----------');
        rows.forEach(row => {
          console.log(`${row.COLUMN_NAME} | ${row.DATA_TYPE}`);
        });
        
        // Now, get a sample row to see the actual data structure
        const sampleQuery = `SELECT * FROM CONTRACT_DOCUMENTS LIMIT 1`;
        
        connection.execute({
          sqlText: sampleQuery,
          complete: (err, stmt, rows) => {
            if (err) {
              console.error('Error getting sample CONTRACT_DOCUMENTS row:', err);
              process.exit(1);
            }
            
            console.log('\nSample CONTRACT_DOCUMENTS row:');
            console.log(JSON.stringify(rows[0], null, 2));
            
            // Now try to find contracts for a specific customer
            // First, let's find what customer names we have
            const customersQuery = `
              SELECT DISTINCT DATA:customer_name as customer_name 
              FROM CONTRACT_DOCUMENTS 
              LIMIT 5
            `;
            
            connection.execute({
              sqlText: customersQuery,
              complete: (err, stmt, rows) => {
                if (err) {
                  console.error('Error getting customer names:', err);
                  // Try a different approach if this fails
                  tryAlternativeQuery();
                  return;
                }
                
                console.log('\nAvailable customer names:');
                const customerNames = rows.map(row => row.CUSTOMER_NAME);
                console.log(customerNames);
                
                // Pick the first customer name for our test
                if (customerNames.length > 0) {
                  const customerName = customerNames[0];
                  console.log(`\nQuerying contracts for customer: ${customerName}`);
                  
                  const contractQuery = `
                    SELECT * FROM CONTRACT_DOCUMENTS 
                    WHERE DATA:customer_name = '${customerName}'
                  `;
                  
                  connection.execute({
                    sqlText: contractQuery,
                    complete: (err, stmt, rows) => {
                      if (err) {
                        console.error('Error executing contract query:', err);
                        tryAlternativeQuery();
                        return;
                      }
                      
                      console.log(`\nFound ${rows.length} contracts for ${customerName}:`);
                      console.log(JSON.stringify(rows, null, 2));
                      
                      // Format a user-friendly response
                      formatUserResponse(customerName, rows);
                      
                      // Close the connection
                      connection.destroy((err) => {
                        if (err) {
                          console.error('Error disconnecting from Snowflake:', err);
                        } else {
                          console.log('\nSuccessfully disconnected from Snowflake!');
                        }
                        process.exit(0);
                      });
                    }
                  });
                } else {
                  console.log('No customer names found. Trying alternative query...');
                  tryAlternativeQuery();
                }
              }
            });
          }
        });
      }
    });
  }
});

function tryAlternativeQuery() {
  console.log('\nTrying alternative query approach...');
  
  // Just get all contracts and examine them
  const allContractsQuery = `SELECT * FROM CONTRACT_DOCUMENTS LIMIT 5`;
  
  connection.execute({
    sqlText: allContractsQuery,
    complete: (err, stmt, rows) => {
      if (err) {
        console.error('Error getting all contracts:', err);
        process.exit(1);
      }
      
      console.log(`\nFound ${rows.length} contracts:`);
      console.log(JSON.stringify(rows, null, 2));
      
      // Try to determine the structure from the results
      if (rows.length > 0) {
        const firstRow = rows[0];
        console.log('\nExamining first contract structure:');
        
        Object.keys(firstRow).forEach(key => {
          console.log(`${key}: ${typeof firstRow[key]} - ${JSON.stringify(firstRow[key])}`);
        });
        
        // Format a generic user response
        formatUserResponse('any customer', rows);
      }
      
      // Close the connection
      connection.destroy((err) => {
        if (err) {
          console.error('Error disconnecting from Snowflake:', err);
        } else {
          console.log('\nSuccessfully disconnected from Snowflake!');
        }
        process.exit(0);
      });
    }
  });
}

function formatUserResponse(customerName, contracts) {
  console.log('\nUser-friendly response:');
  console.log('----------------------');
  
  let response = `I found ${contracts.length} contract(s) for ${customerName}:\n\n`;
  
  contracts.forEach((contract, index) => {
    response += `Contract #${index + 1}:\n`;
    
    // Try to find the data in a VARIANT column
    let contractData = null;
    Object.keys(contract).forEach(key => {
      if (typeof contract[key] === 'object' && contract[key] !== null) {
        contractData = contract[key];
      }
    });
    
    if (contractData) {
      // Extract and format key contract details
      Object.keys(contractData).forEach(key => {
        response += `- ${key}: ${contractData[key]}\n`;
      });
    } else {
      // If no VARIANT data found, just show the raw contract
      Object.keys(contract).forEach(key => {
        response += `- ${key}: ${contract[key]}\n`;
      });
    }
    
    response += '\n';
  });
  
  console.log(response);
}
