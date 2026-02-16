import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCartStore } from "../cartStore";

const mockGet = vi.fn();
const mockAddItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockRemoveItem = vi.fn();
const mockClear = vi.fn();

vi.mock("../../services/api", () => ({
  cartApi: {
    get: (...args: any[]) => mockGet(...args),
    addItem: (...args: any[]) => mockAddItem(...args),
    updateItem: (...args: any[]) => mockUpdateItem(...args),
    removeItem: (...args: any[]) => mockRemoveItem(...args),
    clear: (...args: any[]) => mockClear(...args),
  },
}));

describe("cartStore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
    });
  });

  it("starts with empty cart state", () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  it("fetchCart populates cart from API", async () => {
    mockGet.mockResolvedValue({
      items: [{ productId: "p1", productName: "Test", unitPrice: 100, quantity: 2, total: 200 }],
      total: 200,
      itemCount: 2,
    });

    await useCartStore.getState().fetchCart();
    const state = useCartStore.getState();

    expect(state.items).toHaveLength(1);
    expect(state.total).toBe(200);
    expect(state.itemCount).toBe(2);
  });

  it("fetchCart resets on error", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));

    await useCartStore.getState().fetchCart();
    const state = useCartStore.getState();

    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.itemCount).toBe(0);
  });

  it("addItem calls API and updates totals", async () => {
    mockAddItem.mockResolvedValue({ total: 500, itemCount: 1 });

    await useCartStore.getState().addItem("p1", 1);
    const state = useCartStore.getState();

    expect(mockAddItem).toHaveBeenCalledWith("p1", 1);
    expect(state.total).toBe(500);
    expect(state.itemCount).toBe(1);
  });

  it("addItem defaults quantity to 1", async () => {
    mockAddItem.mockResolvedValue({ total: 100, itemCount: 1 });

    await useCartStore.getState().addItem("p1");
    expect(mockAddItem).toHaveBeenCalledWith("p1", 1);
  });

  it("updateItem calls API and updates totals", async () => {
    mockUpdateItem.mockResolvedValue({ total: 300, itemCount: 3 });

    await useCartStore.getState().updateItem("p1", 3);
    const state = useCartStore.getState();

    expect(mockUpdateItem).toHaveBeenCalledWith("p1", 3);
    expect(state.total).toBe(300);
    expect(state.itemCount).toBe(3);
  });

  it("removeItem calls API", async () => {
    mockRemoveItem.mockResolvedValue(undefined);

    await useCartStore.getState().removeItem("p1");
    expect(mockRemoveItem).toHaveBeenCalledWith("p1");
  });

  it("clearCart calls API and resets state", async () => {
    mockClear.mockResolvedValue(undefined);

    useCartStore.setState({ items: [{ productId: "p1", productName: "X", unitPrice: 10, quantity: 1, total: 10 }], total: 10, itemCount: 1 });

    await useCartStore.getState().clearCart();
    const state = useCartStore.getState();

    expect(mockClear).toHaveBeenCalled();
    expect(state.items).toEqual([]);
    expect(state.total).toBe(0);
    expect(state.itemCount).toBe(0);
  });
});
