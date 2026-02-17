import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import { DiamondIcon, ChevronRightIcon } from "../components/Icons";
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
  const view = params.get("view") || "";

  useEffect(() => {
    setLoading(true);
    if (view === "categories") {
      categoryApi.getAll()
        .then((cats) => setCategories(cats))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      Promise.all([
        productApi.search({ q, categoryId: categoryId || undefined, sortBy, pageSize: 40 }),
        categoryApi.getAll(),
      ]).then(([res, cats]) => {
        setProducts(res.items || res);
        setTotal(res.totalCount || res.length || 0);
        setCategories(cats);
      }).finally(() => setLoading(false));
    }
  }, [q, categoryId, sortBy, view]);

  if (view === "categories") {
    return (
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem" }}>
        <div style={{
          marginBottom: "2.5rem", paddingBottom: "1.5rem",
          borderBottom: "1px solid rgba(201,169,98,0.08)"
        }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem" }}>Categorias</h1>
          <p style={{ color: "#6c6c7e", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Navegue por departamento
          </p>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                height: 200, background: "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 16
              }} />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {categories.map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`} style={{
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                padding: "2rem", minHeight: 180,
                background: "rgba(26,26,46,0.5)", border: "1px solid rgba(201,169,98,0.08)",
                borderRadius: 20, textDecoration: "none", transition: "all 0.3s",
                position: "relative", overflow: "hidden"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,98,0.3)";
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(201,169,98,0.08)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <div style={{
                  position: "absolute", top: -20, right: -20, width: 100, height: 100,
                  background: "radial-gradient(circle, rgba(201,169,98,0.06) 0%, transparent 70%)",
                  borderRadius: "50%"
                }} />
                <div>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, marginBottom: "1.25rem",
                    background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt="" style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 4 }} />
                    ) : (
                      <DiamondIcon size={20} color="#c9a962" />
                    )}
                  </div>
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif", fontSize: "1.25rem",
                    fontWeight: 600, color: "#fff", marginBottom: "0.5rem"
                  }}>{cat.name}</h3>
                  {cat.description && (
                    <p style={{ fontSize: "0.8rem", color: "#6c6c7e", lineHeight: 1.6 }}>
                      {cat.description}
                    </p>
                  )}
                </div>
                <div style={{
                  display: "flex", alignItems: "center", gap: 6, marginTop: "1.25rem",
                  fontSize: "0.75rem", fontWeight: 600, color: "#c9a962",
                  textTransform: "uppercase", letterSpacing: 1
                }}>
                  Ver produtos <ChevronRightIcon size={14} color="#c9a962" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            background: "rgba(26,26,46,0.3)", borderRadius: 20,
            border: "1px solid rgba(201,169,98,0.06)"
          }}>
            <DiamondIcon size={48} color="rgba(201,169,98,0.12)" />
            <p style={{ color: "#6c6c7e", fontSize: "1rem", marginTop: "1.5rem" }}>
              Nenhuma categoria cadastrada ainda.
            </p>
            <p style={{ color: "#4a4a5e", fontSize: "0.85rem", marginTop: "0.5rem" }}>
              Cadastre categorias pelo painel administrativo.
            </p>
          </div>
        )}
      </div>
    );
  }

  const selectedCategory = categories.find(c => c.id === categoryId);

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
            {q ? <>Resultados para <span style={{ color: "#c9a962" }}>"{q}"</span></> :
             selectedCategory ? <>{selectedCategory.name}</> : "Catalogo"}
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
              {[1, 2, 3, 4, 5, 6].map((i) => (
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
