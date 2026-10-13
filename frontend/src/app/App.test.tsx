import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { App } from './App';
import * as httpApi from '../api/http';

describe('App component', () => {
  it('renders brand name ReviseMind and health state', async () => {
    vi.spyOn(httpApi, 'fetchHealthStatus').mockResolvedValue({ status: 'UP' });

    render(<App />);
    expect(screen.getByText('ReviseMind')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('UP')).toBeInTheDocument();
    });
  });
});
