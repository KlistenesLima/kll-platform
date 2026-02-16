import { Link } from "react-router-dom";
import { DiamondIcon } from "../components/Icons";

export default function Footer() {
  return (
    <footer style={{
      background: "rgba(10, 10, 20, 0.8)",
      borderTop: "1px solid rgba(201,169,98,0.06)"
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "4rem 2rem 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
              <DiamondIcon size={20} color="#c9a962" />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700 }}>
                <span style={{ color: "#fff" }}>Luxe </span>
                <span style={{ color: "#c9a962" }}>Store</span>
              </span>
            </div>
            <p style={{ color: "#4a4a5e", fontSize: "0.85rem", lineHeight: 1.8, maxWidth: 320 }}>
              Experiencia premium em compras online. Produtos selecionados com qualidade e elegancia.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 style={{
              color: "#6c6c7e", fontSize: "0.7rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1.25rem"
            }}>Navegacao</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[["Home", "/"], ["Produtos", "/search"]].map(([t, l]) => (
                <Link key={l} to={l} style={{
                  color: "#4a4a5e", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a5e")}>{t}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{
              color: "#6c6c7e", fontSize: "0.7rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1.25rem"
            }}>Conta</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              {[["Meus Pedidos", "/orders"], ["Carrinho", "/cart"], ["Entrar", "/login"]].map(([t, l]) => (
                <Link key={l} to={l} style={{
                  color: "#4a4a5e", fontSize: "0.85rem", textDecoration: "none", transition: "color 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4a4a5e")}>{t}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              color: "#6c6c7e", fontSize: "0.7rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "2px", marginBottom: "1.25rem"
            }}>Contato</h4>
            <p style={{ color: "#4a4a5e", fontSize: "0.85rem", lineHeight: 2 }}>
              suporte@luxestore.com<br/>(85) 9 9999-9999
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: "1px solid rgba(201,169,98,0.06)", marginTop: "3rem", paddingTop: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <p style={{ color: "#3a3a4e", fontSize: "0.75rem" }}>
            2026 Luxe Store. Todos os direitos reservados.
          </p>
          <p style={{ color: "#2a2a3e", fontSize: "0.65rem", letterSpacing: 1 }}>
            .NET 8 | React 18 | Kafka | PostgreSQL | Clean Architecture
          </p>
        </div>
      </div>
    </footer>
  );
}