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
  it("renders the AUREA Maison brand", () => {
    renderFooter();
    expect(screen.getByText("AUREA")).toBeTruthy();
    expect(screen.getByText("Maison")).toBeTruthy();
  });

  it("renders footer sections", () => {
    renderFooter();
    expect(screen.getByText("Minha Conta")).toBeTruthy();
    expect(screen.getByText("Navegação")).toBeTruthy();
    expect(screen.getByText("Portfólio")).toBeTruthy();
    expect(screen.getByText("Contato")).toBeTruthy();
  });

  it("renders copyright text", () => {
    renderFooter();
    expect(screen.getByText(/Klístenes Lima/)).toBeTruthy();
  });

  it("contains navigation links", () => {
    const { container } = renderFooter();
    const links = container.querySelectorAll("a");
    expect(links.length).toBeGreaterThan(0);
  });
});
