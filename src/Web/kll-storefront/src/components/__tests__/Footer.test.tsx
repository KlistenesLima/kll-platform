import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "../Footer";

function renderFooter() {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
}

describe("Footer", () => {
  it("renders the KLL Store brand", () => {
    renderFooter();
    expect(screen.getByText("KLL")).toBeTruthy();
    expect(screen.getByText("Store")).toBeTruthy();
  });

  it("renders footer sections", () => {
    renderFooter();
    expect(screen.getByText("Navegacao")).toBeTruthy();
    expect(screen.getByText("Conta")).toBeTruthy();
    expect(screen.getByText("Contato")).toBeTruthy();
  });

  it("renders copyright text", () => {
    renderFooter();
    expect(screen.getByText(/KLL Store/)).toBeTruthy();
  });

  it("contains navigation links", () => {
    const { container } = renderFooter();
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });
});
