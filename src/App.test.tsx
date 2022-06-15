import { render, screen } from '@testing-library/react';
import React from 'react';

import App from './App';

// FIXME add actual tests
test('renders loading page', () => {
  render(<App />);
  const linkElement = screen.getByText(/loading/i);
  expect(linkElement).toBeInTheDocument();
});
