import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionButton from '../ActionButton';

describe('ActionButton', () => {
  test('renders label', () => {
    render(<ActionButton>Click me</ActionButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  test('shows spinner while loading and disables', () => {
    render(<ActionButton loading>Save</ActionButton>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });

  test('confirm prevents action when canceled', async () => {
    (window as any).confirm = jest.fn().mockReturnValue(false);
    const onClick = jest.fn();
    render(<ActionButton confirm onClick={onClick}>Delete</ActionButton>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    expect(onClick).not.toHaveBeenCalled();
  });

  test('prevent double click calls only once', async () => {
    const onClick = jest.fn(() => Promise.resolve());
    render(<ActionButton preventDoubleClick onClick={onClick}>Save</ActionButton>);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(btn).not.toHaveAttribute('aria-busy', 'true'));
  });
});
