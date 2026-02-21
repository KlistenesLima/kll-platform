import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../ProductCard";
import type { Product } from "../../types";

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}));

vi.mock("../../store/cartStore", () => ({
  useCartStore: vi.fn(() => ({
    addItem: vi.fn(),
  })),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const mockProduct: Product = {
  id: "123",
  name: "iPhone 15 Pro",
  description: "Apple iPhone 15 Pro 256GB",
  price: 8999.99,
  stockQuantity: 50,
  category: "Eletronicos",
  imageUrl: "https://example.com/iphone.jpg",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
};

function renderCard(product = mockProduct) {
  return render(
    <BrowserRouter>
      <ProductCard product={product} />
    </BrowserRouter>
  );
}

describe("ProductCard", () => {
  it("renders product name", () => {
    renderCard();
    expect(screen.getByText("iPhone 15 Pro")).toBeTruthy();
  });

  it("renders product price formatted in BRL", () => {
    renderCard();
    const priceText = screen.getByText(/8\.999,99/);
    expect(priceText).toBeTruthy();
  });

  it("renders product category", () => {
    renderCard();
    expect(screen.getByText("Eletronicos")).toBeTruthy();
  });

  it("renders as a link to product detail", () => {
    const { container } = renderCard();
    const link = container.querySelector('a[href="/product/123"]');
    expect(link).toBeTruthy();
  });

  it("renders add to cart button", () => {
    const { container } = renderCard();
    const button = container.querySelector("button");
    expect(button).toBeTruthy();
  });

  it("renders product without image gracefully", () => {
    const noImgProduct = { ...mockProduct, imageUrl: undefined };
    renderCard(noImgProduct);
    expect(screen.getByText("iPhone 15 Pro")).toBeTruthy();
  });
});
