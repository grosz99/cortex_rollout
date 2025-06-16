import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Snowflake Cortex Agent/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders subtitle', () => {
  render(<App />);
  const subtitleElement = screen.getByText(/Ask questions about your sales data/i);
  expect(subtitleElement).toBeInTheDocument();
});
