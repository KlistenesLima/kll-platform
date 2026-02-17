import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { addressApi } from "../services/api";
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

const emptyForm = { label: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", zipCode: "" };

export default function Addresses() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    try {
      const data = await addressApi.getAll();
      setAddresses(data);
    } catch { toast.error("Erro ao carregar enderecos"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (addr: CustomerAddress) => {
    setEditId(addr.id);
    setForm({
      label: addr.label, street: addr.street, number: addr.number,
      complement: addr.complement || "", neighborhood: addr.neighborhood,
      city: addr.city, state: addr.state, zipCode: addr.zipCode
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await addressApi.update(editId, form);
        toast.success("Endereco atualizado!");
      } else {
        await addressApi.create(form);
        toast.success("Endereco adicionado!");
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      await fetchAddresses();
    } catch (err: any) {
      const msg = err?.response?.data || "Erro ao salvar endereco";
      toast.error(typeof msg === "string" ? msg : "Erro ao salvar endereco");
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await addressApi.delete(id);
      toast.success("Endereco removido!");
      await fetchAddresses();
    } catch { toast.error("Erro ao remover"); }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefault(id);
      toast.success("Endereco padrao definido!");
      await fetchAddresses();
    } catch { toast.error("Erro ao definir padrao"); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div>
            <Link to="/profile" style={{
              fontSize: "0.8rem", color: "#6c6c7e", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6, marginBottom: 8
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Voltar ao Perfil
            </Link>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700, color: "#fff"
            }}>Meus Enderecos</h1>
          </div>
          {addresses.length < 5 && !showForm && (
            <button onClick={openCreate} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0.6rem 1.25rem",
              background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
              border: "none", borderRadius: 10, color: "#0f0f1a", fontSize: "0.8rem", fontWeight: 600,
              cursor: "pointer", fontFamily: "'Poppins', sans-serif", textTransform: "uppercase",
              letterSpacing: "1px", boxShadow: "0 2px 8px rgba(201,169,98,0.2)"
            }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Adicionar
            </button>
          )}
        </div>

        {addresses.length >= 5 && !showForm && (
          <div style={{
            padding: "0.75rem 1rem", background: "rgba(201,169,98,0.08)", borderRadius: 8,
            border: "1px solid rgba(201,169,98,0.2)", color: "#c9a962", fontSize: "0.85rem",
            marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: 8
          }}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Limite de 5 enderecos atingido
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <form onSubmit={handleSave} style={{
            background: "#1a1a2e", borderRadius: 16, padding: "1.5rem",
            border: "1px solid rgba(201,169,98,0.15)", marginBottom: "1.5rem"
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 600,
              color: "#fff", marginBottom: "1.25rem"
            }}>{editId ? "Editar Endereco" : "Novo Endereco"}</h3>

            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Nome do endereco</label>
              <input required value={form.label} onChange={(e) => setForm({...form, label: e.target.value})}
                style={inputStyle} placeholder="Ex: Casa, Trabalho..."
                onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Rua</label>
                <input required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
              <div>
                <label style={labelStyle}>Numero</label>
                <input required value={form.number} onChange={(e) => setForm({...form, number: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={labelStyle}>Complemento</label>
                <input value={form.complement} onChange={(e) => setForm({...form, complement: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
              <div>
                <label style={labelStyle}>Bairro</label>
                <input required value={form.neighborhood} onChange={(e) => setForm({...form, neighborhood: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 140px", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
              <div>
                <label style={labelStyle}>UF</label>
                <input required value={form.state} onChange={(e) => setForm({...form, state: e.target.value.toUpperCase()})}
                  style={inputStyle} maxLength={2}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
              <div>
                <label style={labelStyle}>CEP</label>
                <input required value={form.zipCode} onChange={(e) => setForm({...form, zipCode: e.target.value})}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" disabled={saving} style={{
                flex: 1, padding: "0.75rem", border: "none", borderRadius: 10, cursor: "pointer",
                background: saving ? "#555" : "linear-gradient(135deg, #c9a962, #a68b4b)",
                color: "#0f0f1a", fontWeight: 700, fontSize: "0.85rem", fontFamily: "'Poppins', sans-serif",
                textTransform: "uppercase", letterSpacing: "1px"
              }}>
                {saving ? "Salvando..." : editId ? "Atualizar" : "Adicionar"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} style={{
                padding: "0.75rem 1.5rem", border: "1px solid rgba(201,169,98,0.2)", borderRadius: 10,
                background: "transparent", color: "#9898ab", cursor: "pointer",
                fontSize: "0.85rem", fontFamily: "'Poppins', sans-serif"
              }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6c6c7e" }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
        )}

        {/* Lista */}
        {!loading && addresses.length === 0 && !showForm && (
          <div style={{
            textAlign: "center", padding: "3rem", background: "#1a1a2e", borderRadius: 16,
            border: "1px solid rgba(201,169,98,0.1)"
          }}>
            <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#6c6c7e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <p style={{ color: "#6c6c7e", fontSize: "0.95rem", marginBottom: 16 }}>Nenhum endereco cadastrado</p>
            <button onClick={openCreate} style={{
              padding: "0.6rem 1.5rem", background: "linear-gradient(135deg, #c9a962, #a68b4b)",
              border: "none", borderRadius: 10, color: "#0f0f1a", fontWeight: 600,
              fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Poppins', sans-serif"
            }}>Adicionar Endereco</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {addresses.map((addr) => (
            <div key={addr.id} style={{
              background: "#1a1a2e", borderRadius: 14, padding: "1.25rem 1.5rem",
              border: addr.isDefault ? "1px solid rgba(201,169,98,0.3)" : "1px solid rgba(201,169,98,0.08)",
              transition: "border-color 0.2s"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: "0.95rem", fontWeight: 600, color: "#fff"
                  }}>{addr.label}</span>
                  {addr.isDefault && (
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 600, padding: "3px 8px",
                      background: "rgba(201,169,98,0.15)", color: "#c9a962",
                      borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.5px"
                    }}>Padrao</span>
                  )}
                </div>
              </div>

              <p style={{ color: "#9898ab", fontSize: "0.85rem", lineHeight: 1.5, margin: 0 }}>
                {addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""}<br />
                {addr.neighborhood} - {addr.city}/{addr.state}<br />
                CEP: {addr.zipCode}
              </p>

              <div style={{
                display: "flex", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.75rem",
                borderTop: "1px solid rgba(201,169,98,0.06)"
              }}>
                <button onClick={() => openEdit(addr)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "0.4rem 0.85rem",
                  background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.15)",
                  borderRadius: 6, color: "#c9a962", fontSize: "0.75rem", cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                  Editar
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "0.4rem 0.85rem",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,169,98,0.1)",
                    borderRadius: 6, color: "#9898ab", fontSize: "0.75rem", cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif"
                  }}>
                    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                    Tornar Padrao
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "0.4rem 0.85rem",
                  background: "rgba(244,67,54,0.06)", border: "1px solid rgba(244,67,54,0.15)",
                  borderRadius: 6, color: "#f44336", fontSize: "0.75rem", cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif", marginLeft: "auto"
                }}>
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
