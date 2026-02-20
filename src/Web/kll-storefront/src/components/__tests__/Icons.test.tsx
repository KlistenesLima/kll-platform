import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  SearchIcon, CartIcon, UserIcon, SettingsIcon,
  TruckIcon, ShieldIcon, RefreshIcon, HeadphonesIcon,
  ChevronRightIcon, DiamondIcon,
} from "../Icons";

describe("Icons", () => {
  it("renders SearchIcon as SVG", () => {
    const { container } = render(<SearchIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders CartIcon as SVG", () => {
    const { container } = render(<CartIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders UserIcon as SVG", () => {
    const { container } = render(<UserIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders SettingsIcon as SVG", () => {
    const { container } = render(<SettingsIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders TruckIcon as SVG", () => {
    const { container } = render(<TruckIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders ShieldIcon as SVG", () => {
    const { container } = render(<ShieldIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders RefreshIcon as SVG", () => {
    const { container } = render(<RefreshIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders HeadphonesIcon as SVG", () => {
    const { container } = render(<HeadphonesIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders ChevronRightIcon as SVG", () => {
    const { container } = render(<ChevronRightIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders DiamondIcon as SVG", () => {
    const { container } = render(<DiamondIcon />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("applies custom size", () => {
    const { container } = render(<SearchIcon size={32} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("32");
    expect(svg?.getAttribute("height")).toBe("32");
  });

  it("applies custom color", () => {
    const { container } = render(<CartIcon color="#ff0000" />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("stroke")).toBe("#ff0000");
  });

  it("uses default size of 20", () => {
    const { container } = render(<UserIcon />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("20");
  });
});
