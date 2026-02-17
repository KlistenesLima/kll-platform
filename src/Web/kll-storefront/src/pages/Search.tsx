import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import { DiamondIcon, ChevronRightIcon, ChevronDownIcon } from "../components/Icons";
import type { Product, Category } from "../types";

function getCategoryNames(cat: Category): string[] {
  const names = [cat.name];
  if (cat.subCategories) {
    for (const sub of cat.subCategories) {
      names.push(...getCategoryNames(sub));
    }
  }
  return names;
}

function getCategoryIds(cat: Category): string[] {
  const ids = [cat.id];
  if (cat.subCategories) {
    for (const sub of cat.subCategories) {
      ids.push(...getCategoryIds(sub));
    }
  }
  return ids;
}

function findCategoryById(categories: Category[], id: string): Category | undefined {
  for (const cat of categories) {
    if (cat.id === id) return cat;
    if (cat.subCategories) {
      const found = findCategoryById(cat.subCategories, id);
      if (found) return found;
    }
  }
  return undefined;
}

function findParentCategory(categories: Category[], childId: string): Category | undefined {
  for (const cat of categories) {
    if (cat.subCategories?.some(sub => sub.id === childId)) return cat;
    if (cat.subCategories) {
      const found = findParentCategory(cat.subCategories, childId);
      if (found) return found;
    }
  }
  return undefined;
}

function CategoryTree({
  categories,
  selectedId,
  expandedIds,
  onToggle,
}: {
  categories: Category[];
  selectedId: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <>
      {categories.map((cat) => {
        const hasChildren = cat.subCategories && cat.subCategories.length > 0;
        const isExpanded = expandedIds.has(cat.id);
        const isSelected = selectedId === cat.id;
        const childIds = hasChildren ? getCategoryIds(cat) : [cat.id];
        const isChildSelected = childIds.includes(selectedId);

        return (
          <div key={cat.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {hasChildren && (
                <button
                  onClick={(e) => { e.preventDefault(); onToggle(cat.id); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 24, height: 24, background: "none", border: "none",
                    color: isChildSelected ? "#c9a962" : "#6c6c7e",
                    cursor: "pointer", flexShrink: 0, padding: 0,
                    transition: "transform 0.2s ease",
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)"
                  }}
                >
                  <ChevronDownIcon size={14} />
                </button>
              )}
              <Link
                to={`/search?categoryId=${cat.id}`}
                style={{
                  display: "block",
                  flex: 1,
                  padding: hasChildren ? "0.5rem 0.75rem" : "0.5rem 0.75rem 0.5rem 1.75rem",
                  borderRadius: 8,
                  fontSize: hasChildren ? "0.85rem" : "0.8rem",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  color: isSelected ? "#c9a962" : isChildSelected ? "#c9a962" : "#9898ab",
                  background: isSelected ? "rgba(201,169,98,0.08)" : "transparent",
                  fontWeight: isSelected ? 600 : hasChildren ? 500 : 400,
                  borderLeft: isSelected ? "3px solid #c9a962" : "3px solid transparent",
                }}
              >
                {cat.name}
              </Link>
            </div>

            {/* Subcategories with animation */}
            {hasChildren && (
              <div style={{
                overflow: "hidden",
                maxHeight: isExpanded ? `${cat.subCategories!.length * 40}px` : "0px",
                transition: "max-height 0.3s ease",
                paddingLeft: 8
              }}>
                {cat.subCategories!.map((sub) => {
                  const isSubSelected = selectedId === sub.id;
                  return (
                    <Link
                      key={sub.id}
                      to={`/search?categoryId=${sub.id}`}
                      style={{
                        display: "block",
                        padding: "0.4rem 0.75rem 0.4rem 2rem",
                        borderRadius: 8,
                        fontSize: "0.8rem",
                        textDecoration: "none",
                        transition: "all 0.15s",
                        color: isSubSelected ? "#c9a962" : "#7a7a90",
                        background: isSubSelected ? "rgba(201,169,98,0.08)" : "transparent",
                        fontWeight: isSubSelected ? 600 : 400,
                        borderLeft: isSubSelected ? "3px solid #c9a962" : "3px solid transparent",
                      }}
                    >
                      {sub.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function Search() {
  const [params] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
        productApi.getAll(),
        categoryApi.getAll(),
      ]).then(([prods, cats]) => {
        setAllProducts(Array.isArray(prods) ? prods : prods.items || []);
        setCategories(Array.isArray(cats) ? cats : []);
      }).finally(() => setLoading(false));
    }
  }, [view]);

  // Auto-expand parent when a subcategory is selected
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const parent = findParentCategory(categories, categoryId);
      if (parent && !expandedIds.has(parent.id)) {
        setExpandedIds(prev => new Set([...prev, parent.id]));
      }
    }
  }, [categoryId, categories]);

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by search query
    if (q) {
      const lower = q.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(lower) ||
        p.description?.toLowerCase().includes(lower) ||
        p.category?.toLowerCase().includes(lower)
      );
    }

    // Filter by category (including subcategories)
    if (categoryId) {
      const selectedCat = findCategoryById(categories, categoryId);
      if (selectedCat) {
        const matchNames = getCategoryNames(selectedCat);
        const matchIds = getCategoryIds(selectedCat);
        result = result.filter(p =>
          matchNames.includes(p.category) || (p.categoryId && matchIds.includes(p.categoryId))
        );
      }
    }

    // Sort
    if (sortBy === "price") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [allProducts, q, categoryId, categories, sortBy]);

  // Only show parent categories (those with subCategories or no parent)
  const rootCategories = useMemo(() => {
    // Categories that are parents (have subCategories) or standalone (no parent has them as child)
    const childIds = new Set<string>();
    categories.forEach(cat => {
      cat.subCategories?.forEach(sub => childIds.add(sub.id));
    });
    return categories.filter(cat => !childIds.has(cat.id));
  }, [categories]);

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

  const selectedCategory = findCategoryById(categories, categoryId);

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
            {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
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
        {/* Sidebar - Hierarchical Category Tree */}
        <aside style={{ width: 220, flexShrink: 0 }}>
          <h3 style={{
            fontFamily: "'Poppins', sans-serif", fontSize: "0.7rem", fontWeight: 700,
            marginBottom: "1rem", color: "#6c6c7e",
            textTransform: "uppercase", letterSpacing: "2px"
          }}>Categorias</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <Link to="/search" style={{
              display: "block", padding: "0.6rem 1rem", borderRadius: 8,
              fontSize: "0.85rem", textDecoration: "none", transition: "all 0.15s",
              color: !categoryId ? "#c9a962" : "#9898ab",
              background: !categoryId ? "rgba(201,169,98,0.08)" : "transparent",
              fontWeight: !categoryId ? 600 : 400,
              borderLeft: !categoryId ? "3px solid #c9a962" : "3px solid transparent"
            }}>Todos</Link>

            <CategoryTree
              categories={rootCategories}
              selectedId={categoryId}
              expandedIds={expandedIds}
              onToggle={handleToggle}
            />
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
          ) : filteredProducts.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
              {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
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
