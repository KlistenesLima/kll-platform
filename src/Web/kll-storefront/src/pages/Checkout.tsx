import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { orderApi, addressApi } from "../services/api";
import type { CustomerAddress } from "../types";
import toast from "react-hot-toast";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "#252542",
  border: "1px solid rgba(201,169,98,0.2)",
  borderRadius: 8,
  color: "#e0e0e0",
  fontSize: "0.9rem",
  fontFamily: "'Poppins', sans-serif",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "#9898ab",
  marginBottom: 6,
  fontFamily: "'Poppins', sans-serif",
};

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [form, setForm] = useState({
    street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: ""
  });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    addressApi.getAll().then((data: CustomerAddress[]) => {
      setAddresses(data);
      const def = data.find((a) => a.isDefault);
      if (def) {
        setSelectedAddressId(def.id);
        fillForm(def);
      }
    }).catch(() => {});
  }, []);

  const fillForm = (addr: CustomerAddress) => {
    setForm({
      street: addr.street, number: addr.number, complement: addr.complement || "",
      neighborhood: addr.neighborhood, city: addr.city, state: addr.state, zipCode: addr.zipCode
    });
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" });
    } else {
      const addr = addresses.find((a) => a.id === id);
      if (addr) fillForm(addr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = {
        customerId: user?.sub,
        customerEmail: user?.email,
        ...form,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      };
      const order = await orderApi.create(orderData);
      await clearCart();
      toast.success("Pedido realizado com sucesso!");
      nav(`/order/${order.id}`);
    } catch { toast.error("Erro ao finalizar pedido"); }
    finally { setLoading(false); }
  };

  if (items.length === 0) { nav("/cart"); return null; }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700,
          color: "#fff", marginBottom: "2rem"
        }}>Checkout</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>
          {/* Formulario */}
          <form onSubmit={handleSubmit} style={{
            background: "#1a1a2e", borderRadius: 16, padding: "2rem",
            border: "1px solid rgba(201,169,98,0.1)"
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 600,
              color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 10
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              Endereco de Entrega
            </h2>

            {/* Dropdown de enderecos salvos */}
            {addresses.length > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={labelStyle}>Selecionar endereco</label>
                <select
                  value={selectedAddressId}
                  onChange={(e) => handleAddressSelect(e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239898ab' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center",
                    paddingRight: "2.5rem",
                  }}
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} - {a.street}, {a.number} {a.isDefault ? "(Padrao)" : ""}
                    </option>
                  ))}
                  <option value="new">+ Novo endereco</option>
                </select>
              </div>
            )}

            {/* Rua + Numero */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Rua</label>
                <input required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="Nome da rua" />
              </div>
              <div>
                <label style={labelStyle}>Numero</label>
                <input required value={form.number} onChange={(e) => setForm({...form, number: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="123" />
              </div>
            </div>

            {/* Complemento + Bairro */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Complemento</label>
                <input value={form.complement} onChange={(e) => setForm({...form, complement: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="Apto, Bloco..." />
              </div>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input required value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="Bairro" />
              </div>
            </div>

            {/* Cidade + Estado + CEP */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px", gap: "1rem", marginBottom: "2rem" }}>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="Cidade" />
              </div>
              <div>
                <label style={labelStyle}>UF</label>
                <input required value={form.state} onChange={(e) => setForm({...form, state: e.target.value.toUpperCase()})}
                  style={inputStyle} maxLength={2}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="CE" />
              </div>
              <div>
                <label style={labelStyle}>CEP</label>
                <input required value={form.zipCode} onChange={(e) => setForm({...form, zipCode: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"}
                  placeholder="00000-000" />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "1rem", border: "none", borderRadius: 12, cursor: "pointer",
              background: loading ? "#555" : "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
              color: "#0f0f1a", fontSize: "1.05rem", fontWeight: 700, fontFamily: "'Poppins', sans-serif",
              textTransform: "uppercase", letterSpacing: "1.5px", transition: "all 0.3s",
              boxShadow: loading ? "none" : "0 4px 15px rgba(201,169,98,0.3)",
              opacity: loading ? 0.6 : 1
            }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Processando...
                </span>
              ) : `Confirmar Pedido - ${fmt(total)}`}
            </button>
          </form>

          {/* Resumo */}
          <div style={{
            background: "#1a1a2e", borderRadius: 16, padding: "1.5rem",
            border: "1px solid rgba(201,169,98,0.1)", position: "sticky", top: 90
          }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 600,
              color: "#fff", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 10
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
              </svg>
              Resumo do Pedido
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {items.map((item) => (
                <div key={item.productId} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 10
                }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0,
                    background: "#252542"
                  }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#6c6c7e" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                          <path d="m21 15-5-5L5 21"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "0.85rem", color: "#e0e0e0", fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                    }}>{item.productName}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6c6c7e", marginTop: 2 }}>
                      Qtd: {item.quantity} x {fmt(item.unitPrice)}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#c9a962", whiteSpace: "nowrap" }}>
                    {fmt(item.total)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: "1px solid rgba(201,169,98,0.15)", marginTop: "1.25rem", paddingTop: "1.25rem",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: "1rem", color: "#9898ab", fontWeight: 500 }}>Total</span>
              <span style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "#c9a962"
              }}>{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
