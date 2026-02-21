import { create } from "zustand";
import type { User } from "../types";

function parseJwt(token: string): any {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function extractUser(decoded: any): User {
  // Custom JWT claims (ClaimTypes.Role, ClaimTypes.Name)
  const role = decoded?.role ||
    decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
  const fullName = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    decoded?.name || decoded?.preferred_username || "";

  // Build realm_roles for backward compat with Keycloak tokens
  const realmRoles: string[] = decoded?.realm_roles || [];
  if (role && !realmRoles.includes(role)) {
    // Map custom roles to admin check
    if (role === "Administrador" || role === "Tecnico") realmRoles.push("admin");
  }

  return {
    sub: decoded?.sub || "",
    preferred_username: decoded?.preferred_username || decoded?.email || fullName || "",
    email: decoded?.email || "",
    realm_roles: realmRoles,
    fullName,
    role,
    document: decoded?.document || "",
  };
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
    const user = extractUser(decoded);
    const avatarUrl = localStorage.getItem("kll_avatar_url") || null;
    const isAdmin = user.realm_roles.includes("admin") ||
      user.role === "Administrador" || user.role === "Tecnico";
    set({ token, user, isAuthenticated: true, isAdmin, avatarUrl });
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
        const user = extractUser(decoded);
        const avatarUrl = localStorage.getItem("kll_avatar_url") || null;
        const isAdmin = user.realm_roles.includes("admin") ||
          user.role === "Administrador" || user.role === "Tecnico";
        set({ token, user, isAuthenticated: true, isAdmin, avatarUrl });
      } else { localStorage.removeItem("kll_token"); }
    }
  },
  setAvatarUrl: (url) => {
    if (url) localStorage.setItem("kll_avatar_url", url);
    else localStorage.removeItem("kll_avatar_url");
    set({ avatarUrl: url });
  },
}));
