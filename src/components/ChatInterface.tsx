import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  CircularProgress,
  Container,
  Grid,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { cortexAgentService, Message } from '../services/cortexAgentService';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I can help you analyze your sales data and contract documents. What would you like to know?' 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Suggested queries for quick access
  const suggestedQueries = [
    "How many sales do we have in total?",
    "Show me contract details for Acme Corp",
    "What's the total revenue by region?",
    "Show me the customer 360 view"
  ];

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send the query to the Cortex Agent service
      const response = await cortexAgentService.sendQuery(input, messages);
      
      if (response.status === 'success' && response.message) {
        setMessages(prev => [...prev, response.message as Message]);
      } else {
        // Handle error
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${response.error || 'Unknown error'}` 
        }]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an unexpected error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle suggested query click
  const handleSuggestedQuery = (query: string) => {
    setInput(query);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" gutterBottom>
          Cortex Agent Chat
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {/* Messages area */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, p: 2 }}>
          {messages.map((msg, index) => (
            <Box 
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Paper 
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">{msg.content}</Typography>
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Suggested queries */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Suggested queries:
          </Typography>
          <Grid container spacing={1}>
            {suggestedQueries.map((query, index) => (
              <Grid key={index}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleSuggestedQuery(query)}
                  sx={{ m: 0.5 }}
                >
                  {query}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        {/* Input area */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask about your data..."
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={isLoading}
            sx={{ ml: 1, height: 56 }}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatInterface;
