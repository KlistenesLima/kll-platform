import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productApi, categoryApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import { TruckIcon, ShieldIcon, RefreshIcon, HeadphonesIcon, ChevronRightIcon, DiamondIcon } from "../components/Icons";
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

  const features = [
    { Icon: TruckIcon, title: "Frete Gratis", desc: "Em compras acima de R$ 199" },
    { Icon: ShieldIcon, title: "Pagamento Seguro", desc: "Criptografia de ponta a ponta" },
    { Icon: RefreshIcon, title: "Troca Garantida", desc: "Ate 30 dias apos a compra" },
    { Icon: HeadphonesIcon, title: "Suporte Premium", desc: "Atendimento personalizado 24/7" },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "4rem", alignItems: "center", minHeight: "calc(100vh - 72px)",
        padding: "0 4rem", maxWidth: 1400, margin: "0 auto", overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2, animation: "fadeInUp 0.8s ease forwards" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "0.4rem 1.25rem", fontSize: "0.7rem", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "3px", color: "#c9a962",
            background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.25)",
            borderRadius: 100, marginBottom: "2rem"
          }}>
            <DiamondIcon size={12} color="#c9a962" />
            Nova Colecao 2026
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: "3.75rem", fontWeight: 700,
            lineHeight: 1.08, marginBottom: "1.5rem", color: "#fff"
          }}>
            Descubra o{" "}
            <span style={{
              color: "#c9a962", position: "relative", display: "inline-block"
            }}>
              Extraordinario
              <span style={{
                position: "absolute", bottom: 4, left: 0, width: "100%", height: 8,
                background: "rgba(201,169,98,0.15)", zIndex: -1, borderRadius: 4
              }} />
            </span>
          </h1>

          <p style={{
            fontSize: "1.05rem", color: "#8888a0", maxWidth: 480,
            marginBottom: "2.5rem", lineHeight: 1.8
          }}>
            Produtos premium selecionados com curadoria exclusiva.
            Qualidade, elegancia e sofisticacao em cada detalhe.
          </p>

          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Link to="/search" style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "0.9rem 2.25rem", fontFamily: "'Poppins', sans-serif", fontSize: "0.8rem",
              fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.5px",
              color: "#0f0f1a", background: "linear-gradient(135deg, #c9a962 0%, #b8963f 100%)",
              border: "none", borderRadius: 10, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(201,169,98,0.25)", transition: "all 0.3s"
            }}>
              Explorar Colecao <ChevronRightIcon size={16} color="#0f0f1a" />
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "3rem", marginTop: "4rem",
            paddingTop: "2rem", borderTop: "1px solid rgba(201,169,98,0.1)"
          }}>
            {[
              { value: "500+", label: "Produtos" },
              { value: "15k+", label: "Clientes" },
              { value: "4.9", label: "Avaliacao" },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", fontWeight: 700, color: "#c9a962" }}>{stat.value}</p>
                <p style={{ fontSize: "0.75rem", color: "#6c6c7e", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual */}
        <div style={{
          position: "relative", animation: "fadeIn 1s ease 0.3s forwards", opacity: 0
        }}>
          <div style={{
            width: "100%", aspectRatio: "4/5", borderRadius: 24,
            background: "linear-gradient(160deg, #1e1e38 0%, #151528 40%, #1a1a35 100%)",
            border: "1px solid rgba(201,169,98,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden"
          }}>
            {/* Decorative elements */}
            <div style={{
              position: "absolute", top: "15%", left: "15%", width: "70%", height: "70%",
              border: "1px solid rgba(201,169,98,0.08)", borderRadius: "50%"
            }} />
            <div style={{
              position: "absolute", top: "25%", left: "25%", width: "50%", height: "50%",
              border: "1px solid rgba(201,169,98,0.06)", borderRadius: "50%"
            }} />
            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
              <DiamondIcon size={64} color="rgba(201,169,98,0.15)" />
              <p style={{
                color: "rgba(201,169,98,0.4)", fontSize: "0.7rem", textTransform: "uppercase",
                letterSpacing: 6, marginTop: "1.5rem", fontWeight: 500
              }}>Premium Collection</p>
            </div>
            {/* Gold accent gradient */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(201,169,98,0.05), transparent)"
            }} />
          </div>
        </div>

        {/* Background decoration */}
        <div style={{
          position: "absolute", top: "5%", right: "-15%", width: 700, height: 700,
          background: "radial-gradient(circle, rgba(201,169,98,0.04) 0%, transparent 65%)",
          borderRadius: "50%", zIndex: 0, pointerEvents: "none"
        }} />
      </section>

      {/* Features */}
      <section style={{
        padding: "4.5rem 0", background: "rgba(26, 26, 46, 0.5)",
        borderTop: "1px solid rgba(201,169,98,0.08)",
        borderBottom: "1px solid rgba(201,169,98,0.08)"
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 2rem",
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem"
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              textAlign: "center", padding: "2rem 1.5rem",
              borderRadius: 16, transition: "all 0.3s",
              background: "transparent"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,169,98,0.04)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 64, height: 64, color: "#c9a962",
                background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.15)",
                borderRadius: 16, marginBottom: "1.25rem"
              }}><f.Icon size={24} /></div>
              <h4 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.05rem",
                fontWeight: 600, color: "#fff", marginBottom: "0.5rem"
              }}>{f.title}</h4>
              <p style={{ fontSize: "0.85rem", color: "#6c6c7e", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{ maxWidth: 1400, margin: "0 auto", padding: "5rem 2rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem" }}>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#fff" }}>Categorias</h2>
              <p style={{ color: "#6c6c7e", fontSize: "0.9rem", marginTop: "0.25rem" }}>Navegue por departamento</p>
            </div>
            <Link to="/search" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: "0.8rem", color: "#c9a962", textDecoration: "none",
              fontWeight: 500, transition: "gap 0.2s"
            }}>
              Ver todas <ChevronRightIcon size={16} color="#c9a962" />
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.id} to={`/search?categoryId=${cat.id}`} style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "2.5rem 1.5rem",
                background: "rgba(26,26,46,0.5)", border: "1px solid rgba(201,169,98,0.08)",
                borderRadius: 16, textDecoration: "none", transition: "all 0.3s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.08)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: "1rem",
                  background: "rgba(201,169,98,0.08)", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <DiamondIcon size={20} color="#c9a962" />
                </div>
                <span style={{
                  fontFamily: "'Playfair Display', serif", color: "#fff",
                  fontSize: "1rem", fontWeight: 500
                }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section style={{ padding: "0 2rem 5rem", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "3rem" }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#fff" }}>Produtos em Destaque</h2>
            <p style={{ color: "#6c6c7e", fontSize: "0.9rem", marginTop: "0.25rem" }}>Selecao curada para voce</p>
          </div>
          <Link to="/search" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "0.6rem 1.5rem", fontSize: "0.75rem", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "1.5px", color: "#c9a962",
            background: "transparent", border: "1px solid rgba(201,169,98,0.25)", borderRadius: 10,
            textDecoration: "none", transition: "all 0.3s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,169,98,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            Ver Todos <ChevronRightIcon size={14} color="#c9a962" />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {[1,2,3,4].map((i) => (
              <div key={i} style={{
                height: 420, background: "linear-gradient(90deg, #1a1a2e 25%, #22223a 50%, #1a1a2e 75%)",
                backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 16
              }} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{
            textAlign: "center", padding: "5rem 2rem",
            background: "rgba(26,26,46,0.3)", borderRadius: 20,
            border: "1px solid rgba(201,169,98,0.06)"
          }}>
            <DiamondIcon size={48} color="rgba(201,169,98,0.15)" />
            <p style={{ color: "#6c6c7e", fontSize: "1.05rem", marginTop: "1.5rem" }}>Nenhum produto disponivel ainda.</p>
            <p style={{ color: "#4a4a5e", fontSize: "0.85rem", marginTop: "0.5rem" }}>Cadastre produtos pelo painel administrativo.</p>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section style={{
        margin: "0 2rem 4rem", maxWidth: 1400 - 64, marginLeft: "auto", marginRight: "auto",
        padding: "4rem", borderRadius: 24,
        background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 50%, #8a7340 100%)",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -50, right: -50, width: 200, height: 200,
          background: "rgba(255,255,255,0.05)", borderRadius: "50%"
        }} />
        <div style={{
          position: "absolute", bottom: -30, left: -30, width: 150, height: 150,
          background: "rgba(255,255,255,0.03)", borderRadius: "50%"
        }} />
        <h2 style={{
          fontSize: "2.25rem", color: "#0f0f1a", fontFamily: "'Playfair Display', serif",
          marginBottom: "0.75rem", position: "relative"
        }}>Experiencia Premium</h2>
        <p style={{
          fontSize: "1rem", color: "rgba(15,15,26,0.6)", marginBottom: "2rem",
          maxWidth: 500, margin: "0 auto 2rem", position: "relative"
        }}>Faca parte do nosso clube e receba ofertas exclusivas.</p>
        <Link to="/login" style={{
          display: "inline-block", padding: "0.9rem 2.5rem",
          fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
          color: "#c9a962", background: "#0f0f1a", borderRadius: 12,
          textDecoration: "none", transition: "all 0.3s", position: "relative",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
        }}>Criar Conta</Link>
      </section>
    </div>
  );
}