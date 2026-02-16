import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";
import { SearchIcon, CartIcon, UserIcon, SettingsIcon } from "./Icons";

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { nav(`/search?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); setQuery(""); }
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/search", label: "Produtos" },
      { to: "/search?view=categories", label: "Categorias" },
  ];

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(15, 15, 26, 0.97)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(201, 169, 98, 0.15)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1400, margin: "0 auto", padding: "0 2rem", height: 72
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "#fff" }}>Luxe</span>
            <span style={{ color: "#c9a962" }}>Store</span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} style={{
                fontSize: "0.8rem", fontWeight: 500, color: "#9898ab", textTransform: "uppercase",
                letterSpacing: "2px", textDecoration: "none", transition: "color 0.2s",
                padding: "0.25rem 0", borderBottom: "1px solid transparent"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#c9a962"; e.currentTarget.style.borderBottomColor = "#c9a962"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9898ab"; e.currentTarget.style.borderBottomColor = "transparent"; }}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 42, height: 42, color: searchOpen ? "#c9a962" : "#9898ab",
              background: searchOpen ? "rgba(201,169,98,0.1)" : "transparent",
              border: "none", borderRadius: "50%", cursor: "pointer", transition: "all 0.2s"
            }}><SearchIcon size={18} /></button>

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 42, height: 42, color: "#9898ab", background: "transparent",
                    border: "none", borderRadius: "50%", textDecoration: "none", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9898ab")}>
                    <SettingsIcon size={18} />
                  </a>
                )}

                <Link to="/orders" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 42, height: 42, color: "#9898ab", textDecoration: "none", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9898ab")}>
                  <PackageIcon size={18} />
                </Link>

                <Link to="/cart" style={{
                  position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
                  width: 42, height: 42, color: "#9898ab", textDecoration: "none", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9898ab")}>
                  <CartIcon size={18} />
                  {itemCount > 0 && (
                    <span style={{
                      position: "absolute", top: 4, right: 4,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      minWidth: 16, height: 16, padding: "0 4px",
                      fontSize: "0.65rem", fontWeight: 700, lineHeight: 1,
                      color: "#0f0f1a", background: "#c9a962", borderRadius: 10
                    }}>{itemCount}</span>
                  )}
                </Link>

                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  marginLeft: 4, paddingLeft: 12,
                  borderLeft: "1px solid rgba(201,169,98,0.15)"
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg, #c9a962, #a68b4b)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700, color: "#0f0f1a"
                  }}>{user?.preferred_username?.charAt(0).toUpperCase()}</div>
                  <button onClick={logout} style={{
                    background: "none", border: "none", color: "#6c6c7e",
                    cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Poppins', sans-serif",
                    transition: "color 0.2s"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#f44336")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6c6c7e")}>Sair</button>
                </div>
              </>
            ) : (
              <Link to="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                marginLeft: 8, padding: "0.55rem 1.5rem",
                background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
                color: "#0f0f1a", borderRadius: 8,
                fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase",
                letterSpacing: "1.5px", textDecoration: "none", transition: "all 0.3s",
                boxShadow: "0 2px 8px rgba(201,169,98,0.2)"
              }}>
                <UserIcon size={14} /> Entrar
              </Link>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          maxHeight: searchOpen ? 72 : 0, overflow: "hidden",
          background: "rgba(26, 26, 46, 0.98)",
          borderTop: searchOpen ? "1px solid rgba(201,169,98,0.1)" : "none",
          transition: "max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          <form onSubmit={handleSearch} style={{
            display: "flex", maxWidth: 560, margin: "0 auto", padding: "0.875rem 2rem", gap: 8
          }}>
            <div style={{
              flex: 1, display: "flex", alignItems: "center", gap: 12,
              padding: "0 1.25rem", background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,169,98,0.15)", borderRadius: 10
            }}>
              <SearchIcon size={16} color="#6c6c7e" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="O que voce procura?"
                style={{
                  flex: 1, padding: "0.7rem 0", fontSize: "0.9rem", color: "#fff",
                  background: "transparent", border: "none", outline: "none",
                  fontFamily: "'Poppins', sans-serif"
                }} />
            </div>
            <button type="submit" style={{
              padding: "0 1.5rem", fontSize: "0.8rem", fontWeight: 600,
              color: "#0f0f1a", background: "#c9a962", border: "none",
              borderRadius: 10, cursor: "pointer", fontFamily: "'Poppins', sans-serif",
              textTransform: "uppercase", letterSpacing: 1, transition: "all 0.2s"
            }}>Buscar</button>
          </form>
        </div>
      </header>
      <div style={{ height: 72 }} />
    </>
  );
}

function PackageIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}