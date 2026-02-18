import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { orderApi, addressApi, shippingApi } from "../services/api";
import ProductImage from "../components/ProductImage";
import type { CustomerAddress } from "../types";
import toast from "react-hot-toast";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.75rem 1rem", background: "#252542",
  border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8,
  color: "#e0e0e0", fontSize: "0.9rem", fontFamily: "'Poppins', sans-serif",
  outline: "none", transition: "border-color 0.2s",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 500,
  color: "#9898ab", marginBottom: 6, fontFamily: "'Poppins', sans-serif",
};

interface ShippingOpt { name: string; price: number; deliveryDays: string; minDays: number; maxDays: number; }

const STATES = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function Checkout() {
  const { items, total, clearCart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const nav = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [form, setForm] = useState({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" });

  // Shipping
  const [shippingOpts, setShippingOpts] = useState<ShippingOpt[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<number>(-1);
  const [shippingLoading, setShippingLoading] = useState(false);

  // Payment
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const shippingPrice = selectedShipping >= 0 ? shippingOpts[selectedShipping]?.price ?? 0 : 0;
  const grandTotal = total + shippingPrice;

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    addressApi.getAll().then((data: CustomerAddress[]) => {
      setAddresses(data);
      const def = data.find((a) => a.isDefault);
      if (def) { setSelectedAddressId(def.id); fillForm(def); }
    }).catch(() => {});
  }, []);

  const fillForm = (addr: CustomerAddress) => {
    setForm({ street: addr.street, number: addr.number, complement: addr.complement || "", neighborhood: addr.neighborhood, city: addr.city, state: addr.state, zipCode: addr.zipCode });
  };

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id);
    setShippingOpts([]); setSelectedShipping(-1);
    if (id === "new") setForm({ street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" });
    else { const a = addresses.find((a) => a.id === id); if (a) fillForm(a); }
  };

  const formatCep = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 8); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d; };
  const formatCard = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 16); return d.replace(/(\d{4})(?=\d)/g, "$1 "); };
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };

  const calcShipping = async () => {
    const digits = form.zipCode.replace(/\D/g, "");
    if (digits.length !== 8) { toast.error("CEP deve ter 8 digitos"); return; }
    setShippingLoading(true);
    try {
      const res = await shippingApi.calculate(digits, total);
      setShippingOpts(res.options);
      if (res.options.length > 0) setSelectedShipping(0);
    } catch { toast.error("Erro ao calcular frete"); }
    finally { setShippingLoading(false); }
  };

  const goToStep2 = () => {
    if (!form.street || !form.number || !form.neighborhood || !form.city || !form.state || !form.zipCode) {
      toast.error("Preencha todos os campos obrigatorios"); return;
    }
    setStep(2);
    if (shippingOpts.length === 0) calcShipping();
  };

  const simulatePayment = () => {
    setCard({ number: "4111 1111 1111 1111", name: "CLIENTE DEMONSTRACAO", expiry: "12/28", cvv: "123" });
  };

  const handleSubmit = async () => {
    if (selectedShipping < 0) { toast.error("Selecione um metodo de envio"); return; }
    const cardDigits = card.number.replace(/\D/g, "");
    if (cardDigits.length < 16) { toast.error("Preencha os dados do cartao"); return; }
    setLoading(true);
    try {
      const orderData = {
        customerId: user?.sub, customerEmail: user?.email,
        ...form, zipCode: form.zipCode.replace(/\D/g, ""),
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
      };
      const order = await orderApi.create(orderData);
      try { await orderApi.confirmPayment(order.id, `sim_${Date.now()}`); } catch {}
      await clearCart();
      nav(`/order/${order.id}`, { state: { confirmed: true, total: grandTotal, shipping: shippingOpts[selectedShipping] } });
    } catch { toast.error("Erro ao finalizar pedido"); }
    finally { setLoading(false); }
  };

  if (items.length === 0 && !loading) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#6c6c7e", fontSize: "1.1rem", marginBottom: "1.5rem" }}>Seu carrinho esta vazio</p>
        <button onClick={() => nav("/search")} style={{ padding: "0.8rem 2rem", background: "linear-gradient(135deg,#c9a962,#a68b4b)", color: "#1a1a2e", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>Explorar Produtos</button>
      </div>
    </div>
  );

  const stepDone = (n: number) => step > n;
  const stepActive = (n: number) => step === n;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header + Steps */}
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>Checkout</h1>
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {[{ n: 1, label: "Endereco" }, { n: 2, label: "Envio" }, { n: 3, label: "Pagamento" }].map(({ n, label }) => (
            <button key={n} onClick={() => { if (stepDone(n) || stepActive(n)) setStep(n); }}
              style={{
                flex: 1, padding: "0.75rem", borderRadius: 8, border: "none", cursor: stepDone(n) || stepActive(n) ? "pointer" : "default",
                background: stepActive(n) ? "linear-gradient(135deg,#c9a962,#a68b4b)" : stepDone(n) ? "rgba(201,169,98,0.15)" : "#1a1a2e",
                color: stepActive(n) ? "#0f0f1a" : stepDone(n) ? "#c9a962" : "#6c6c7e",
                fontWeight: 600, fontSize: "0.85rem", fontFamily: "'Poppins', sans-serif", transition: "all 0.3s",
              }}>
              {stepDone(n) ? "\u2713 " : `${n}. `}{label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>
          {/* Left Column */}
          <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "2rem", border: "1px solid rgba(201,169,98,0.1)" }}>
            {/* STEP 1 - Address */}
            {step === 1 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  Endereco de Entrega
                </h2>

                {addresses.length > 0 && (
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label style={labelStyle}>Selecionar endereco</label>
                    <select value={selectedAddressId} onChange={(e) => handleAddressSelect(e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239898ab' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", paddingRight: "2.5rem" }}>
                      {addresses.map((a) => (<option key={a.id} value={a.id}>{a.label} - {a.street}, {a.number} {a.isDefault ? "(Padrao)" : ""}</option>))}
                      <option value="new">+ Novo endereco</option>
                    </select>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div><label style={labelStyle}>CEP</label>
                    <input required value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: formatCep(e.target.value) })} style={inputStyle} placeholder="00000-000" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                  <div><label style={labelStyle}>Rua</label>
                    <input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} style={inputStyle} placeholder="Nome da rua" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div><label style={labelStyle}>Numero</label>
                    <input required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} style={inputStyle} placeholder="123" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                  <div><label style={labelStyle}>Complemento</label>
                    <input value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} style={inputStyle} placeholder="Apto, Bloco..." onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                  <div><label style={labelStyle}>Bairro</label>
                    <input required value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} style={inputStyle} placeholder="Bairro" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: "1rem", marginBottom: "2rem" }}>
                  <div><label style={labelStyle}>Cidade</label>
                    <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} placeholder="Cidade" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                  <div><label style={labelStyle}>UF</label>
                    <select required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}>
                      <option value="">UF</option>
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button onClick={goToStep2} style={{
                  width: "100%", padding: "1rem", border: "none", borderRadius: 12, cursor: "pointer",
                  background: "linear-gradient(135deg,#c9a962,#a68b4b)", color: "#0f0f1a", fontSize: "1rem", fontWeight: 700,
                  fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: 1.5
                }}>Continuar para Envio</button>
              </>
            )}

            {/* STEP 2 - Shipping */}
            {step === 2 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  Metodo de Envio
                </h2>
                <p style={{ color: "#6c6c7e", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                  Entrega para: {form.street}, {form.number} - {form.city}/{form.state} - CEP {form.zipCode}
                </p>

                {shippingLoading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>
                    <div style={{ width: 32, height: 32, border: "3px solid rgba(201,169,98,0.2)", borderTopColor: "#c9a962", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    <p style={{ color: "#6c6c7e", marginTop: "0.75rem", fontSize: "0.85rem" }}>Calculando frete...</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                    {shippingOpts.map((opt, i) => (
                      <label key={i} onClick={() => setSelectedShipping(i)} style={{
                        display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem",
                        background: selectedShipping === i ? "rgba(201,169,98,0.1)" : "#252542",
                        border: `2px solid ${selectedShipping === i ? "#c9a962" : "rgba(201,169,98,0.1)"}`,
                        borderRadius: 12, cursor: "pointer", transition: "all 0.2s"
                      }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${selectedShipping === i ? "#c9a962" : "#6c6c7e"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {selectedShipping === i && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#c9a962" }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.95rem", color: "#fff", fontWeight: 600 }}>{opt.name}</p>
                          <p style={{ fontSize: "0.8rem", color: "#6c6c7e", marginTop: 2 }}>{opt.deliveryDays}</p>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "1rem", color: opt.price === 0 ? "#4caf50" : "#c9a962" }}>
                          {opt.price === 0 ? "Gratis" : fmt(opt.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button onClick={() => setStep(1)} style={{ padding: "1rem 1.5rem", border: "2px solid rgba(201,169,98,0.2)", borderRadius: 12, background: "transparent", color: "#b8b8c7", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Voltar</button>
                  <button onClick={() => { if (selectedShipping >= 0) setStep(3); else toast.error("Selecione um metodo de envio"); }}
                    disabled={selectedShipping < 0} style={{
                    flex: 1, padding: "1rem", border: "none", borderRadius: 12, cursor: selectedShipping >= 0 ? "pointer" : "not-allowed",
                    background: selectedShipping >= 0 ? "linear-gradient(135deg,#c9a962,#a68b4b)" : "#333",
                    color: "#0f0f1a", fontSize: "1rem", fontWeight: 700, fontFamily: "'Poppins', sans-serif", textTransform: "uppercase", letterSpacing: 1.5, opacity: selectedShipping >= 0 ? 1 : 0.5
                  }}>Continuar para Pagamento</button>
                </div>
              </>
            )}

            {/* STEP 3 - Payment */}
            {step === 3 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", color: "#fff", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 10 }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Pagamento
                </h2>

                <div style={{ padding: "0.75rem 1rem", background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontSize: "0.8rem", color: "#c9a962" }}>Ambiente de demonstracao — pagamento simulado</span>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Numero do Cartao</label>
                  <input value={card.number} onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })} style={inputStyle} placeholder="0000 0000 0000 0000" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>Nome no Cartao</label>
                  <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })} style={inputStyle} placeholder="NOME COMO NO CARTAO" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div><label style={labelStyle}>Validade</label>
                    <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} style={inputStyle} placeholder="MM/AA" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                  <div><label style={labelStyle}>CVV</label>
                    <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) })} style={inputStyle} placeholder="123" type="password" onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
                  </div>
                </div>

                <button onClick={simulatePayment} style={{
                  width: "100%", padding: "0.75rem", border: "1px dashed rgba(201,169,98,0.3)", borderRadius: 8,
                  background: "transparent", color: "#c9a962", cursor: "pointer", fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.85rem", marginBottom: "1.5rem"
                }}>Preencher automaticamente (Demo)</button>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button onClick={() => setStep(2)} style={{ padding: "1rem 1.5rem", border: "2px solid rgba(201,169,98,0.2)", borderRadius: 12, background: "transparent", color: "#b8b8c7", cursor: "pointer", fontFamily: "'Poppins', sans-serif" }}>Voltar</button>
                  <button onClick={handleSubmit} disabled={loading || card.number.replace(/\D/g, "").length < 16}
                    style={{
                      flex: 1, padding: "1rem", border: "none", borderRadius: 12, cursor: loading ? "wait" : "pointer",
                      background: loading ? "#555" : "linear-gradient(135deg,#c9a962,#a68b4b)", color: "#0f0f1a",
                      fontSize: "1.05rem", fontWeight: 700, fontFamily: "'Poppins', sans-serif", textTransform: "uppercase",
                      letterSpacing: 1.5, boxShadow: loading ? "none" : "0 4px 15px rgba(201,169,98,0.3)",
                      opacity: loading || card.number.replace(/\D/g, "").length < 16 ? 0.6 : 1
                    }}>
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Processando...
                      </span>
                    ) : `Confirmar Pedido — ${fmt(grandTotal)}`}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Order Summary (sticky) */}
          <div style={{ background: "#1a1a2e", borderRadius: 16, padding: "1.5rem", border: "1px solid rgba(201,169,98,0.1)", position: "sticky", top: 90 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 600, color: "#fff", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: 10 }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              Resumo do Pedido
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 300, overflowY: "auto" }}>
              {items.map((item) => (
                <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0.6rem", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#252542" }}>
                    <ProductImage imageUrl={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", color: "#e0e0e0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.productName}</div>
                    <div style={{ fontSize: "0.7rem", color: "#6c6c7e", marginTop: 2 }}>Qtd: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c9a962", whiteSpace: "nowrap" }}>{fmt(item.total)}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(201,169,98,0.15)", marginTop: "1.25rem", paddingTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#9898ab" }}>Subtotal</span>
                <span style={{ fontSize: "0.85rem", color: "#e0e0e0" }}>{fmt(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.85rem", color: "#9898ab" }}>Frete</span>
                <span style={{ fontSize: "0.85rem", color: shippingPrice === 0 && selectedShipping >= 0 ? "#4caf50" : "#e0e0e0", fontWeight: 600 }}>
                  {selectedShipping >= 0 ? (shippingPrice === 0 ? "Gratis" : fmt(shippingPrice)) : "—"}
                </span>
              </div>
              <div style={{ borderTop: "1px solid rgba(201,169,98,0.15)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "1rem", color: "#9898ab", fontWeight: 600 }}>Total</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 700, color: "#c9a962" }}>
                  {fmt(grandTotal)}
                </span>
              </div>
            </div>

            {/* Security badges */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(201,169,98,0.1)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {[["Compra 100% Segura", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"],
                ["Entrega Garantida", "M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"],
                ["Devolucao em 30 dias", "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8H15V2l2.26 2.26A9.75 9.75 0 0 0 12 3a9 9 0 0 0-9 9z"]
              ].map(([txt, path], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,98,0.4)" strokeWidth="2"><path d={path}/></svg>
                  <span style={{ fontSize: "0.7rem", color: "#6c6c7e" }}>{txt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
