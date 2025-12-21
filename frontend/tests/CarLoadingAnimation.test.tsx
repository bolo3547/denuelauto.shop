import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import CarLoadingAnimation from '../components/CarLoadingAnimation';

describe('CarLoadingAnimation', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    try { localStorage.clear(); } catch (e) {}
  });

  it('renders the message and moving car', () => {
    render(<CarLoadingAnimation message="Test Loading" direction="rtl" duration={1} />);
    expect(screen.getByText('Test Loading')).toBeInTheDocument();
    const car = screen.getByTestId('car-moving');
    expect(car).toBeInTheDocument();
  });

  it('disables animation and calls onDisable when clicking the disable button', () => {
    const onDisable = jest.fn();
    render(<CarLoadingAnimation message="Test Loading" disableControl={true} onDisable={onDisable} />);

    const btn = screen.getByRole('button', { name: /disable animation/i });
    fireEvent.click(btn);

    expect(localStorage.getItem('disableCarAnimation')).toBe('true');
    expect(onDisable).toHaveBeenCalled();
  });
});
