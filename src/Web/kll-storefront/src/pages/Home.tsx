import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([productApi.getAll(), categoryApi.getAll()])
      .then(([prods, cats]) => { setProducts(prods); setCategories(cats); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const features = [
    { icon: "\u2708", title: "Frete Gratis", desc: "Em compras acima de R$ 199" },
    { icon: "\u25C6", title: "Pagamento Seguro", desc: "Criptografia de ponta a ponta" },
    { icon: "\u21BB", title: "Troca Garantida", desc: "Ate 30 dias apos a compra" },
    { icon: "\u2605", title: "Suporte Premium", desc: "Atendimento personalizado" },
  ];

  return (
    <div>
      <section style={{
        position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "3rem", alignItems: "center", minHeight: "calc(100vh - 73px)",
        padding: "4rem 3rem", maxWidth: 1400, margin: "0 auto", overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2, animation: "fadeInUp 0.8s ease forwards" }}>
          <span style={{
            display: "inline-block", padding: "0.5rem 1.5rem", fontSize: "0.8rem", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 2, color: "#c9a962",
            background: "rgba(201,169,98,0.15)", border: "1px solid #c9a962",
            borderRadius: 50, marginBottom: "1.5rem"
          }}>Nova Colecao 2026</span>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "4rem", fontWeight: 700,
            lineHeight: 1.1, marginBottom: "1.5rem", color: "#fff"
          }}>
            Descubra o <span style={{ color: "#c9a962" }}>Extraordinario</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#b8b8c7", maxWidth: 500, marginBottom: "2rem", lineHeight: 1.8 }}>
            Produtos premium selecionados com curadoria exclusiva. Qualidade, elegancia e sofisticacao em cada detalhe.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/search" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "1rem 2.5rem", fontFamily: "'Poppins', sans-serif", fontSize: "0.9rem",
              fontWeight: 500, textTransform: "uppercase", letterSpacing: 1,
              color: "#1a1a2e", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
              border: "none", borderRadius: 8, textDecoration: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)", transition: "all 0.3s"
            }}>Explorar Colecao</Link>
            <Link to="/categories" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "1rem 2.5rem", fontFamily: "'Poppins', sans-serif", fontSize: "0.9rem",
              fontWeight: 500, textTransform: "uppercase", letterSpacing: 1,
              color: "#c9a962", background: "transparent",
              border: "2px solid #c9a962", borderRadius: 8, textDecoration: "none",
              transition: "all 0.3s"
            }}>Ver Categorias</Link>
          </div>
        </div>

        <div style={{
          position: "relative", borderRadius: 20, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)", animation: "fadeIn 1s ease 0.3s forwards", opacity: 0
        }}>
          <div style={{
            width: "100%", height: 600, background: "linear-gradient(135deg, #252542 0%, #1a1a2e 50%, #16213e 100%)",
            display: "flex", alignItems: "center", justifyContent: "center", position: "relative"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "6rem", marginBottom: "1rem", opacity: 0.3, color: "#6c6c7e" }}>&#10022;</div>
              <p style={{ color: "#6c6c7e", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 3 }}>Premium Collection</p>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", top: "10%", right: "-10%", width: 600, height: 600,
          background: "radial-gradient(circle, rgba(201,169,98,0.08) 0%, transparent 70%)",
          borderRadius: "50%", zIndex: 1, pointerEvents: "none"
        }} />
      </section>

      <section style={{
        padding: "4rem 0", background: "#1a1a2e",
        borderTop: "1px solid rgba(201,169,98,0.2)",
        borderBottom: "1px solid rgba(201,169,98,0.2)"
      }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem" }}>
          {features.map((f) => (
            <div key={f.title} style={{ textAlign: "center", padding: "1.5rem" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 70, height: 70, fontSize: "1.75rem", color: "#c9a962",
                background: "rgba(201,169,98,0.1)", border: "2px solid #c9a962",
                borderRadius: "50%", marginBottom: "1rem"
              }}>{f.icon}</div>
              <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>{f.title}</h4>
              <p style={{ fontSize: "0.9rem", color: "#6c6c7e" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section style={{ padding: "4rem 0", maxWidth: 1400, margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", display: "inline-block", position: "relative", paddingBottom: "1rem" }}>
              Categorias
              <span style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 3, background: "linear-gradient(90deg, transparent, #c9a962, transparent)" }} />
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.5rem" }}>
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 1rem",
                background: "#1a1a2e", border: "1px solid rgba(201,169,98,0.2)",
                borderRadius: 12, textDecoration: "none", transition: "all 0.3s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c9a962"; e.currentTarget.style.transform = "translateY(-5px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"; e.currentTarget.style.transform = "none"; }}>
                <span style={{ fontSize: "2.5rem", marginBottom: "0.75rem", color: "#c9a962" }}>&#10022;</span>
                <span style={{ fontFamily: "'Playfair Display', serif", color: "#fff", fontSize: "1rem", fontWeight: 500 }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ padding: "4rem 0", maxWidth: 1400, margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "3rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem", marginBottom: "0.25rem" }}>Produtos em Destaque</h2>
            <p style={{ color: "#6c6c7e" }}>Selecao especial para voce</p>
          </div>
          <Link to="/search" style={{
            padding: "0.75rem 1.5rem", fontSize: "0.85rem", fontWeight: 500,
            textTransform: "uppercase", letterSpacing: 1, color: "#c9a962",
            background: "transparent", border: "2px solid #c9a962", borderRadius: 8,
            textDecoration: "none"
          }}>Ver Todos</Link>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{
                height: 400, background: "linear-gradient(90deg, #1a1a2e 25%, #252542 50%, #1a1a2e 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 12
              }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.3, color: "#6c6c7e" }}>&#10022;</div>
            <p style={{ color: "#6c6c7e", fontSize: "1.1rem" }}>Nenhum produto disponivel ainda.</p>
            <p style={{ color: "#4a4a5e", fontSize: "0.9rem", marginTop: "0.5rem" }}>Cadastre produtos pelo Admin Panel.</p>
          </div>
        )}
      </section>

      <section style={{
        padding: "4rem 0",
        background: "linear-gradient(135deg, #a68b4b 0%, #c9a962 100%)",
        textAlign: "center"
      }}>
        <h2 style={{ fontSize: "2.5rem", color: "#1a1a2e", fontFamily: "'Playfair Display', serif", marginBottom: "1rem" }}>Experiencia Premium</h2>
        <p style={{ fontSize: "1.1rem", color: "rgba(26,26,46,0.7)", marginBottom: "2rem" }}>Cadastre-se e receba ofertas exclusivas diretamente no seu email.</p>
        <Link to="/login" style={{
          display: "inline-block", padding: "1rem 3rem",
          fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1,
          color: "#c9a962", background: "#1a1a2e", borderRadius: 8,
          textDecoration: "none", transition: "all 0.3s"
        }}>Criar Conta Gratis</Link>
      </section>
    </div>
  );
}