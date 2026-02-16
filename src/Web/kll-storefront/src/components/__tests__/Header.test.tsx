import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "../Header";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
    user: null,
    isAdmin: false,
    logout: vi.fn(),
  })),
}));

vi.mock("../../store/cartStore", () => ({
  useCartStore: vi.fn(() => ({
    itemCount: 0,
  })),
}));

function renderHeader() {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
}

describe("Header", () => {
  it("renders the Luxe Store brand name", () => {
    renderHeader();
    expect(screen.getByText("Luxe")).toBeTruthy();
    expect(screen.getByText("Store")).toBeTruthy();
  });

  it("renders navigation links", () => {
    renderHeader();
    expect(screen.getByText("Home")).toBeTruthy();
  });

  it("renders search form", () => {
    const { container } = renderHeader();
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
  });

  it("shows login link when not authenticated", () => {
    renderHeader();
    expect(screen.getByText("Entrar")).toBeTruthy();
  });
});

describe("Header - Authenticated", () => {
  it("shows logout button when authenticated", () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: { preferred_username: "testuser", email: "test@kll.com" },
      isAdmin: false,
      logout: vi.fn(),
    });
    (useCartStore as any).mockReturnValue({ itemCount: 3 });

    renderHeader();
    expect(screen.getByText("Sair")).toBeTruthy();
  });

  it("shows user initial avatar when authenticated", () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: { preferred_username: "testuser", email: "test@kll.com" },
      isAdmin: false,
      logout: vi.fn(),
    });
    (useCartStore as any).mockReturnValue({ itemCount: 0 });

    renderHeader();
    expect(screen.getByText("T")).toBeTruthy();
  });

  it("shows cart count badge", () => {
    (useAuthStore as any).mockReturnValue({
      isAuthenticated: true,
      user: { preferred_username: "testuser", email: "test@kll.com" },
      isAdmin: false,
      logout: vi.fn(),
    });
    (useCartStore as any).mockReturnValue({ itemCount: 3 });

    renderHeader();
    expect(screen.getByText("3")).toBeTruthy();
  });
});
