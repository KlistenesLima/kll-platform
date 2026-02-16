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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-kll-700 to-kll-900 rounded-2xl p-8 md:p-12 mb-8 text-white">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Bem-vindo a KLL Store</h1>
        <p className="text-lg text-gray-300 mb-6">Os melhores produtos com os melhores precos. Frete gratis para todo o Brasil!</p>
        <Link to="/search" className="inline-block bg-accent-400 text-kll-900 px-6 py-3 rounded-lg font-bold hover:bg-accent-500 transition">
          Ver Ofertas
        </Link>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Categorias</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`}
                className="bg-white rounded-xl p-4 text-center shadow hover:shadow-lg transition border border-gray-100 hover:border-kll-300">
                <div className="text-4xl mb-2">{cat.imageUrl || "ðŸ“"}</div>
                <p className="font-medium text-gray-700 text-sm">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Produtos em Destaque</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kll-600"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-6xl mb-4">ðŸ›’</p>
            <p className="text-lg">Nenhum produto disponivel ainda.</p>
            <p className="text-sm mt-2">Cadastre produtos pelo Admin Panel.</p>
          </div>
        )}
      </section>
    </div>
  );
}
