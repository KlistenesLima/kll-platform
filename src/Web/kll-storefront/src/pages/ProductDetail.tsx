import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productApi } from "../services/api";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import ShippingCalculator from "../components/ShippingCalculator";
import ProductImage from "../components/ProductImage";
import ProductCard from "../components/ProductCard";
import { CartIcon, MinusIcon, PlusIcon, ChevronDownIcon, TruckIcon, ShieldIcon } from "../components/Icons";
import { FiCreditCard } from "react-icons/fi";
import { useFavoritesStore } from "../store/favoritesStore";
import type { Product } from "../types";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [descExpanded, setDescExpanded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setQuantity(1);
    setDescExpanded(false);
    setDetailsOpen(false);
    setShippingOpen(false);
    window.scrollTo(0, 0);

    productApi.getById(id).then((p: Product) => {
      setProduct(p);
      if (p.categoryId) {
        productApi.getByCategory(p.categoryId).then((products: Product[]) => {
          setRelatedProducts(products.filter((rp: Product) => rp.id !== p.id).slice(0, 4));
        }).catch(() => {});
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) { nav("/login"); return; }
    if (!product) return;
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      toast.success(`${product.name} adicionado!`, {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.3)" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || "Erro ao adicionar ao carrinho";
      toast.error(msg);
    } finally {
      setAdding(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-[3px] border-gold/20 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="text-center py-20 text-text-secondary font-poppins text-lg">
      Produto não encontrado
    </div>
  );

  const isNew = product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000;
  const outOfStock = product.stockQuantity === 0;
  const lowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10"
        style={{ animation: "fadeInUp 0.6s ease-out" }}
      >
        {/* ====== MAIN GRID ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 lg:gap-12">

          {/* ── Left Column — Image ── */}
          <div className="relative group">
            <div className="relative bg-surface rounded-2xl overflow-hidden aspect-square lg:aspect-[3/4]">
              <ProductImage
                imageUrl={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gold gradient overlay bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gold/[0.06] to-transparent pointer-events-none" />

              {/* Badges */}
              {outOfStock && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-[#ef5350] text-white text-[0.65rem] font-bold uppercase tracking-[0.5px] rounded-md shadow-lg">
                  Esgotado
                </span>
              )}
              {!outOfStock && isNew && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-gold text-dark text-[0.65rem] font-bold uppercase tracking-wider rounded-md shadow-lg">
                  Novo
                </span>
              )}
              {!outOfStock && !isNew && lowStock && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-orange-500/90 text-white text-[0.65rem] font-bold uppercase tracking-[0.5px] rounded-md shadow-lg">
                  Últimas unidades
                </span>
              )}
            </div>
          </div>

          {/* ── Right Column — Info ── */}
          <div className="flex flex-col">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-text-secondary font-poppins mb-5 flex-wrap">
              <Link to="/" className="no-underline text-text-secondary hover:text-gold transition-colors duration-200">
                Home
              </Link>
              <span className="text-text-secondary/40">/</span>
              <Link to="/search" className="no-underline text-text-secondary hover:text-gold transition-colors duration-200">
                {product.category}
              </Link>
              <span className="text-text-secondary/40">/</span>
              <span className="text-text-secondary/60 truncate max-w-[200px]">{product.name}</span>
            </nav>

            {/* Category Tag */}
            <span className="text-gold uppercase tracking-[2px] text-xs font-semibold mb-3 font-poppins">
              {product.category}
            </span>

            {/* Product Name */}
            <h1 className="font-playfair text-3xl md:text-4xl text-white font-bold leading-tight mb-6">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-gold text-3xl font-bold font-poppins">
                  {fmt(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-text-secondary text-lg line-through">
                    {fmt(product.oldPrice)}
                  </span>
                )}
              </div>
              <p className="text-text-secondary text-sm mt-1 font-poppins">
                ou 12x de <span className="text-text-primary">{fmt(product.price / 12)}</span>
              </p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className={`text-text-secondary text-base leading-relaxed font-poppins ${!descExpanded ? "line-clamp-4" : ""}`}>
                {product.description}
              </p>
              {product.description && product.description.length > 150 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-2 text-gold text-sm font-medium bg-transparent border-none cursor-pointer font-poppins hover:text-gold-light transition-colors duration-200 p-0"
                >
                  {descExpanded ? "Ver menos" : "Ver mais"}
                </button>
              )}
            </div>

            {/* Separator */}
            <div className="border-t border-gold/10 mb-6" />

            {/* Quantity Selector */}
            {!outOfStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm text-text-secondary font-poppins">Quantidade:</span>
                <div className="flex items-center border border-gold/20 rounded-lg bg-surface overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer text-white hover:text-gold hover:bg-gold/5 transition-all duration-200"
                  >
                    <MinusIcon size={16} />
                  </button>
                  <span className="w-12 text-center text-white font-semibold font-poppins select-none border-x border-gold/10">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="flex items-center justify-center w-10 h-10 bg-transparent border-none cursor-pointer text-white hover:text-gold hover:bg-gold/5 transition-all duration-200"
                  >
                    <PlusIcon size={16} />
                  </button>
                </div>
                <span className="text-xs text-text-secondary/60 font-poppins">
                  ({product.stockQuantity} disponíveis)
                </span>
              </div>
            )}

            {/* Add to Cart + Favorite */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAdd}
                disabled={outOfStock || adding}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-poppins font-semibold text-base uppercase tracking-wider border-none transition-all duration-300 ${
                  outOfStock
                    ? "bg-surface/50 text-text-secondary cursor-not-allowed"
                    : "bg-gold text-dark hover:bg-gold-light cursor-pointer shadow-[0_0_20px_rgba(201,169,98,0.3)] hover:shadow-[0_0_30px_rgba(201,169,98,0.4)]"
                }`}
              >
                {adding ? (
                  <div className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
                ) : (
                  <CartIcon size={20} color={outOfStock ? "currentColor" : "#0f0f1a"} />
                )}
                {outOfStock ? "ESGOTADO" : adding ? "ADICIONANDO..." : "ADICIONAR AO CARRINHO"}
              </button>
              <button
                onClick={async () => {
                  if (!isAuthenticated) { nav("/login"); return; }
                  if (!product) return;
                  setHeartAnim(true);
                  setTimeout(() => setHeartAnim(false), 300);
                  await toggleFavorite(product.id);
                }}
                className="flex items-center justify-center w-14 rounded-xl border-2 cursor-pointer transition-all duration-300 bg-transparent"
                style={{
                  borderColor: isFavorite(product.id) ? "#c9a962" : "rgba(201,169,98,0.2)",
                  transform: heartAnim ? "scale(1.1)" : "scale(1)",
                }}
              >
                <svg width={22} height={22} viewBox="0 0 24 24"
                  fill={isFavorite(product.id) ? "#c9a962" : "none"}
                  stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-surface/50 rounded-lg p-3 flex flex-col items-center text-center gap-2">
                <TruckIcon size={20} color="#c9a962" />
                <span className="text-text-secondary text-[0.7rem] font-poppins leading-tight">
                  Frete Grátis acima de R$ 299
                </span>
              </div>
              <div className="bg-surface/50 rounded-lg p-3 flex flex-col items-center text-center gap-2">
                <FiCreditCard size={20} className="text-gold shrink-0" />
                <span className="text-text-secondary text-[0.7rem] font-poppins leading-tight">
                  Até 12x sem juros
                </span>
              </div>
              <div className="bg-surface/50 rounded-lg p-3 flex flex-col items-center text-center gap-2">
                <ShieldIcon size={20} color="#c9a962" />
                <span className="text-text-secondary text-[0.7rem] font-poppins leading-tight">
                  Garantia Vitalícia
                </span>
              </div>
            </div>

            {/* Shipping Calculator */}
            <ShippingCalculator cartTotal={product.price * quantity} />

            {/* Expandable Sections */}
            <div className="mt-6">
              {/* Product Details */}
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full flex items-center justify-between py-4 bg-transparent border-none border-t border-gold/10 text-white font-poppins font-medium text-sm cursor-pointer hover:bg-surface/30 transition-colors duration-200 px-1"
              >
                <span>Detalhes do Produto</span>
                <span
                  className="transition-transform duration-300"
                  style={{ transform: detailsOpen ? "rotate(180deg)" : "rotate(0)" }}
                >
                  <ChevronDownIcon size={18} color={detailsOpen ? "#c9a962" : "#a0a0b0"} />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: detailsOpen ? 500 : 0, opacity: detailsOpen ? 1 : 0 }}
              >
                <div className="pb-4 px-1 text-text-secondary text-sm leading-relaxed font-poppins">
                  <p>{product.description}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                      <span>Categoria: {product.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                      <span>Estoque: {product.stockQuantity} unidades</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping & Returns */}
              <button
                onClick={() => setShippingOpen(!shippingOpen)}
                className="w-full flex items-center justify-between py-4 bg-transparent border-none border-t border-gold/10 text-white font-poppins font-medium text-sm cursor-pointer hover:bg-surface/30 transition-colors duration-200 px-1"
              >
                <span>Envio e Devoluções</span>
                <span
                  className="transition-transform duration-300"
                  style={{ transform: shippingOpen ? "rotate(180deg)" : "rotate(0)" }}
                >
                  <ChevronDownIcon size={18} color={shippingOpen ? "#c9a962" : "#a0a0b0"} />
                </span>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: shippingOpen ? 500 : 0, opacity: shippingOpen ? 1 : 0 }}
              >
                <div className="pb-4 px-1 text-text-secondary text-sm leading-relaxed font-poppins space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    <span>Frete grátis para compras acima de R$ 299</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    <span>Entrega em até 5 dias úteis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    <span>Troca ou devolução em até 30 dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full shrink-0" />
                    <span>Embalagem premium para presente</span>
                  </div>
                </div>
              </div>

              {/* Bottom border */}
              <div className="border-t border-gold/10" />
            </div>
          </div>
        </div>

        {/* ====== RELATED PRODUCTS ====== */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <div className="text-center mb-10">
              <h2 className="font-playfair text-2xl md:text-3xl text-white font-bold mb-3">
                Você Também Pode Gostar
              </h2>
              <div className="w-16 h-0.5 bg-gold mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
