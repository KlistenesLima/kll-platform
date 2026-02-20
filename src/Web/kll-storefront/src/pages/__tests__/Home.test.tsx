import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "../Home";

vi.mock("../../services/api", () => ({
  productApi: {
    getAll: vi.fn().mockResolvedValue([
      { id: "1", name: "Product 1", description: "Desc", price: 100, stockQuantity: 10, category: "Cat", isActive: true, createdAt: "2026-01-01" },
    ]),
  },
  categoryApi: {
    getAll: vi.fn().mockResolvedValue([
      { id: "1", name: "Electronics", slug: "electronics", isActive: true, displayOrder: 0 },
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

function renderHome() {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
}

describe("Home", () => {
  it("renders the hero heading", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/Joias que contam/)).toBeTruthy();
    });
  });

  it("renders feature sections", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText(/Frete gr/)).toBeTruthy();
    });
  });

  it("loads and displays products", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeTruthy();
    });
  });

  it("displays categories section", async () => {
    renderHome();
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeTruthy();
    });
  });
});
