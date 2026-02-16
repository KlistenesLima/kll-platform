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
      expect(screen.getByText("Catalogo")).toBeTruthy();
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
      expect(screen.getByText("Eletronicos")).toBeTruthy();
    });
  });

  it("shows Todos link in categories", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText("Todos")).toBeTruthy();
    });
  });

  it("displays sort select", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText("Mais Recentes")).toBeTruthy();
    });
  });

  it("shows product count", async () => {
    renderSearch();
    await waitFor(() => {
      expect(screen.getByText(/1 produto encontrado/)).toBeTruthy();
    });
  });
});
