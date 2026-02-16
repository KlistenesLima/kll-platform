import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { fetchCart } = useCartStore();
  const nav = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      login(data.access_token);
      await fetchCart();
      toast.success("Bem-vindo de volta!", { style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.3)" } });
      nav("/");
    } catch {
      toast.error("Credenciais invalidas");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "1rem 1.5rem", fontFamily: "'Poppins', sans-serif",
    fontSize: "1rem", color: "#fff", background: "#1a1a2e",
    border: "2px solid rgba(201,169,98,0.2)", borderRadius: 8,
    outline: "none", transition: "border-color 0.15s"
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{
        background: "#1a1a2e", border: "1px solid rgba(201,169,98,0.2)",
        borderRadius: 20, padding: "3rem", width: "100%", maxWidth: 440,
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", marginBottom: "0.5rem" }}>
            <span style={{ color: "#fff" }}>Luxe</span>
            <span style={{ color: "#c9a962" }}> Store</span>
          </h1>
          <p style={{ color: "#6c6c7e", fontSize: "0.9rem" }}>Entre na sua conta</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#b8b8c7", fontSize: "0.9rem" }}>Usuario</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              placeholder="seu.usuario" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c9a962")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)")} />
          </div>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#b8b8c7", fontSize: "0.9rem" }}>Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#c9a962")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(201,169,98,0.2)")} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "1rem", fontFamily: "'Poppins', sans-serif",
            fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1,
            color: "#1a1a2e", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
            border: "none", borderRadius: 8, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)", opacity: loading ? 0.6 : 1,
            transition: "all 0.3s"
          }}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p style={{ color: "#6c6c7e", fontSize: "0.8rem", marginBottom: "0.5rem" }}>Usuarios de teste:</p>
          <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4a4a5e" }}>admin / Admin123! (admin)</p>
          <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#4a4a5e" }}>cliente / Cliente123! (customer)</p>
        </div>
      </div>
    </div>
  );
}