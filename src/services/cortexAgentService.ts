import axiosInstance from './axiosConfig';

// Interface for Cortex Agent API parameters
interface CortexAgentConfig {
  model: string;
  semanticModelPath: string;
}

// Interface for message structure
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Interface for query response
export interface CortexResponse {
  status: string;
  message?: Message;
  data?: any[];
  columns?: string[];
  error?: string;
}

class CortexAgentService {
  private config: CortexAgentConfig;
  
  constructor() {
    this.config = {
      model: process.env.REACT_APP_CORTEX_MODEL || 'claude-4-sonnet',
      semanticModelPath: process.env.REACT_APP_SEMANTIC_MODEL_PATH || '',
    };
  }

  // Method to send a natural language query to the Cortex Agent API
  async sendQuery(query: string, history: Message[] = []): Promise<CortexResponse> {
    try {
      console.log('Sending query to backend:', query);
      
      // Call our backend API that interfaces with Snowflake
      const response = await axiosInstance.post('/cortex-agent', {
        query,
        history
      });
      
      console.log('Received response from backend:', response.data);
      
      // Type assertion for response.data
      const responseData = response.data as {
        status: string;
        message: Message;
        data: any[];
        columns: string[];
      };
      
      return {
        status: 'success',
        message: responseData.message,
        data: responseData.data,
        columns: responseData.columns
      };
    } catch (error: any) {
      console.error('Error sending query to Cortex Agent:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      
      // If we have a response with error data from the server
      if (error.response?.data?.message) {
        return {
          status: 'error',
          error: error.response.data.error || error.message,
          message: error.response.data.message
        };
      }
      
      return {
        status: 'error',
        error: error.message || 'Failed to process query'
      };
    }
  }
}

export const cortexAgentService = new CortexAgentService();
