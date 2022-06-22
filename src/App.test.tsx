import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import App from './App';
import { getCurrentUser } from './modules/auth/api/sessions';

jest.mock('./modules/auth/api/sessions');

const getCurrentUserMock = getCurrentUser as jest.MockedFunction<
  typeof getCurrentUser
>;

test('renders login page', async () => {
  getCurrentUserMock.mockRejectedValue(new Error('err'));

  render(<App />);
  expect(screen.getByTestId('loading')).toBeInTheDocument();
  expect(getCurrentUserMock).toHaveBeenCalled();
  expect(await screen.findByText('Sign In')).toBeInTheDocument();
});

test('renders home page', async () => {
  getCurrentUserMock.mockResolvedValue({
    email: 'foo@bar.com',
    name: 'Test User',
  });
  render(<App />);
  expect(screen.getByTestId('loading')).toBeInTheDocument();
  await waitFor(async () => {
    expect(getCurrentUserMock).toHaveBeenCalled();
    expect(await screen.findByText(/Test User/)).toBeInTheDocument();
  });
});
