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
  avatarUrl: string | null;
  login: (token: string) => void;
  logout: () => void;
  init: () => void;
  setAvatarUrl: (url: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null, user: null, isAuthenticated: false, isAdmin: false, avatarUrl: null,
  login: (token) => {
    localStorage.setItem("kll_token", token);
    const decoded = parseJwt(token);
    const user: User = {
      sub: decoded?.sub || "",
      preferred_username: decoded?.preferred_username || "",
      email: decoded?.email || "",
      realm_roles: decoded?.realm_roles || [],
    };
    const avatarUrl = localStorage.getItem("kll_avatar_url") || null;
    set({ token, user, isAuthenticated: true, isAdmin: user.realm_roles.includes("admin"), avatarUrl });
  },
  logout: () => {
    localStorage.removeItem("kll_token");
    localStorage.removeItem("kll_avatar_url");
    set({ token: null, user: null, isAuthenticated: false, isAdmin: false, avatarUrl: null });
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
        const avatarUrl = localStorage.getItem("kll_avatar_url") || null;
        set({ token, user, isAuthenticated: true, isAdmin: user.realm_roles.includes("admin"), avatarUrl });
      } else { localStorage.removeItem("kll_token"); }
    }
  },
  setAvatarUrl: (url) => {
    if (url) localStorage.setItem("kll_avatar_url", url);
    else localStorage.removeItem("kll_avatar_url");
    set({ avatarUrl: url });
  },
}));
