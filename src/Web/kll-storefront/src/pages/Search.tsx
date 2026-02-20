import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import { DiamondIcon, ChevronRightIcon, ChevronDownIcon, XIcon } from "../components/Icons";
import type { Product, Category } from "../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

interface FlatCategory {
  id: string; name: string; slug: string; description?: string;
  imageUrl?: string; parentCategoryId?: string | null; isActive: boolean; displayOrder: number;
}

function buildCategoryTree(flat: FlatCategory[]): Category[] {
  const map = new Map<string, Category>();
  for (const c of flat) {
    map.set(c.id, { ...c, subCategories: [] });
  }
  const roots: Category[] = [];
  for (const c of flat) {
    const node = map.get(c.id)!;
    if (c.parentCategoryId && map.has(c.parentCategoryId)) {
      map.get(c.parentCategoryId)!.subCategories!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function getCategoryNames(cat: Category): string[] {
  const names = [cat.name];
  if (cat.subCategories) {
    for (const sub of cat.subCategories) names.push(...getCategoryNames(sub));
  }
  return names;
}

function getCategoryIds(cat: Category): string[] {
  const ids = [cat.id];
  if (cat.subCategories) {
    for (const sub of cat.subCategories) ids.push(...getCategoryIds(sub));
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
    if (cat.subCategories?.some((sub) => sub.id === childId)) return cat;
    if (cat.subCategories) {
      const found = findParentCategory(cat.subCategories, childId);
      if (found) return found;
    }
  }
  return undefined;
}

// ─── Types & Constants ──────────────────────────────────────────────────────

type SortOption = "relevance" | "price_asc" | "price_desc" | "newest" | "name_asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "price_asc", label: "Menor Preço" },
  { value: "price_desc", label: "Maior Preço" },
  { value: "newest", label: "Mais Recentes" },
  { value: "name_asc", label: "Nome A-Z" },
];

function sortToApi(sort: SortOption): { sortBy?: string; sortDesc?: boolean } {
  switch (sort) {
    case "price_asc":  return { sortBy: "price", sortDesc: false };
    case "price_desc": return { sortBy: "price", sortDesc: true };
    case "newest":     return { sortBy: "newest" };
    case "name_asc":   return { sortBy: "name", sortDesc: false };
    default:           return {};
  }
}

const PAGE_SIZE = 20;

// ─── Inline Icons ───────────────────────────────────────────────────────────

function GridDenseIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="currentColor">
      <rect x="0" y="0" width="5" height="5" rx="1" />
      <rect x="6.5" y="0" width="5" height="5" rx="1" />
      <rect x="13" y="0" width="5" height="5" rx="1" />
      <rect x="0" y="6.5" width="5" height="5" rx="1" />
      <rect x="6.5" y="6.5" width="5" height="5" rx="1" />
      <rect x="13" y="6.5" width="5" height="5" rx="1" />
      <rect x="0" y="13" width="5" height="5" rx="1" />
      <rect x="6.5" y="13" width="5" height="5" rx="1" />
      <rect x="13" y="13" width="5" height="5" rx="1" />
    </svg>
  );
}

function GridWideIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="currentColor">
      <rect x="0" y="0" width="8" height="8" rx="1.5" />
      <rect x="10" y="0" width="8" height="8" rx="1.5" />
      <rect x="0" y="10" width="8" height="8" rx="1.5" />
      <rect x="10" y="10" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}

// ─── Category Tree ──────────────────────────────────────────────────────────

function CategoryTree({
  categories,
  selectedId,
  expandedIds,
  onToggle,
  onSelect,
}: {
  categories: Category[];
  selectedId: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
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
            <div className="flex items-center">
              {hasChildren && (
                <button
                  onClick={() => onToggle(cat.id)}
                  className={`flex items-center justify-center w-6 h-6 bg-transparent border-none cursor-pointer shrink-0 p-0 transition-transform duration-200 ${
                    isExpanded ? "rotate-0" : "-rotate-90"
                  } ${isChildSelected ? "text-gold" : "text-text-secondary/50"}`}
                >
                  <ChevronDownIcon size={14} />
                </button>
              )}
              <button
                onClick={() => onSelect(cat.id)}
                className={`block flex-1 text-left py-2 px-3 rounded-lg text-[0.85rem] transition-all duration-150 bg-transparent border-none cursor-pointer font-poppins ${
                  !hasChildren ? "pl-7" : ""
                } ${
                  isSelected
                    ? "text-gold bg-gold/[0.08] font-semibold"
                    : isChildSelected
                    ? "text-gold/80"
                    : "text-text-secondary/70 hover:text-text-primary"
                } ${hasChildren ? "font-medium" : "font-normal"}`}
              >
                {cat.name}
              </button>
            </div>

            {hasChildren && (
              <div
                className="overflow-hidden transition-all duration-300 pl-2"
                style={{ maxHeight: isExpanded ? `${cat.subCategories!.length * 44}px` : "0px" }}
              >
                {cat.subCategories!.map((sub) => {
                  const isSubSelected = selectedId === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onSelect(sub.id)}
                      className={`block w-full text-left py-1.5 px-3 pl-8 rounded-lg text-[0.8rem] transition-all duration-150 bg-transparent border-none cursor-pointer font-poppins ${
                        isSubSelected
                          ? "text-gold bg-gold/[0.08] font-semibold"
                          : "text-text-secondary/60 hover:text-text-primary"
                      }`}
                    >
                      {sub.name}
                    </button>
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

// ─── Filter Sidebar Content ─────────────────────────────────────────────────

function FilterContent({
  rootCategories,
  selectedCategoryId,
  expandedIds,
  onToggleCategory,
  onSelectCategory,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  onApplyPrice,
  sort,
  onSortChange,
  onClearFilters,
  showSort,
  hasActiveFilters,
}: {
  rootCategories: Category[];
  selectedCategoryId: string;
  expandedIds: Set<string>;
  onToggleCategory: (id: string) => void;
  onSelectCategory: (id: string) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (v: string) => void;
  onPriceMaxChange: (v: string) => void;
  onApplyPrice: () => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  onClearFilters: () => void;
  showSort: boolean;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Categorias */}
      <div>
        <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 font-poppins">
          Categorias
        </h4>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onSelectCategory("")}
            className={`block w-full text-left py-2 px-3 rounded-lg text-[0.85rem] transition-all duration-150 bg-transparent border-none cursor-pointer font-poppins ${
              !selectedCategoryId
                ? "text-gold bg-gold/[0.08] font-semibold"
                : "text-text-secondary/70 hover:text-text-primary"
            }`}
          >
            Todos
          </button>
          <CategoryTree
            categories={rootCategories}
            selectedId={selectedCategoryId}
            expandedIds={expandedIds}
            onToggle={onToggleCategory}
            onSelect={onSelectCategory}
          />
        </div>
      </div>

      <div className="border-t border-gold/10" />

      {/* Faixa de Preço */}
      <div>
        <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 font-poppins">
          Faixa de Preço
        </h4>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="1.800"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-gold/20 rounded-lg text-white text-sm font-poppins outline-none focus:border-gold transition-colors duration-200 placeholder:text-text-secondary/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <input
            type="number"
            placeholder="185.000"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-surface border border-gold/20 rounded-lg text-white text-sm font-poppins outline-none focus:border-gold transition-colors duration-200 placeholder:text-text-secondary/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <button
          onClick={onApplyPrice}
          className="w-full py-2 bg-gold/10 text-gold text-xs font-semibold uppercase tracking-wider rounded-lg border border-gold/20 cursor-pointer hover:bg-gold/20 transition-colors duration-200 font-poppins"
        >
          Aplicar Preço
        </button>
      </div>

      {/* Ordenação (mobile) */}
      {showSort && (
        <>
          <div className="border-t border-gold/10" />
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3 font-poppins">
              Ordenação
            </h4>
            <div className="flex flex-col gap-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm bg-transparent border-none cursor-pointer font-poppins transition-colors duration-150 ${
                    sort === opt.value
                      ? "text-gold bg-gold/[0.08]"
                      : "text-text-secondary/70 hover:text-text-primary"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      sort === opt.value ? "border-gold" : "border-text-secondary/30"
                    }`}
                  >
                    {sort === opt.value && <span className="w-2 h-2 rounded-full bg-gold" />}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Limpar Filtros */}
      {hasActiveFilters && (
        <>
          <div className="border-t border-gold/10" />
          <button
            onClick={onClearFilters}
            className="text-gold text-sm bg-transparent border-none cursor-pointer hover:underline font-poppins text-left py-1"
          >
            Limpar Filtros
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Search Component ──────────────────────────────────────────────────

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 2>(3);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [localPriceMin, setLocalPriceMin] = useState("");
  const [localPriceMax, setLocalPriceMax] = useState("");

  // ── URL params
  const q = params.get("q") || "";
  const categoryId = params.get("categoryId") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const sort = (params.get("sort") as SortOption) || "relevance";
  const page = parseInt(params.get("page") || "1", 10);
  const view = params.get("view") || "";

  // Sync local price inputs from URL
  useEffect(() => {
    setLocalPriceMin(minPrice);
    setLocalPriceMax(maxPrice);
  }, [minPrice, maxPrice]);

  // ── Fetch categories once and build tree
  useEffect(() => {
    categoryApi
      .getAll()
      .then((cats) => {
        const flat = Array.isArray(cats) ? cats : [];
        setCategories(buildCategoryTree(flat));
      })
      .catch(() => {})
      .finally(() => setCategoriesLoaded(true));
  }, []);

  // Root categories (already a tree, so just use directly)
  const rootCategories = categories;

  // Auto-expand parent when subcategory is selected
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const parent = findParentCategory(categories, categoryId);
      if (parent && !expandedIds.has(parent.id)) {
        setExpandedIds((prev) => new Set([...prev, parent.id]));
      }
    }
  }, [categoryId, categories]);

  // Category details
  const selectedCategory = useMemo(
    () => (categoryId ? findCategoryById(categories, categoryId) : undefined),
    [categoryId, categories]
  );

  const isParentCategory = useMemo(
    () => !!(selectedCategory?.subCategories && selectedCategory.subCategories.length > 0),
    [selectedCategory]
  );

  const descendantCategoryIds = useMemo(
    () => (selectedCategory ? getCategoryIds(selectedCategory) : []),
    [selectedCategory]
  );

  // ── Fetch products via search API
  useEffect(() => {
    if (view === "categories") {
      setLoading(false);
      return;
    }

    setLoading(true);

    const searchParams: Record<string, any> = {};
    if (q) searchParams.q = q;
    if (minPrice) searchParams.minPrice = parseFloat(minPrice);
    if (maxPrice) searchParams.maxPrice = parseFloat(maxPrice);

    const { sortBy, sortDesc } = sortToApi(sort);
    if (sortBy) searchParams.sortBy = sortBy;
    if (sortDesc !== undefined) searchParams.sortDesc = sortDesc;

    // For leaf categories, filter server-side
    if (categoryId && !isParentCategory) {
      searchParams.categoryId = categoryId;
    }

    // For parent categories, fetch more to filter client-side
    if (isParentCategory) {
      searchParams.page = 1;
      searchParams.pageSize = 200;
    } else {
      searchParams.page = page;
      searchParams.pageSize = PAGE_SIZE;
    }

    productApi
      .search(searchParams)
      .then((result: any) => {
        let items: Product[] = result.items || [];
        let count = result.totalCount || 0;
        let pages = result.totalPages || 1;

        // Client-side filter for parent categories (include subcategory products)
        if (isParentCategory && descendantCategoryIds.length > 0) {
          const matchNames = selectedCategory ? getCategoryNames(selectedCategory) : [];
          items = items.filter(
            (p) =>
              (p.categoryId && descendantCategoryIds.includes(p.categoryId)) ||
              matchNames.includes(p.category)
          );
          count = items.length;
          const start = (page - 1) * PAGE_SIZE;
          items = items.slice(start, start + PAGE_SIZE);
          pages = Math.ceil(count / PAGE_SIZE) || 1;
        }

        setProducts(items);
        setTotalCount(count);
        setTotalPages(pages);
        setCurrentPage(page);
      })
      .catch(() => {
        setProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [q, categoryId, minPrice, maxPrice, sort, page, view, isParentCategory, descendantCategoryIds, categories, selectedCategory]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") next.delete(key);
          else next.set(key, value);
        }
        if (!("page" in updates)) next.delete("page");
        return next;
      });
    },
    [setParams]
  );

  const handleSelectCategory = useCallback(
    (id: string) => {
      updateParams({ categoryId: id || null });
      setDrawerOpen(false);
    },
    [updateParams]
  );

  const handleToggleCategory = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleApplyPrice = useCallback(() => {
    updateParams({
      minPrice: localPriceMin || null,
      maxPrice: localPriceMax || null,
    });
  }, [localPriceMin, localPriceMax, updateParams]);

  const handleSortChange = useCallback(
    (value: SortOption) => {
      updateParams({ sort: value === "relevance" ? null : value });
    },
    [updateParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateParams({ page: newPage <= 1 ? null : String(newPage) });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateParams]
  );

  const handleClearFilters = useCallback(() => {
    setParams(new URLSearchParams());
    setLocalPriceMin("");
    setLocalPriceMax("");
    setDrawerOpen(false);
  }, [setParams]);

  const hasActiveFilters = !!(q || categoryId || minPrice || maxPrice || sort !== "relevance");

  // ── Body scroll lock for drawer
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // ─── Categories View ──────────────────────────────────────────────────────

  if (view === "categories") {
    return (
      <div
        className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10"
        style={{ animation: "fadeInUp 0.6s ease-out" }}
      >
        <div className="mb-10 pb-6">
          <h1 className="font-playfair text-3xl md:text-4xl text-white">Categorias</h1>
          <div className="w-16 h-0.5 bg-gold mt-4" />
          <p className="text-text-secondary text-sm mt-3">Navegue por departamento</p>
        </div>

        {!categoriesLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[200px] rounded-2xl"
                style={{
                  background: "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?categoryId=${cat.id}`}
                className="group relative flex flex-col justify-between p-8 min-h-[180px] bg-surface/50 border border-gold/[0.08] rounded-2xl no-underline transition-all duration-300 overflow-hidden hover:border-gold/30 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]"
              >
                <div className="absolute -top-5 -right-5 w-[100px] h-[100px] bg-[radial-gradient(circle,rgba(201,169,98,0.06)_0%,transparent_70%)] rounded-full" />
                <div>
                  <div className="w-12 h-12 rounded-[14px] mb-5 bg-gold/[0.08] border border-gold/15 flex items-center justify-center">
                    {cat.imageUrl ? (
                      <ProductImage imageUrl={cat.imageUrl} alt={cat.name} className="w-7 h-7 object-contain rounded" />
                    ) : (
                      <DiamondIcon size={20} color="#c9a962" />
                    )}
                  </div>
                  <h3 className="font-playfair text-xl font-semibold text-white mb-2">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="text-[0.8rem] text-text-secondary/60 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-5 text-[0.75rem] font-semibold text-gold uppercase tracking-wider">
                  Ver produtos <ChevronRightIcon size={14} color="#c9a962" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-8 bg-surface/30 rounded-2xl border border-gold/[0.06]">
            <DiamondIcon size={48} color="rgba(201,169,98,0.12)" />
            <p className="text-text-secondary text-base mt-6">
              Nenhuma categoria cadastrada ainda.
            </p>
            <p className="text-text-secondary/50 text-sm mt-2">
              Cadastre categorias pelo painel administrativo.
            </p>
          </div>
        )}
      </div>
    );
  }

  // ─── Products View ────────────────────────────────────────────────────────

  const pageTitle = q ? (
    <>
      Resultados para <span className="text-gold">"{q}"</span>
    </>
  ) : selectedCategory ? (
    selectedCategory.name
  ) : (
    "Nossas Peças"
  );

  const gridClass =
    gridCols === 3
      ? "grid-cols-2 xl:grid-cols-3"
      : "grid-cols-2";

  return (
    <div
      className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 lg:py-10"
      style={{ animation: "fadeInUp 0.6s ease-out" }}
    >
      {/* ─── Page Header ─── */}
      <div className="mb-8">
        <h1 className="font-playfair text-2xl md:text-3xl lg:text-4xl text-white">
          {pageTitle}
        </h1>
        <div className="w-16 h-0.5 bg-gold mt-4" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
          <p className="text-text-secondary text-sm font-poppins">
            {totalCount} {totalCount === 1 ? "produto encontrado" : "produtos encontrados"}
          </p>

          {/* Toolbar */}
          <div className="flex items-center gap-3">
            {/* Mobile Filters button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-surface border border-gold/20 rounded-lg text-text-secondary text-sm cursor-pointer hover:border-gold/40 hover:text-gold transition-all duration-200 font-poppins"
            >
              <SlidersIcon />
              Filtros
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-gold" />}
            </button>

            {/* Sort Select (hidden xs, visible sm+) */}
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="hidden sm:block px-4 py-2.5 bg-surface border border-gold/[0.12] rounded-lg text-text-secondary text-[0.8rem] outline-none cursor-pointer font-poppins focus:border-gold transition-colors duration-200"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Grid toggle (hidden sm, visible md+) */}
            <div className="hidden md:flex items-center border border-gold/[0.12] rounded-lg overflow-hidden">
              <button
                onClick={() => setGridCols(3)}
                className={`flex items-center justify-center w-10 h-10 border-none cursor-pointer transition-colors duration-200 ${
                  gridCols === 3
                    ? "bg-gold/20 text-gold"
                    : "bg-surface text-text-secondary/50 hover:text-text-secondary"
                }`}
              >
                <GridDenseIcon />
              </button>
              <button
                onClick={() => setGridCols(2)}
                className={`flex items-center justify-center w-10 h-10 border-none cursor-pointer transition-colors duration-200 ${
                  gridCols === 2
                    ? "bg-gold/20 text-gold"
                    : "bg-surface text-text-secondary/50 hover:text-text-secondary"
                }`}
              >
                <GridWideIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="flex gap-8">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-[280px] shrink-0">
          <div className="sticky top-[90px] max-h-[calc(100vh-120px)] overflow-y-auto pr-6 border-r border-gold/10">
            <FilterContent
              rootCategories={rootCategories}
              selectedCategoryId={categoryId}
              expandedIds={expandedIds}
              onToggleCategory={handleToggleCategory}
              onSelectCategory={handleSelectCategory}
              priceMin={localPriceMin}
              priceMax={localPriceMax}
              onPriceMinChange={setLocalPriceMin}
              onPriceMaxChange={setLocalPriceMax}
              onApplyPrice={handleApplyPrice}
              sort={sort}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
              showSort={false}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </aside>

        {/* ── Mobile Drawer Overlay ── */}
        <div
          className={`fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity duration-300 ${
            drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* ── Mobile Drawer ── */}
        <div
          className={`fixed top-0 left-0 bottom-0 w-[min(300px,85vw)] bg-dark z-[70] lg:hidden border-r border-gold/10 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 h-16 border-b border-gold/10 shrink-0">
            <h3 className="text-white font-semibold text-base font-poppins">Filtros</h3>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full border-none cursor-pointer text-text-secondary bg-transparent hover:text-gold transition-colors duration-200"
            >
              <XIcon size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <FilterContent
              rootCategories={rootCategories}
              selectedCategoryId={categoryId}
              expandedIds={expandedIds}
              onToggleCategory={handleToggleCategory}
              onSelectCategory={handleSelectCategory}
              priceMin={localPriceMin}
              priceMax={localPriceMax}
              onPriceMinChange={setLocalPriceMin}
              onPriceMaxChange={setLocalPriceMax}
              onApplyPrice={handleApplyPrice}
              sort={sort}
              onSortChange={handleSortChange}
              onClearFilters={handleClearFilters}
              showSort={true}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          <div className="px-6 py-4 border-t border-gold/10 shrink-0">
            <button
              onClick={() => {
                handleApplyPrice();
                setDrawerOpen(false);
              }}
              className="w-full py-3 bg-gold text-dark font-semibold text-sm uppercase tracking-wider rounded-lg border-none cursor-pointer hover:bg-gold-light transition-colors duration-200 font-poppins"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/5] rounded-xl"
                  style={{
                    background:
                      "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-poppins font-medium transition-all duration-200 ${
                      currentPage <= 1
                        ? "border-gold/10 text-text-secondary/30 cursor-not-allowed bg-transparent"
                        : "border-gold/20 text-text-secondary hover:border-gold hover:text-gold bg-surface cursor-pointer"
                    }`}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pg = i + 1;
                    return (
                      <button
                        key={pg}
                        onClick={() => handlePageChange(pg)}
                        className={`w-10 h-10 rounded-lg border text-sm font-poppins font-medium transition-all duration-200 cursor-pointer ${
                          pg === currentPage
                            ? "bg-gold text-dark border-gold"
                            : "bg-surface border-gold/20 text-text-secondary hover:border-gold hover:text-gold"
                        }`}
                      >
                        {pg}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-poppins font-medium transition-all duration-200 ${
                      currentPage >= totalPages
                        ? "border-gold/10 text-text-secondary/30 cursor-not-allowed bg-transparent"
                        : "border-gold/20 text-text-secondary hover:border-gold hover:text-gold bg-surface cursor-pointer"
                    }`}
                  >
                    Próximo
                  </button>
                </div>
              )}

              <p className="text-center text-text-secondary/50 text-xs font-poppins mt-4">
                Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, totalCount)} de {totalCount} produtos
              </p>
            </>
          ) : (
            /* ── Empty State ── */
            <div className="text-center py-20 px-8 bg-surface/30 rounded-2xl border border-gold/[0.06]">
              <DiamondIcon size={48} color="rgba(201,169,98,0.15)" />
              <p className="text-text-secondary text-lg mt-6 font-poppins">
                Nenhum produto encontrado
              </p>
              <p className="text-text-secondary/50 text-sm mt-2 font-poppins">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-6 px-6 py-2.5 bg-gold/10 text-gold text-sm font-semibold uppercase tracking-wider rounded-lg border border-gold/20 cursor-pointer hover:bg-gold/20 transition-colors duration-200 font-poppins"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
