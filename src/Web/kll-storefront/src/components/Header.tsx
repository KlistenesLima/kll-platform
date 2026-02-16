import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) { nav(`/search?q=${encodeURIComponent(query.trim())}`); setSearchOpen(false); }
  };

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: "rgba(15, 15, 26, 0.95)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(201, 169, 98, 0.2)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1400, margin: "0 auto", padding: "1rem 1.5rem"
        }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700 }}>
            <span style={{ color: "#fff" }}>Luxe</span>
            <span style={{ color: "#c9a962", marginLeft: 4 }}>Store</span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {[
              { to: "/", label: "Home" },
              { to: "/search", label: "Produtos" },
              { to: "/categories", label: "Categorias" },
            ].map((link) => (
              <Link key={link.to} to={link.to} style={{
                fontSize: "0.9rem", fontWeight: 500, color: "#b8b8c7", textTransform: "uppercase",
                letterSpacing: 1, textDecoration: "none", transition: "color 0.15s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#b8b8c7")}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button onClick={() => setSearchOpen(!searchOpen)} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, fontSize: "1.1rem", color: "#b8b8c7",
              background: "transparent", border: "none", borderRadius: "50%", cursor: "pointer"
            }} dangerouslySetInnerHTML={{ __html: "&#9906;" }} />

            {isAuthenticated ? (
              <>
                <Link to="/orders" style={{
                  fontSize: "0.85rem", color: "#b8b8c7", textDecoration: "none",
                  textTransform: "uppercase", letterSpacing: 1
                }}>Pedidos</Link>

                {isAdmin && (
                  <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 44, height: 44, color: "#b8b8c7", background: "transparent",
                    border: "none", borderRadius: "50%", cursor: "pointer", fontSize: "0.75rem",
                    textDecoration: "none", fontWeight: 600, textTransform: "uppercase"
                  }}>ADM</a>
                )}

                <Link to="/cart" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 44, height: 44, color: "#b8b8c7", textDecoration: "none", fontSize: "1.1rem" }}>
                  <span dangerouslySetInnerHTML={{ __html: "&#9830;" }} />
                  {itemCount > 0 && (
                    <span style={{
                      position: "absolute", top: 4, right: 4, display: "flex", alignItems: "center", justifyContent: "center",
                      minWidth: 18, height: 18, padding: "0 4px", fontSize: "0.7rem", fontWeight: 600,
                      color: "#1a1a2e", background: "#c9a962", borderRadius: "50%"
                    }}>{itemCount}</span>
                  )}
                </Link>

                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontSize: "0.9rem" }}>
                  <span>{user?.preferred_username}</span>
                  <button onClick={logout} style={{
                    background: "none", border: "none", color: "#f44336", cursor: "pointer", fontSize: "0.85rem"
                  }}>Sair</button>
                </div>
              </>
            ) : (
              <Link to="/login" style={{
                background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
                color: "#1a1a2e", padding: "0.5rem 1.25rem", borderRadius: 8,
                fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 1,
                textDecoration: "none", transition: "all 0.3s"
              }}>Entrar</Link>
            )}
          </div>
        </div>

        <div style={{
          maxHeight: searchOpen ? 80 : 0, overflow: "hidden",
          background: "#1a1a2e", borderTop: searchOpen ? "1px solid rgba(201,169,98,0.2)" : "none",
          transition: "max-height 0.3s ease"
        }}>
          <form onSubmit={handleSearch} style={{ display: "flex", maxWidth: 600, margin: "0 auto", padding: "1rem 1.5rem" }}>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos exclusivos..."
              style={{
                flex: 1, padding: "0.75rem 1.25rem", fontSize: "1rem", color: "#fff",
                background: "#0f0f1a", border: "2px solid rgba(201,169,98,0.2)",
                borderRight: "none", borderRadius: "8px 0 0 8px", fontFamily: "'Poppins', sans-serif",
                outline: "none"
              }} />
            <button type="submit" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 1.5rem", fontSize: "1rem", color: "#1a1a2e",
              background: "#c9a962", border: "none", borderRadius: "0 8px 8px 0", cursor: "pointer"
            }}>Buscar</button>
          </form>
        </div>
      </header>
      <div style={{ height: 73 }} />
    </>
  );
}