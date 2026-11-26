import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '../components/Footer';

describe('Footer Component', () => {
  it('renders CPCB NAQI scale attribution and disclaimer', () => {
    render(<Footer />);
    expect(screen.getByText(/ClearAir/i)).toBeInTheDocument();
    expect(screen.getAllByText(/CPCB/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Zero Data Fabrication/i)).toBeInTheDocument();
  });
});
