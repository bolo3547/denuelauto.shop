import React from 'react';
import { render, screen } from '@testing-library/react';
import Navbar from '../components/navbar';
import '@testing-library/jest-dom';

describe('a11y smoke', () => {
  it('renders the navbar with links and register button', () => {
    render(<Navbar />);
    const registerLinks = screen.getAllByText(/Create system|Register/i);
    expect(registerLinks.length).toBeGreaterThan(0);
    expect(screen.getByText(/DENUEL Auto/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Toggle theme/i)).toBeInTheDocument();
  });
});
