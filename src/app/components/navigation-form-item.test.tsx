import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, screen, fireEvent, within, cleanup, waitFor } from '@testing-library/react';
import { NavigationItem } from '@/components/navigation-form-item';
import { DndContext } from '@dnd-kit/core';
import { setIsDragging } from '../test/mocks/dnd-kit-mocks';

console.log('\x1b[36m%s\x1b[0m', `🧪 Running tests: ${new Date().toLocaleString()}`);

describe('NavigationItem', () => {
  const mockItem = {
    id: '1',
    label: 'Test Item 1',
    url: 'https://example.com',
  };

  const mockNestedItem = {
    ...mockItem,
    label: 'Parent Item',
    children: [
      {
        id: '2',
        label: 'Child Item 1',
        url: null,
        children: [
          {
            id: '3',
            label: 'Grandchild Item 1',
            url: 'https://example.com/child/grandchild',
          },
        ],
      },
    ],
  };

  const defaultProps = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onAddChild: vi.fn(),
    isAddingItem: false,
    editingItemId: null,
    addingChildToId: null,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    firstItem: false,
    level: 0,
  };

  const renderNavigationItem = (props = {}) => {
    return render(
      <DndContext>
        <NavigationItem isMobile={false} item={mockItem} {...defaultProps} {...props} />
      </DndContext>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setIsDragging(false);
  });

  describe('Renderowanie podstawowe', () => {
    test('renderuje podstawowe elementy', () => {
      renderNavigationItem({ item: mockItem });

      expect(screen.getByLabelText('Przenieś element')).toBeInTheDocument();
      expect(screen.getByText(mockItem.label)).toBeInTheDocument();
      expect(screen.getByText(mockItem.url)).toBeInTheDocument();
    });

    test('renderuje przyciski akcji z odpowiednimi stylami', () => {
      renderNavigationItem({ item: mockItem });

      const editButton = screen.getAllByText('Edytuj')[0];
      const deleteButton = screen.getAllByText('Usuń')[0];
      const addButton = screen.getAllByText('Dodaj pozycję menu')[0];

      expect(editButton).toHaveClass('rounded-none', 'border-r-0', 'rounded-l-lg');
      expect(deleteButton).toHaveClass('rounded-none');
      expect(addButton).toHaveClass('rounded-none', 'border-l-0', 'rounded-r-lg');
    });
  });

  describe('Interakcje z przyciskami', () => {
    test('przyciski wywołują odpowiednie callbacki z poprawnymi argumentami', () => {
      renderNavigationItem({ item: mockItem });

      fireEvent.click(screen.getByText('Edytuj'));
      expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem.id);

      fireEvent.click(screen.getByText('Usuń'));
      expect(defaultProps.onDelete).toHaveBeenCalledWith(mockItem.id);

      fireEvent.click(screen.getByText('Dodaj pozycję menu'));
      expect(defaultProps.onAddChild).toHaveBeenCalledWith(mockItem.id);
    });

    test('przyciski są wyłączone podczas edycji', () => {
      renderNavigationItem({
        item: mockItem,
        editingItemId: mockItem.id,
      });

      expect(screen.getByText('Dodaj pozycję menu')).toBeDisabled();
      expect(screen.getByText('Usuń')).toBeDisabled();
    });
  });

  describe('Obsługa formularzy', () => {
    test('renderuje formularz edycji z poprawnymi danymi', () => {
      renderNavigationItem({
        item: mockItem,
        editingItemId: mockItem.id,
      });
      const nameInput = screen.getByPlaceholderText('np. Promocje') as HTMLInputElement;
      const urlInput = screen.getByPlaceholderText('Wklej lub wyszukaj') as HTMLInputElement;

      expect(nameInput.value).toBe(mockItem.label);
      expect(urlInput.value).toBe(mockItem.url);
    });
  });

  describe('Zagnieżdżone elementy', () => {
    test('renderuje zagnieżdżone elementy z poprawnymi poziomami', () => {
      renderNavigationItem({
        item: mockNestedItem,
        level: 0,
      });

      const parentElement = screen.getByText('Parent Item').closest('[data-testid="data-test-level-0"]');
      const childElement = screen.getByText('Child Item 1').closest('[data-testid="data-test-level-1"]');
      const grandchildElement = screen.getByText('Grandchild Item 1').closest('[data-testid="data-test-level-2"]');

      expect(parentElement).toHaveClass('w-full');
      expect(childElement).toHaveClass('w-[calc(100%-3rem)]');
      expect(grandchildElement).toHaveClass('w-[calc(100%-6rem)]');
    });

    test('obsługuje dodawanie dzieci na różnych poziomach', () => {
      renderNavigationItem({
        item: mockNestedItem,
        addingChildToId: mockNestedItem.children[0].id,
      });

      const form = screen.getByRole('form');
      expect(form).toBeInTheDocument();
      expect(form.closest('[class*="ml-"]')).toHaveClass('md:ml-8');
    });
  });

  describe('Walidacja formularzy', () => {
    test('wyświetla błąd dla niepoprawnego URL', async () => {
      renderNavigationItem({
        item: mockItem,
        editingItemId: mockItem.id,
      });

      const urlInput = screen.getByPlaceholderText('Wklej lub wyszukaj');
      const form = screen.getByRole('form');

      await fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
      await fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Nieprawidłowy adres URL')).toBeInTheDocument();
      });
    });

    test('wymaga nazwy elementu', async () => {
      renderNavigationItem({
        item: mockItem,
        editingItemId: mockItem.id,
      });

      const nameInput = screen.getByPlaceholderText('np. Promocje');
      const form = screen.getByRole('form');

      await fireEvent.change(nameInput, { target: { value: '' } });
      await fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Nazwa jest wymagana')).toBeInTheDocument();
      });
    });
  });

  describe('Stany specjalne', () => {
    test('obsługuje brak URL', () => {
      const itemWithoutUrl = { ...mockItem, url: undefined };
      const { container } = renderNavigationItem({ item: itemWithoutUrl });

      expect(container).not.toHaveTextContent('https://example.com');
    });

    test('obsługuje pusty stan dzieci', () => {
      const itemWithEmptyChildren = { ...mockItem, children: [] };
      renderNavigationItem({ item: itemWithEmptyChildren });

      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('obsługuje maksymalny poziom zagnieżdżenia', () => {
      renderNavigationItem({
        item: mockItem,
        level: 5,
      });

      const level5Element = screen.getByTestId('data-test-level-5');
      const addChildButton = within(level5Element).getByText('Dodaj pozycję menu');
      expect(addChildButton).toBeDisabled();
    });
  });
});

console.log('\x1b[36m%s\x1b[0m', `✨ All tests completed: ${new Date().toLocaleString()}`);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
