import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "#0a0a14", borderTop: "1px solid rgba(201,169,98,0.15)", marginTop: "4rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2rem" }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", marginBottom: "1rem" }}>
              <span style={{ color: "#fff" }}>Luxe</span>
              <span style={{ color: "#c9a962" }}> Store</span>
            </h3>
            <p style={{ color: "#6c6c7e", fontSize: "0.9rem", lineHeight: 1.8, maxWidth: 350 }}>
              Experiencia premium em compras online. Produtos selecionados com qualidade e elegancia para voce.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#c9a962", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2, marginBottom: "1rem" }}>Navegacao</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Home", "Produtos", "Categorias"].map((t) => (
                <Link key={t} to={t === "Home" ? "/" : `/${t.toLowerCase()}`}
                  style={{ color: "#6c6c7e", fontSize: "0.9rem", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6c6c7e")}>{t}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#c9a962", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2, marginBottom: "1rem" }}>Conta</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[["Meus Pedidos", "/orders"], ["Carrinho", "/cart"], ["Entrar", "/login"]].map(([t, l]) => (
                <Link key={l} to={l} style={{ color: "#6c6c7e", fontSize: "0.9rem", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a962")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6c6c7e")}>{t}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#c9a962", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2, marginBottom: "1rem" }}>Contato</h4>
            <p style={{ color: "#6c6c7e", fontSize: "0.9rem" }}>suporte@luxestore.com</p>
            <p style={{ color: "#6c6c7e", fontSize: "0.9rem", marginTop: "0.25rem" }}>(85) 9 9999-9999</p>
          </div>
        </div>
        <div style={{
          borderTop: "1px solid rgba(201,169,98,0.1)", marginTop: "2rem", paddingTop: "1.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <p style={{ color: "#6c6c7e", fontSize: "0.8rem" }}>&copy; 2026 Luxe Store. Todos os direitos reservados.</p>
          <p style={{ color: "#3a3a4e", fontSize: "0.7rem" }}>.NET 8 &bull; React 18 &bull; Kafka &bull; PostgreSQL &bull; Clean Architecture</p>
        </div>
      </div>
    </footer>
  );
}