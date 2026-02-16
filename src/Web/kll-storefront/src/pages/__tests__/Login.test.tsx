import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../Login";

vi.mock("../../services/api", () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({ access_token: "fake-token" }),
  },
}));

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
  })),
}));

vi.mock("../../store/cartStore", () => ({
  useCartStore: vi.fn(() => ({
    fetchCart: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
}

describe("Login", () => {
  it("renders the KLL Store heading", () => {
    renderLogin();
    expect(screen.getByText("KLL")).toBeTruthy();
    expect(screen.getByText("Store")).toBeTruthy();
  });

  it("renders the login form", () => {
    const { container } = renderLogin();
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
  });

  it("renders username input", () => {
    renderLogin();
    expect(screen.getByText(/E-mail ou usuario/)).toBeTruthy();
  });

  it("renders password input", () => {
    renderLogin();
    expect(screen.getByText("Senha")).toBeTruthy();
  });

  it("renders submit button with Entrar text", () => {
    renderLogin();
    const button = screen.getByText("Entrar");
    expect(button).toBeTruthy();
    expect(button.tagName).toBe("BUTTON");
  });

  it("renders create account link", () => {
    renderLogin();
    expect(screen.getByText("Criar conta")).toBeTruthy();
  });

  it("renders Acesse sua conta subtitle", () => {
    renderLogin();
    expect(screen.getByText("Acesse sua conta")).toBeTruthy();
  });
});
