import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { NavigationForm } from './navigation-form';
const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

describe('NavigationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockClear();

    mockOnCancel.mockClear();
  });
  describe('sprawdz po blędnym wypełnianu formularza czy pokazuje błedy dla użytkownika', () => {
    test('sprawdz czy pokazuje błędy walidacji', async () => {
      render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      fireEvent.click(screen.getByRole('button', { name: /dodaj/i }));

      await waitFor(() => {
        expect(screen.getByText('Nazwa jest wymagana')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Wklej lub wyszukaj'), {
        target: { value: 'niepoprawny-url' },
      });

      fireEvent.click(screen.getByRole('button', { name: /dodaj/i }));

      await waitFor(() => {
        expect(screen.getByText('Nieprawidłowy adres URL')).toBeInTheDocument();
      });
    });
  });

  test('renderuje pusty formularz dla nowego elementu', () => {
    render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const addButtons = screen.queryAllByRole('button', { name: /dodaj/i });
    const cancelButtons = screen.queryAllByRole('button', { name: /anuluj/i });

    expect(addButtons).toHaveLength(1);
    expect(cancelButtons).toHaveLength(1);
  });

  test('wypełnia formularz danymi inicjalnymi', () => {
    const initialData = {
      id: '1',
      label: 'Test Item',
      url: 'https://test.com',
    };

    render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} initialData={initialData} />);

    const labelInput = screen.getByDisplayValue('Test Item');
    const urlInput = screen.getByDisplayValue('https://test.com');

    expect(labelInput).toHaveValue('Test Item');
    expect(urlInput).toHaveValue('https://test.com');
  });

  // test("wywołuje onSubmit z poprawnymi danymi", async () => {
  //   render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

  //   fireEvent.change(screen.getByPlaceholderText("np. Promocje"), {
  //     target: { value: "Nowy Element" },
  //   });

  //   fireEvent.change(screen.getByPlaceholderText("Wklej lub wyszukaj"), {
  //     target: { value: "https://nowy.com" },
  //   });

  //   fireEvent.click(screen.getByRole("button", { name: /dodaj/i }));

  //   await waitFor(() => {
  //     expect(mockOnSubmit.mock.calls[0][0]).toEqual({
  //       label: "Nowy Element",
  //       url: "https://nowy.com",
  //     });
  //   });
  // });

  test('wywołuje onCancel po kliknięciu anuluj', () => {
    render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(mockOnCancel).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /anuluj/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('waliduje wymagane pola', async () => {
    render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /dodaj/i }));

    await waitFor(() => {
      expect(screen.getByText(/nazwa jest wymagana/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  test('wywołuje onCancel po kliknięciu ikony kosza', () => {
    render(<NavigationForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(mockOnCancel).not.toHaveBeenCalled();
    const trashIcon = screen.getByTestId('trash-icon');
    fireEvent.click(trashIcon);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
