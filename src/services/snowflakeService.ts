import axiosInstance from './axiosConfig';

// Interface for Snowflake connection parameters
interface SnowflakeConfig {
  account: string;
  username: string;
  password: string;
  warehouse: string;
  database: string;
  schema: string;
  role: string;
}

// Interface for query results
export interface QueryResult {
  status: string;
  data: any[];
  columns: string[];
  error?: string;
}

class SnowflakeService {
  private baseUrl: string;
  private config: SnowflakeConfig;

  constructor() {
    this.baseUrl = process.env.REACT_APP_SNOWFLAKE_URL || '';
    this.config = {
      account: process.env.REACT_APP_SNOWFLAKE_ACCOUNT || '',
      username: process.env.REACT_APP_SNOWFLAKE_USERNAME || '',
      password: process.env.REACT_APP_SNOWFLAKE_PASSWORD || '',
      warehouse: process.env.REACT_APP_SNOWFLAKE_WAREHOUSE || '',
      database: process.env.REACT_APP_SNOWFLAKE_DATABASE || '',
      schema: process.env.REACT_APP_SNOWFLAKE_SCHEMA || '',
      role: process.env.REACT_APP_SNOWFLAKE_ROLE || '',
    };
  }

  // Method to execute SQL queries via backend API
  async executeQuery(sql: string): Promise<QueryResult> {
    try {
      // Call our backend API that executes the query in Snowflake
      const response = await axiosInstance.post('/api/query', {
        sql,
        config: this.config
      });
      
      // Type assertion for response.data
      const responseData = response.data as { rows: any[], columns: string[] };
      
      return {
        status: 'success',
        data: responseData.rows,
        columns: responseData.columns
      };
    } catch (error: any) {
      console.error('Error executing query:', error);
      return {
        status: 'error',
        data: [],
        columns: [],
        error: error.message || 'Failed to execute query'
      };
    }
  }

  // Method to test connection to Snowflake
  async testConnection(): Promise<boolean> {
    try {
      const testQuery = 'SELECT 1';
      const result = await this.executeQuery(testQuery);
      return result.status === 'success';
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export const snowflakeService = new SnowflakeService();
