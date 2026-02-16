import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ProductDetail from "../ProductDetail";

vi.mock("../../services/api", () => ({
  productApi: {
    getById: vi.fn().mockResolvedValue({
      id: "abc",
      name: "Premium Headphones",
      description: "Wireless noise cancelling headphones",
      price: 1499.99,
      stockQuantity: 25,
      category: "Audio",
      imageUrl: "https://example.com/headphones.jpg",
      isActive: true,
      createdAt: "2026-01-01",
    }),
  },
}));

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({ isAuthenticated: true })),
}));

vi.mock("../../store/cartStore", () => ({
  useCartStore: vi.fn(() => ({ addItem: vi.fn().mockResolvedValue(undefined) })),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderProductDetail(id = "abc") {
  return render(
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <Routes>
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProductDetail", () => {
  it("loads and displays product name", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText("Premium Headphones")).toBeTruthy();
    });
  });

  it("displays product description", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText("Wireless noise cancelling headphones")).toBeTruthy();
    });
  });

  it("displays product category", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText("Audio")).toBeTruthy();
    });
  });

  it("displays formatted price", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText(/1\.499,99/)).toBeTruthy();
    });
  });

  it("displays stock availability", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText(/25 disponiveis/)).toBeTruthy();
    });
  });

  it("renders add to cart button", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText(/Adicionar ao Carrinho/)).toBeTruthy();
    });
  });

  it("renders product image", async () => {
    renderProductDetail();
    await waitFor(() => {
      const img = screen.getByAltText("Premium Headphones");
      expect(img).toBeTruthy();
      expect(img.getAttribute("src")).toBe("https://example.com/headphones.jpg");
    });
  });

  it("shows quantity selector", async () => {
    renderProductDetail();
    await waitFor(() => {
      expect(screen.getByText("Quantidade:")).toBeTruthy();
    });
  });
});
