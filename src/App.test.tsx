import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import App from './App';
import { fetchCurrentUser } from './modules/auth/api/sessions';

jest.mock('./modules/auth/api/sessions');

const fetchCurrentUserMock = fetchCurrentUser as jest.MockedFunction<
  typeof fetchCurrentUser
>;

test('renders login page', async () => {
  fetchCurrentUserMock.mockRejectedValue(new Error('err'));

  render(<App />);
  expect(screen.getByTestId('loading')).toBeInTheDocument();
  expect(fetchCurrentUserMock).toHaveBeenCalled();
  expect(await screen.findByText('Sign In')).toBeInTheDocument();
});

test('renders home page', async () => {
  fetchCurrentUserMock.mockResolvedValue({
    email: 'foo@bar.com',
    name: 'Test User',
  });
  render(<App />);
  expect(screen.getByTestId('loading')).toBeInTheDocument();
  await waitFor(async () => {
    expect(fetchCurrentUserMock).toHaveBeenCalled();
    expect(await screen.findByText(/Test User/)).toBeInTheDocument();
  });
});
