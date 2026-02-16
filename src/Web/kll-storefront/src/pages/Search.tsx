import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {q ? `Resultados para "${q}"` : categoryId ? "Produtos da Categoria" : "Todos os Produtos"}
          <span className="text-sm font-normal text-gray-500 ml-2">({total} encontrados)</span>
        </h1>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-kll-500">
          <option value="newest">Mais Recentes</option>
          <option value="price">Menor Preco</option>
          <option value="name">Nome A-Z</option>
        </select>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <h3 className="font-semibold text-gray-700 mb-3">Categorias</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <a href={`/search?categoryId=${cat.id}`}
                  className={`block px-3 py-2 rounded-lg text-sm transition ${categoryId === cat.id ? "bg-kll-100 text-kll-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">ðŸ”</p>
              <p>Nenhum produto encontrado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
