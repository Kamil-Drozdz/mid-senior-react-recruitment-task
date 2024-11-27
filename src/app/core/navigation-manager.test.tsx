import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach, vi } from "vitest";
import NavigationManager from "./navigation-manager";
import { useNavigation } from "../hooks/use-navigation";
import { useNavigationManagerHelper } from "../hooks/use-navigation-manager-helper";
import useIsMobile from "../hooks/use-is-mobile";

// Mock hooki
vi.mock("../hooks/use-navigation");
vi.mock("../hooks/use-navigation-manager-helper");
vi.mock("../hooks/use-is-mobile");

describe("NavigationManager", () => {
  // Przygotowanie mocków
  const mockItems = [
    { id: "1", label: "Test Item 1", url: "https://example.com" },
    {
      id: "2",
      label: "Test Item 2",
      url: "https://example.com",
      children: [
        { id: "2-1", label: "Child Item 1", url: "https://example.com" },
      ],
    },
  ];

  const mockHelpers = {
    getAllItems: vi.fn().mockReturnValue(["1", "2", "2-1"]),
    handleDragEnd: vi.fn(),
    handleSubmit: vi.fn(),
  };

  beforeEach(() => {
    // Resetowanie mocków przed każdym testem
    (useNavigation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      items: mockItems,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      reorderItems: vi.fn(),
    });

    (
      useNavigationManagerHelper as unknown as ReturnType<typeof vi.fn>
    ).mockReturnValue(mockHelpers);
    (useIsMobile as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
  });

  test("renderuje pusty stan menu", () => {
    (useNavigation as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      items: [],
      addItem: vi.fn(),
      updateItem: vi.fn(),
      removeItem: vi.fn(),
      reorderItems: vi.fn(),
    });

    render(<NavigationManager />);
    expect(screen.getByText("Menu jest puste")).toBeInTheDocument();
    expect(
      screen.getByText("W tym menu nie ma jeszcze żadnych linków.")
    ).toBeInTheDocument();
  });

  test("renderuje listę elementów menu", () => {
    render(<NavigationManager />);
    expect(screen.getByText("Test Item 1")).toBeInTheDocument();
    expect(screen.getByText("Test Item 2")).toBeInTheDocument();
  });

  test("pokazuje formularz dodawania po kliknięciu przycisku", async () => {
    render(<NavigationManager />);

    const addButtons = screen.getAllByText("Dodaj pozycję menu");

    expect(addButtons.length).toBeGreaterThan(0);

    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId("navigation-form")).toBeInTheDocument();
    });
  });

  test("wyświetla poprawne liczniki elementów i linków", () => {
    render(<NavigationManager />);
    expect(screen.getAllByText("Ilość pozycji w menu: 3"));
    expect(screen.getAllByText("Ilość linków w menu: 3"));
  });
});
