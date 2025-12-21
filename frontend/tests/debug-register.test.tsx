import React from 'react';
import { render, screen } from '@testing-library/react';
import Register from '../app/register/tenant/page';

test('debug labels', () => {
  render(<Register />);
  const labels = document.querySelectorAll('label');
  labels.forEach(l => {
    const text = l.textContent?.trim();
    const htmlFor = (l as HTMLLabelElement).htmlFor || 'none';
    console.log('LABEL:', text, 'for:', htmlFor);
  });
  const matched = screen.queryAllByLabelText('Email');
  console.log('queryAllByLabelText Email count:', matched.length);
});
