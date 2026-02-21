import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../Register";

vi.mock("../../services/api", () => ({
  authApi: {
    register: vi.fn().mockResolvedValue({}),
    confirmEmail: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../../store/authStore", () => ({
  useAuthStore: vi.fn(() => ({
    isAuthenticated: false,
  })),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderRegister() {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
}

describe("Register", () => {
  it("renders the AUREA Maison heading", () => {
    renderRegister();
    expect(screen.getByText("AUREA")).toBeTruthy();
    expect(screen.getByText("Maison")).toBeTruthy();
  });

  it("renders the registration form", () => {
    const { container } = renderRegister();
    const form = container.querySelector("form");
    expect(form).toBeTruthy();
  });

  it("renders full name input", () => {
    renderRegister();
    expect(screen.getByText("Nome completo")).toBeTruthy();
  });

  it("renders email input", () => {
    renderRegister();
    expect(screen.getByText("E-mail")).toBeTruthy();
  });

  it("renders CPF input", () => {
    renderRegister();
    expect(screen.getByText("CPF")).toBeTruthy();
  });

  it("renders password input", () => {
    renderRegister();
    expect(screen.getByText("Senha")).toBeTruthy();
  });

  it("renders confirm password input", () => {
    renderRegister();
    expect(screen.getByText("Confirmar senha")).toBeTruthy();
  });

  it("renders submit button", () => {
    renderRegister();
    const button = screen.getByText("Criar Conta");
    expect(button).toBeTruthy();
    expect(button.tagName).toBe("BUTTON");
  });

  it("renders login link", () => {
    renderRegister();
    expect(screen.getByText("Entrar")).toBeTruthy();
  });

  it("renders Crie sua conta subtitle", () => {
    renderRegister();
    expect(screen.getByText("Crie sua conta")).toBeTruthy();
  });

  it("renders step indicators", () => {
    const { container } = renderRegister();
    const steps = container.querySelectorAll('[style*="width: 32"]');
    expect(steps.length).toBeGreaterThanOrEqual(1);
  });
});
