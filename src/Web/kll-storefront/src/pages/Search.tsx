import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import type { Product, Category } from "../types";

export default function Search() {
  const [params] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("newest");

  const q = params.get("q") || "";
  const categoryId = params.get("categoryId") || "";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      productApi.search({ q, categoryId: categoryId || undefined, sortBy, pageSize: 40 }),
      categoryApi.getAll(),
    ]).then(([res, cats]) => {
      setProducts(res.items || res);
      setTotal(res.totalCount || res.length || 0);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [q, categoryId, sortBy]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.25rem" }}>
            {q ? `Resultados para "${q}"` : "Catalogo"}
          </h1>
          <p style={{ color: "#6c6c7e", fontSize: "0.9rem" }}>{total} produtos encontrados</p>
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
          padding: "0.75rem 1.25rem", fontFamily: "'Poppins', sans-serif",
          fontSize: "0.85rem", color: "#fff", background: "#1a1a2e",
          border: "2px solid rgba(201,169,98,0.2)", borderRadius: 8, outline: "none", cursor: "pointer"
        }}>
          <option value="newest">Mais Recentes</option>
          <option value="price">Menor Preco</option>
          <option value="name">Nome A-Z</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginBottom: "1rem", color: "#c9a962" }}>Categorias</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <Link to="/search" style={{
              display: "block", padding: "0.65rem 1rem", borderRadius: 8,
              fontSize: "0.9rem", textDecoration: "none",
              color: !categoryId ? "#c9a962" : "#b8b8c7",
              background: !categoryId ? "rgba(201,169,98,0.1)" : "transparent"
            }}>Todos</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`} style={{
                display: "block", padding: "0.65rem 1rem", borderRadius: 8,
                fontSize: "0.9rem", textDecoration: "none",
                color: categoryId === cat.id ? "#c9a962" : "#b8b8c7",
                background: categoryId === cat.id ? "rgba(201,169,98,0.1)" : "transparent",
                transition: "all 0.15s"
              }}>{cat.name}</Link>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} style={{
                  height: 380, background: "linear-gradient(90deg, #1a1a2e 25%, #252542 50%, #1a1a2e 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 12
                }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem 0" }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem", opacity: 0.3 }}>ðŸ”</div>
              <p style={{ color: "#6c6c7e", fontSize: "1.1rem" }}>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}