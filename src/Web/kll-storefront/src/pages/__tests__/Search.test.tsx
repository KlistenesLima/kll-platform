import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Search from "../Search";

vi.mock("../../services/api", () => ({
  productApi: {
    search: vi.fn().mockResolvedValue({
      items: [
        { id: "1", name: "Smartphone X", description: "Desc", price: 2999, stockQuantity: 5, category: "Tech", isActive: true, createdAt: "2026-01-01" },
      ],
      totalCount: 1,
    }),
  },
  categoryApi: {
    getAll: vi.fn().mockResolvedValue([
      { id: "c1", name: "Eletronicos", slug: "eletronicos", isActive: true, displayOrder: 0 },
    ]),
  },
}));

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({ isAuthenticated: false })),
}));

vi.mock("../../store/cartStore", () => ({
  useCartStore: vi.fn(() => ({ addItem: vi.fn() })),
}));

vi.mock("../../store/favoritesStore", () => ({
  useFavoritesStore: vi.fn(() => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
    count: 0,
  })),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderSearch(route = "/search") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Search />
    </MemoryRouter>
  );
}

describe("Search", () => {
  it("renders catalog heading when no query", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText(/Nossas Pe/)).toBeTruthy();
    });
  });

  it("renders search results heading with query", async () => {
    renderSearch("/search?q=phone");
    await waitFor(() => {
      expect(screen.getByText(/Resultados para/)).toBeTruthy();
    });
  });

  it("loads and displays products", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText("Smartphone X")).toBeTruthy();
    });
  });

  it("displays category sidebar", async () => {
    renderSearch();
    await waitFor(() => {
      const elements = screen.getAllByText("Eletronicos");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("shows Todos link in categories", async () => {
    renderSearch();
    await waitFor(() => {
      const elements = screen.getAllByText("Todos");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("displays sort select", async () => {
    renderSearch();
    await waitFor(() => {
      const elements = screen.getAllByText("Mais Recentes");
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it("shows product count", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText(/1 produto encontrado/)).toBeTruthy();
    });
  });
});
