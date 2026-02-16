import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios", async () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn(),
    },
  };
});

describe("api module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates axios instance", async () => {
    await import("../api");
    expect(axios.create).toHaveBeenCalled();
  });

  it("configures interceptors", async () => {
    const mod = await import("../api");
    const instance = (axios.create as any).mock.results[0]?.value;
    if (instance) {
      expect(instance.interceptors.request.use).toHaveBeenCalled();
      expect(instance.interceptors.response.use).toHaveBeenCalled();
    }
  });

  it("exports productApi with expected methods", async () => {
    const mod = await import("../api");
    expect(mod.productApi).toBeDefined();
    expect(typeof mod.productApi.getAll).toBe("function");
    expect(typeof mod.productApi.getById).toBe("function");
    expect(typeof mod.productApi.search).toBe("function");
    expect(typeof mod.productApi.getByCategory).toBe("function");
  });

  it("exports categoryApi with expected methods", async () => {
    const mod = await import("../api");
    expect(mod.categoryApi).toBeDefined();
    expect(typeof mod.categoryApi.getAll).toBe("function");
    expect(typeof mod.categoryApi.getTree).toBe("function");
  });

  it("exports cartApi with expected methods", async () => {
    const mod = await import("../api");
    expect(mod.cartApi).toBeDefined();
    expect(typeof mod.cartApi.get).toBe("function");
    expect(typeof mod.cartApi.addItem).toBe("function");
    expect(typeof mod.cartApi.updateItem).toBe("function");
    expect(typeof mod.cartApi.removeItem).toBe("function");
    expect(typeof mod.cartApi.clear).toBe("function");
  });

  it("exports orderApi with expected methods", async () => {
    const mod = await import("../api");
    expect(mod.orderApi).toBeDefined();
    expect(typeof mod.orderApi.create).toBe("function");
    expect(typeof mod.orderApi.getById).toBe("function");
    expect(typeof mod.orderApi.getMine).toBe("function");
  });

  it("exports authApi with expected methods", async () => {
    const mod = await import("../api");
    expect(mod.authApi).toBeDefined();
    expect(typeof mod.authApi.login).toBe("function");
    expect(typeof mod.authApi.register).toBe("function");
  });

  it("exports default api instance", async () => {
    const mod = await import("../api");
    expect(mod.default).toBeDefined();
  });
});
