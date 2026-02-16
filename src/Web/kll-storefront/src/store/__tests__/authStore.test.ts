import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../authStore";

function createFakeJwt(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesig`;
}

describe("authStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  });

  it("starts with default unauthenticated state", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAdmin).toBe(false);
  });

  it("login sets authenticated state and parses JWT", () => {
    const token = createFakeJwt({
      sub: "user-123",
      preferred_username: "testuser",
      email: "test@kll.com",
      realm_roles: ["customer"],
    });

    useAuthStore.getState().login(token);
    const state = useAuthStore.getState();

    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(token);
    expect(state.user?.preferred_username).toBe("testuser");
    expect(state.user?.email).toBe("test@kll.com");
    expect(state.user?.sub).toBe("user-123");
    expect(state.isAdmin).toBe(false);
  });

  it("login detects admin role", () => {
    const token = createFakeJwt({
      sub: "admin-1",
      preferred_username: "admin",
      email: "admin@kll.com",
      realm_roles: ["admin", "customer"],
    });

    useAuthStore.getState().login(token);
    const state = useAuthStore.getState();

    expect(state.isAdmin).toBe(true);
    expect(state.user?.realm_roles).toContain("admin");
  });

  it("login saves token to localStorage", () => {
    const token = createFakeJwt({ sub: "u1", preferred_username: "u", email: "u@t.com" });
    useAuthStore.getState().login(token);
    expect(localStorage.getItem("kll_token")).toBe(token);
  });

  it("logout clears state", () => {
    const token = createFakeJwt({ sub: "u1", preferred_username: "u", email: "u@t.com" });
    useAuthStore.getState().login(token);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAdmin).toBe(false);
  });

  it("logout removes token from localStorage", () => {
    const token = createFakeJwt({ sub: "u1", preferred_username: "u", email: "u@t.com" });
    useAuthStore.getState().login(token);
    useAuthStore.getState().logout();
    expect(localStorage.getItem("kll_token")).toBeNull();
  });

  it("init restores valid token from localStorage", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const token = createFakeJwt({
      sub: "u1",
      preferred_username: "restored",
      email: "r@kll.com",
      realm_roles: ["customer"],
      exp: futureExp,
    });

    localStorage.setItem("kll_token", token);
    useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.preferred_username).toBe("restored");
  });

  it("init ignores expired token", () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const token = createFakeJwt({
      sub: "u1",
      preferred_username: "expired",
      email: "e@kll.com",
      exp: pastExp,
    });

    localStorage.setItem("kll_token", token);
    useAuthStore.getState().init();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("kll_token")).toBeNull();
  });

  it("init does nothing when no token in localStorage", () => {
    useAuthStore.getState().init();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
  });
});
