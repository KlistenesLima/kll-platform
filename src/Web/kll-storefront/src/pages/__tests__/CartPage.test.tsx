import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CartPage from "../CartPage";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockFetchCart = vi.fn().mockResolvedValue(undefined);
const mockUpdateItem = vi.fn().mockResolvedValue(undefined);
const mockRemoveItem = vi.fn().mockResolvedValue(undefined);
const mockClearCart = vi.fn().mockResolvedValue(undefined);

vi.mock("../../store/cartStore", () => ({
  useCartStore: vi.fn(() => ({
    items: [],
    total: 0,
    itemCount: 0,
    fetchCart: mockFetchCart,
    updateItem: mockUpdateItem,
    removeItem: mockRemoveItem,
    clearCart: mockClearCart,
  })),
}));

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({ isAuthenticated: true })),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderCart() {
  return render(
    <BrowserRouter>
      <CartPage />
    </BrowserRouter>
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchCart.mockResolvedValue(undefined);
    (useAuthStore as any).mockReturnValue({ isAuthenticated: true });
    (useCartStore as any).mockReturnValue({
      items: [],
      total: 0,
      itemCount: 0,
      fetchCart: mockFetchCart,
      updateItem: mockUpdateItem,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    });
  });

  it("renders cart heading after loading", async () => {
    renderCart();
    await waitFor(() => {
      expect(screen.getByText("Carrinho")).toBeTruthy();
    });
  });

  it("shows empty cart message when no items", async () => {
    renderCart();
    await waitFor(() => {
      expect(screen.getByText(/Seu carrinho esta vazio/)).toBeTruthy();
    });
  });

  it("shows Explorar Produtos link on empty cart", async () => {
    renderCart();
    await waitFor(() => {
      expect(screen.getByText("Explorar Produtos")).toBeTruthy();
    });
  });

  it("redirects to login when not authenticated", async () => {
    (useAuthStore as any).mockReturnValue({ isAuthenticated: false });

    renderCart();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });

  it("displays items when cart has products", async () => {
    (useCartStore as any).mockReturnValue({
      items: [
        { productId: "p1", productName: "Test Product", unitPrice: 100, quantity: 2, total: 200 },
      ],
      total: 200,
      itemCount: 2,
      fetchCart: mockFetchCart,
      updateItem: mockUpdateItem,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    });

    renderCart();
    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeTruthy();
    });
  });

  it("shows Finalizar Compra button with items", async () => {
    (useCartStore as any).mockReturnValue({
      items: [
        { productId: "p1", productName: "Item", unitPrice: 50, quantity: 1, total: 50 },
      ],
      total: 50,
      itemCount: 1,
      fetchCart: mockFetchCart,
      updateItem: mockUpdateItem,
      removeItem: mockRemoveItem,
      clearCart: mockClearCart,
    });

    renderCart();
    await waitFor(() => {
      expect(screen.getByText("Finalizar Compra")).toBeTruthy();
    });
  });
});
