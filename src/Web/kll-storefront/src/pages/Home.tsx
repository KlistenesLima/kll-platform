import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import { DiamondIcon } from "../components/Icons";
import { FiTruck, FiCreditCard, FiShield } from "react-icons/fi";
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

  const latestProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const topCategories = categories
    .filter((c) => !c.subCategories || c.subCategories.length >= 0)
    .slice(0, 4);

  return (
    <div>
      {/* ─── HERO BANNER ─── */}
      <section className="relative min-h-[calc(100vh-72px)] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-dark">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(201, 169, 98, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(26, 26, 46, 0.8) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(201, 169, 98, 0.04) 0%, transparent 40%)",
            }}
          />
          {/* Decorative circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gold/[0.06] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gold/[0.04] rounded-full" />
        </div>

        {/* Content */}
        <div
          className="relative z-10 text-center px-4 max-w-3xl mx-auto"
          style={{ animation: "fadeInUp 0.8s ease forwards" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[3px] text-gold bg-gold/[0.08] border border-gold/25 rounded-full mb-8">
            <DiamondIcon size={12} color="#c9a962" />
            Coleção 2026
          </div>

          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-gold leading-tight mb-6">
            Joias que contam histórias
          </h1>

          <p className="font-poppins font-light text-text-secondary text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Descubra peças exclusivas que refletem sua essência
          </p>

          <Link
            to="/search"
            className="inline-block bg-gold text-dark hover:bg-gold-light px-8 py-4 rounded-lg font-poppins font-semibold text-[0.8rem] uppercase tracking-[2px] no-underline shadow-[0_4px_20px_rgba(201,169,98,0.25)] transition-all duration-300"
          >
            Explorar Coleção
          </Link>
        </div>
      </section>

      {/* ─── CATEGORIAS EM DESTAQUE ─── */}
      {topCategories.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="font-playfair text-2xl md:text-3xl text-white mb-4">Nossas Coleções</h2>
            <div className="w-16 h-0.5 bg-gold mx-auto" />
          </div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {topCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/search?categoryId=${cat.id}`}
                className="group relative bg-surface rounded-xl overflow-hidden border border-gold/10 no-underline transition-all duration-300 hover:scale-[1.03] hover:border-gold/25 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
              >
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface to-dark/50 group-hover:from-gold/[0.06] transition-all duration-500" />

                {/* Category image or elegant placeholder */}
                {cat.imageUrl ? (
                  <ProductImage
                    imageUrl={cat.imageUrl}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                  />
                ) : (
                  <div className="absolute top-6 right-6 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500">
                    <DiamondIcon size={80} color="#c9a962" />
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10 p-8 md:p-10 min-h-[160px] flex flex-col justify-end">
                  <h3 className="font-playfair text-xl md:text-2xl text-white group-hover:text-gold transition-colors duration-300">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="font-poppins text-text-secondary/60 text-sm mt-2 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-4 text-gold text-[0.75rem] font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explorar
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── NOVIDADES ─── */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-20">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-2xl md:text-3xl text-white mb-4">Novidades</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[420px] rounded-xl"
                style={{
                  background: "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        ) : latestProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-4 bg-surface/30 rounded-2xl border border-gold/[0.06]">
            <DiamondIcon size={48} color="rgba(201,169,98,0.15)" />
            <p className="text-text-secondary text-lg mt-6">Nenhum produto disponível ainda.</p>
            <p className="text-text-secondary/50 text-sm mt-2">Cadastre produtos pelo painel administrativo.</p>
          </div>
        )}
      </section>

      {/* ─── SOBRE / PROPÓSITO ─── */}
      <section className="bg-surface py-20">
        <div className="max-w-[800px] mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-playfair text-2xl md:text-3xl text-white mb-4">Nossa Essência</h2>
          <div className="w-16 h-0.5 bg-gold mx-auto mb-10" />
          <p className="font-poppins text-text-secondary text-base md:text-lg leading-relaxed mb-6">
            A AUREA Maison nasceu do desejo de transformar momentos em memórias eternas.
            Cada peça é cuidadosamente selecionada para refletir elegância, sofisticação
            e a singularidade de quem a usa.
          </p>
          <p className="font-poppins text-text-secondary/70 text-base leading-relaxed">
            Mais do que joias, criamos símbolos de histórias que merecem ser contadas.
          </p>
          <div className="w-8 h-px bg-gold/30 mx-auto mt-10" />
        </div>
      </section>

      {/* ─── BANNER SECUNDÁRIO ─── */}
      <section
        className="py-6"
        style={{
          background: "linear-gradient(135deg, #b08942 0%, #c9a962 50%, #b08942 100%)",
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16">
          <div className="flex items-center gap-3 text-dark">
            <FiTruck size={22} strokeWidth={2.5} />
            <span className="font-poppins font-medium text-sm">Frete grátis acima de R$ 299</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-dark/20" />
          <div className="flex items-center gap-3 text-dark">
            <FiCreditCard size={22} strokeWidth={2.5} />
            <span className="font-poppins font-medium text-sm">Parcele em até 12x</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-dark/20" />
          <div className="flex items-center gap-3 text-dark">
            <FiShield size={22} strokeWidth={2.5} />
            <span className="font-poppins font-medium text-sm">Garantia vitalícia</span>
          </div>
        </div>
      </section>
    </div>
  );
}
