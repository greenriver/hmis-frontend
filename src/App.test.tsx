import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import App from './App';
import { fetchCurrentUser } from './modules/auth/api/sessions';
import { fetchHmisAppSettings } from './modules/hmisAppSettings/api';

jest.mock('./modules/auth/api/sessions');
jest.mock('./modules/hmisAppSettings/api');

const fetchCurrentUserMock = fetchCurrentUser as jest.MockedFunction<
  typeof fetchCurrentUser
>;

const fetchHmisAppSettingsMock = fetchHmisAppSettings as jest.MockedFunction<
  typeof fetchHmisAppSettings
>;

test('renders login page', async () => {
  fetchHmisAppSettingsMock.mockResolvedValue({});
  fetchCurrentUserMock.mockRejectedValue(new Error('err'));

  act(() => render(<App />));
  await waitFor(async () => {
    expect(fetchHmisAppSettingsMock).toHaveBeenCalled();
    expect(fetchCurrentUserMock).toHaveBeenCalled();
  });
  expect(await screen.findByText('Sign In')).toBeInTheDocument();
});

test('renders home page', async () => {
  fetchHmisAppSettingsMock.mockResolvedValue({});
  fetchCurrentUserMock.mockResolvedValue({
    email: 'foo@bar.com',
    name: 'Test User',
  });
  act(() => render(<App />));
  await waitFor(async () => {
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(fetchHmisAppSettingsMock).toHaveBeenCalled();
    expect(fetchCurrentUserMock).toHaveBeenCalled();
  });
  expect(await screen.findByText(/Test User/)).toBeInTheDocument();
});
