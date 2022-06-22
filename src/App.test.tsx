import { render, screen } from '@testing-library/react';
import React from 'react';

import { getCurrentUser } from './api/sessions';
import App from './App';

jest.mock('./api/sessions');

const getCurrentUserMock = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

test('renders login page', async () => {
  getCurrentUserMock.mockRejectedValue(new Error('err'));
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(getCurrentUserMock).toHaveBeenCalled();
  expect(await screen.findByText('Sign In')).toBeInTheDocument();
});

test('renders home page', async () => {
  getCurrentUserMock.mockResolvedValue({
    email: 'foo@bar.com',
    name: 'Test User',
  });
  render(<App />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(getCurrentUserMock).toHaveBeenCalled();
  expect(await screen.findByText(/Test User/)).toBeInTheDocument();
});
