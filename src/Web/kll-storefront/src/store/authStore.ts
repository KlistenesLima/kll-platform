import { create } from "zustand";
import type { User } from "../types";

function parseJwt(token: string): any {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch { return null; }
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null, user: null, isAuthenticated: false, isAdmin: false,
  login: (token) => {
    localStorage.setItem("kll_token", token);
    const decoded = parseJwt(token);
    const user: User = {
      sub: decoded?.sub || "",
      preferred_username: decoded?.preferred_username || "",
      email: decoded?.email || "",
      realm_roles: decoded?.realm_roles || [],
    };
    set({ token, user, isAuthenticated: true, isAdmin: user.realm_roles.includes("admin") });
  },
  logout: () => {
    localStorage.removeItem("kll_token");
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false });
  },
  init: () => {
    const token = localStorage.getItem("kll_token");
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        const user: User = {
          sub: decoded.sub, preferred_username: decoded.preferred_username,
          email: decoded.email, realm_roles: decoded.realm_roles || [],
        };
        set({ token, user, isAuthenticated: true, isAdmin: user.realm_roles.includes("admin") });
      } else { localStorage.removeItem("kll_token"); }
    }
  },
}));
