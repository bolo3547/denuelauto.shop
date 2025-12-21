import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminInventoryPage from '@/app/admin/inventory/page';

describe('AdminInventoryPage', () => {
  beforeEach(() => {
    // Ensure global confirm returns true for delete
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.confirm = undefined;
  });

  it('renders inventory and allows adding/editing/deleting cars', async () => {
    render(<AdminInventoryPage />);

    // Page header
    expect(await screen.findByText(/Inventory Management/i)).toBeInTheDocument();

    // If the Add New Car button is available, click it to open the form
    const addButton = screen.queryByRole('button', { name: '+ Add New Car' }) || screen.queryByRole('button', { name: /\+ Add New Car/i });
    if (addButton) fireEvent.click(addButton);

    // Fill form
    let makeInput: HTMLElement;
    try { makeInput = screen.getByPlaceholderText(/Toyota/i); } catch { makeInput = screen.getByLabelText(/Make/i); }
    let modelInput: HTMLElement;
    try { modelInput = screen.getByPlaceholderText(/Camry/i); } catch { modelInput = screen.getByLabelText(/Model/i); }
    let priceInput: HTMLElement;
    try { priceInput = screen.getByTitle(/Price in USD/i); } catch { priceInput = screen.getByLabelText(/Price \(USD\)/i); }
    fireEvent.change(makeInput, { target: { value: 'TestMake' } });
    fireEvent.change(modelInput, { target: { value: 'TestModel' } });
    fireEvent.change(priceInput, { target: { value: '12345' } });

    const submit = screen.getByRole('button', { name: /Add Car/i });
    fireEvent.click(submit);

    // Check the new car is in the table (year should be present as numeric)
    const newCarRow = await screen.findByText(/TestMake TestModel/i);
    expect(newCarRow).toBeInTheDocument();

    // Now edit the car - find the row and click "Edit"
    const row = newCarRow.closest('tr');
    expect(row).not.toBeNull();
    const editBtn = within(row as HTMLElement).getByText(/Edit/i);
    fireEvent.click(editBtn);

    // Update make to UpdatedMake and submit
    let makeEditInput: HTMLElement;
    try { makeEditInput = screen.getByPlaceholderText(/Toyota/i); } catch { makeEditInput = screen.getByLabelText(/Make/i); }
    fireEvent.change(makeEditInput, { target: { value: 'UpdatedMake' } });
    const updateBtn = screen.getByRole('button', { name: /Update Car/i });
    fireEvent.click(updateBtn);

    expect(await screen.findByText(/UpdatedMake TestModel/i)).toBeInTheDocument();

    // Delete the updated car
    const updatedRow = screen.getByText(/UpdatedMake TestModel/i).closest('tr');
    const deleteBtn = within(updatedRow as HTMLElement).getByText(/Delete/i);
    fireEvent.click(deleteBtn);

    // After deletion, the row should no longer be in the document
    expect(screen.queryByText(/UpdatedMake TestModel/i)).not.toBeInTheDocument();
  }, 30000);
});
