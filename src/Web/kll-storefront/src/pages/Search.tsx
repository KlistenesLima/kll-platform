import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import { DiamondIcon } from "../components/Icons";
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
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: "2.5rem", paddingBottom: "1.5rem",
        borderBottom: "1px solid rgba(201,169,98,0.08)"
      }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem" }}>
            {q ? <>Resultados para <span style={{ color: "#c9a962" }}>"{q}"</span></> : "Catalogo"}
          </h1>
          <p style={{ color: "#6c6c7e", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {total} {total === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{
          padding: "0.65rem 1rem", fontFamily: "'Poppins', sans-serif",
          fontSize: "0.8rem", color: "#b8b8c7", background: "rgba(26,26,46,0.6)",
          border: "1px solid rgba(201,169,98,0.12)", borderRadius: 10,
          outline: "none", cursor: "pointer"
        }}>
          <option value="newest">Mais Recentes</option>
          <option value="price">Menor Preco</option>
          <option value="name">Nome A-Z</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "2.5rem" }}>
        {/* Sidebar */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <h3 style={{
            fontFamily: "'Poppins', sans-serif", fontSize: "0.7rem", fontWeight: 700,
            marginBottom: "1rem", color: "#6c6c7e",
            textTransform: "uppercase", letterSpacing: "2px"
          }}>Categorias</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Link to="/search" style={{
              display: "block", padding: "0.6rem 1rem", borderRadius: 10,
              fontSize: "0.85rem", textDecoration: "none", transition: "all 0.15s",
              color: !categoryId ? "#c9a962" : "#9898ab",
              background: !categoryId ? "rgba(201,169,98,0.08)" : "transparent",
              fontWeight: !categoryId ? 600 : 400
            }}>Todos</Link>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`} style={{
                display: "block", padding: "0.6rem 1rem", borderRadius: 10,
                fontSize: "0.85rem", textDecoration: "none", transition: "all 0.15s",
                color: categoryId === cat.id ? "#c9a962" : "#9898ab",
                background: categoryId === cat.id ? "rgba(201,169,98,0.08)" : "transparent",
                fontWeight: categoryId === cat.id ? 600 : 400
              }}
              onMouseEnter={(e) => { if (categoryId !== cat.id) e.currentTarget.style.color = "#c9a962"; }}
              onMouseLeave={(e) => { if (categoryId !== cat.id) e.currentTarget.style.color = "#9898ab"; }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} style={{
                  height: 400, background: "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)",
                  backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 16
                }} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div style={{
              textAlign: "center", padding: "5rem 2rem",
              background: "rgba(26,26,46,0.3)", borderRadius: 20,
              border: "1px solid rgba(201,169,98,0.06)"
            }}>
              <DiamondIcon size={48} color="rgba(201,169,98,0.12)" />
              <p style={{ color: "#6c6c7e", fontSize: "1rem", marginTop: "1.5rem" }}>
                Nenhum produto encontrado.
              </p>
              <p style={{ color: "#4a4a5e", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}