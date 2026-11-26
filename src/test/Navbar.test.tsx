import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';

describe('Navbar Component', () => {
  it('renders navigation tabs with aria-current and handles tab/settings clicks', () => {
    const onSelectTab = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <Navbar
        activeTab="dashboard"
        onSelectTab={onSelectTab}
        onOpenSettings={onOpenSettings}
        stationName="Victoria Memorial"
        aqi={185}
      />
    );

    const activeTab = screen.getByRole('button', { name: /Air Intelligence/i });
    expect(activeTab).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: /Smart Daily Planner/i }));
    expect(onSelectTab).toHaveBeenCalledWith('planner');

    fireEvent.click(screen.getByRole('button', { name: /Open Household Profile Settings/i }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /ClearAir Home/i }));
    expect(onSelectTab).toHaveBeenCalledWith('dashboard');
  });
});
