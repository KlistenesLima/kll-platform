import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { profileApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import type { UserProfile } from "../types";
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

export default function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileApi.get().then((data: UserProfile) => {
      setProfile(data);
      setFirstName(data.firstName);
      setLastName(data.lastName);
    }).catch(() => toast.error("Erro ao carregar perfil"));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.update({ firstName, lastName });
      setProfile(updated);
      toast.success("Perfil atualizado!");
    } catch { toast.error("Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await profileApi.uploadAvatar(file);
      setProfile((prev) => prev ? { ...prev, avatarUrl: url } : prev);
      toast.success("Foto atualizada!");
    } catch { toast.error("Erro ao enviar foto"); }
    finally { setUploading(false); }
  };

  const initial = user?.preferred_username?.charAt(0).toUpperCase() || "?";

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700,
          color: "#fff", marginBottom: "2rem"
        }}>Meu Perfil</h1>

        <div style={{
          background: "#1a1a2e", borderRadius: 16, padding: "2rem",
          border: "1px solid rgba(201,169,98,0.1)"
        }}>
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
            <div style={{
              width: 150, height: 150, borderRadius: "50%", overflow: "hidden",
              background: "linear-gradient(135deg, #c9a962, #a68b4b)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "3px solid rgba(201,169,98,0.3)", marginBottom: "1rem",
              position: "relative"
            }}>
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{
                  fontSize: "3.5rem", fontWeight: 700, color: "#0f0f1a",
                  fontFamily: "'Playfair Display', serif"
                }}>{initial}</span>
              )}
            </div>
            <input type="file" ref={fileRef} accept="image/*" onChange={handleAvatarUpload}
              style={{ display: "none" }} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 1.25rem",
              background: "rgba(201,169,98,0.1)", border: "1px solid rgba(201,169,98,0.3)",
              borderRadius: 8, color: "#c9a962", fontSize: "0.8rem", fontWeight: 500,
              cursor: "pointer", fontFamily: "'Poppins', sans-serif", transition: "all 0.2s"
            }}>
              {uploading ? (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              )}
              {uploading ? "Enviando..." : "Alterar foto"}
            </button>
          </div>

          {/* Campos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Primeiro Nome</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
            </div>
            <div>
              <label style={labelStyle}>Sobrenome</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.currentTarget.style.borderColor = "#c9a962"}
                onBlur={(e) => e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)"} />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Email</label>
            <input value={profile?.email || user?.email || ""} readOnly
              style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
          </div>

          <button onClick={handleSave} disabled={saving} style={{
            width: "100%", padding: "0.85rem", border: "none", borderRadius: 10, cursor: "pointer",
            background: saving ? "#555" : "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
            color: "#0f0f1a", fontSize: "0.9rem", fontWeight: 700, fontFamily: "'Poppins', sans-serif",
            textTransform: "uppercase", letterSpacing: "1.5px", transition: "all 0.3s",
            boxShadow: saving ? "none" : "0 4px 15px rgba(201,169,98,0.3)",
            opacity: saving ? 0.6 : 1, marginBottom: "1.5rem"
          }}>
            {saving ? "Salvando..." : "Salvar Alteracoes"}
          </button>

          {/* Links */}
          <div style={{
            borderTop: "1px solid rgba(201,169,98,0.1)", paddingTop: "1.5rem",
            display: "flex", flexDirection: "column", gap: "0.75rem"
          }}>
            <Link to="/profile/addresses" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: 10,
              textDecoration: "none", color: "#e0e0e0", fontSize: "0.9rem",
              border: "1px solid rgba(201,169,98,0.08)", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.3)"; e.currentTarget.style.background = "rgba(201,169,98,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                Gerenciar Enderecos
              </span>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6c6c7e" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </Link>

            <Link to="/orders" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: 10,
              textDecoration: "none", color: "#e0e0e0", fontSize: "0.9rem",
              border: "1px solid rgba(201,169,98,0.08)", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.3)"; e.currentTarget.style.background = "rgba(201,169,98,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                  <path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>
                </svg>
                Meus Pedidos
              </span>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6c6c7e" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </Link>

            <Link to="/favorites" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.85rem 1rem", background: "rgba(255,255,255,0.03)", borderRadius: 10,
              textDecoration: "none", color: "#e0e0e0", fontSize: "0.9rem",
              border: "1px solid rgba(201,169,98,0.08)", transition: "all 0.2s"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.3)"; e.currentTarget.style.background = "rgba(201,169,98,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                Meus Favoritos
              </span>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6c6c7e" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
