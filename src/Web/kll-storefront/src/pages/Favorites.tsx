import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { favoriteApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

export default function Favorites() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoriteApi.getAll().then((data: Product[]) => {
      setProducts(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700,
          color: "#fff", marginBottom: "0.5rem"
        }}>Meus Favoritos</h1>
        <p style={{ color: "#6c6c7e", fontSize: "0.9rem", marginBottom: "2rem" }}>
          {products.length > 0 ? `${products.length} item(ns) na sua lista` : ""}
        </p>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1.5rem" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                background: "#1a1a2e", borderRadius: 16, height: 380,
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            ))}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
          </div>
        ) : products.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "4rem 2rem",
            background: "#1a1a2e", borderRadius: 16,
            border: "1px solid rgba(201,169,98,0.1)"
          }}>
            <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,98,0.3)" strokeWidth="1.5" style={{ marginBottom: "1.5rem" }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "1.5rem",
              color: "#fff", marginBottom: "0.75rem"
            }}>Voce ainda nao tem favoritos</h2>
            <p style={{ color: "#6c6c7e", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Explore nossa colecao e marque suas pecas preferidas
            </p>
            <Link to="/search" style={{
              display: "inline-block", padding: "0.85rem 2.5rem",
              background: "linear-gradient(135deg, #c9a962, #a68b4b)",
              color: "#0f0f1a", borderRadius: 10, textDecoration: "none",
              fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase",
              letterSpacing: 1.5, fontFamily: "'Poppins', sans-serif"
            }}>Explorar Colecao</Link>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem"
          }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
