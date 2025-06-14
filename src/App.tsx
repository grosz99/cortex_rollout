import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme 
} from '@mui/material';
import './App.css';
import ChatInterface from './components/ChatInterface';

// Create a custom theme with Snowflake colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#29b5e8', // Snowflake blue
    },
    secondary: {
      main: '#0056b3', // Darker blue
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Snowflake Cortex Agent
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Data Analysis Assistant
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
              Ask questions about your sales data and contract documents using natural language
            </Typography>
            <ChatInterface />
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
