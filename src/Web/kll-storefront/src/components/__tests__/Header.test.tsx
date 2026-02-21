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

vi.mock("../../store/favoritesStore", () => ({
  useFavoritesStore: vi.fn(() => ({
    count: 0,
  })),
}));

vi.mock("../../services/api", () => ({
  profileApi: {
    get: vi.fn().mockResolvedValue({}),
  },
}));

function renderHeader() {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
}

describe("Header", () => {
  it("renders the AUREA Maison brand name", () => {
    renderHeader();
    expect(screen.getAllByText("AUREA").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maison").length).toBeGreaterThan(0);
  });

  it("renders navigation links", () => {
    renderHeader();
    expect(screen.getAllByText("Joias").length).toBeGreaterThan(0);
  });

  it("renders search form", () => {
    const { container } = renderHeader();
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
  });

  it("shows login link when not authenticated", () => {
    renderHeader();
    const entrarLinks = screen.getAllByText(/Entrar/);
    expect(entrarLinks.length).toBeGreaterThan(0);
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
    const sairButtons = screen.getAllByText("Sair");
    expect(sairButtons.length).toBeGreaterThan(0);
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
    const avatars = screen.getAllByText("T");
    expect(avatars.length).toBeGreaterThan(0);
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
    const badges = screen.getAllByText("3");
    expect(badges.length).toBeGreaterThan(0);
  });
});
