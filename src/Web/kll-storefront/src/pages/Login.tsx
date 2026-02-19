import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { DiamondIcon, EyeIcon, EyeOffIcon } from "../components/Icons";
import toast from "react-hot-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const { fetchCart } = useCartStore();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) nav("/", { replace: true });
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      login(data.access_token);
      await fetchCart();
      toast.success("Bem-vindo de volta!", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" }
      });
      nav("/");
    } catch {
      toast.error("Credenciais invalidas", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.25rem", fontFamily: "'Poppins', sans-serif",
    fontSize: "0.9rem", color: "#fff", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,169,98,0.12)", borderRadius: 10,
    outline: "none", transition: "all 0.2s"
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem"
    }}>
      <div style={{
        background: "rgba(26,26,46,0.6)", border: "1px solid rgba(201,169,98,0.1)",
        borderRadius: 24, padding: "3rem 2.5rem", width: "100%", maxWidth: 420,
        boxShadow: "0 16px 64px rgba(0,0,0,0.4)", backdropFilter: "blur(20px)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "rgba(201,169,98,0.08)", border: "1px solid rgba(201,169,98,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <DiamondIcon size={24} color="#c9a962" />
            </div>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", marginBottom: "0.35rem" }}>
            <span style={{ color: "#fff" }}>AUREA </span>
            <span style={{ color: "#c9a962" }}>Maison</span>
          </h1>
          <p style={{ color: "#6c6c7e", fontSize: "0.85rem" }}>Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
              display: "block", marginBottom: "0.5rem", fontWeight: 500,
              color: "#8888a0", fontSize: "0.8rem", letterSpacing: "0.5px"
            }}>E-mail</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              required autoComplete="username" placeholder="seuemail@exemplo.com"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,98,0.06)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.12)"; e.currentTarget.style.boxShadow = "none"; }} />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block", marginBottom: "0.5rem", fontWeight: 500,
              color: "#8888a0", fontSize: "0.8rem", letterSpacing: "0.5px"
            }}>Senha</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
                style={{ ...inputStyle, paddingRight: "3rem" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.4)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,98,0.06)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.12)"; e.currentTarget.style.boxShadow = "none"; }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: showPassword ? "#c9a962" : "#6c6c7e", transition: "color 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "0.9rem", fontFamily: "'Poppins', sans-serif",
            fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
            color: "#0f0f1a", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
            border: "none", borderRadius: 12, cursor: loading ? "wait" : "pointer",
            boxShadow: "0 4px 20px rgba(201,169,98,0.2)", opacity: loading ? 0.7 : 1,
            transition: "all 0.3s"
          }}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "#6c6c7e" }}>
          Ainda nao tem conta?{" "}
          <Link to="/register" style={{ color: "#c9a962", fontWeight: 500, textDecoration: "none" }}>Criar conta</Link>
        </p>
      </div>
    </div>
  );
}