import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import PrivateRoute from './PrivateRoute';
import { getUser } from '../services/api';

vi.mock('../services/api', () => ({ getUser: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

const renderProtectedPage = () => render(
  <MemoryRouter initialEntries={['/bookingpage']}>
    <Routes>
      <Route path="/bookingpage" element={<PrivateRoute><div>Private booking content</div></PrivateRoute>} />
      <Route path="/login" element={<div>Sign in first</div>} />
    </Routes>
  </MemoryRouter>,
);

test('signed-out users see sign in without booking content', async () => {
  getUser.mockRejectedValue(new Error('Unauthorized'));
  renderProtectedPage();
  expect(screen.queryByText('Private booking content')).not.toBeInTheDocument();
  expect(await screen.findByText('Sign in first')).toBeInTheDocument();
});

test('session ending immediately hides an open booking page', async () => {
  getUser.mockResolvedValue({ data: { id: 1 } });
  renderProtectedPage();
  expect(await screen.findByText('Private booking content')).toBeInTheDocument();
  act(() => window.dispatchEvent(new Event('auth-session-ended')));
  expect(await screen.findByText('Sign in first')).toBeInTheDocument();
  expect(screen.queryByText('Private booking content')).not.toBeInTheDocument();
});
