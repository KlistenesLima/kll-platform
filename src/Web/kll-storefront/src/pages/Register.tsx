import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { DiamondIcon, EyeIcon, EyeOffIcon } from "../components/Icons";
import toast from "react-hot-toast";

function formatCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) nav("/", { replace: true });
  }, [isAuthenticated]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas nao coincidem", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter no minimo 8 caracteres", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
      return;
    }
    if (!acceptTerms) {
      toast.error("Aceite os termos de uso para continuar", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
      return;
    }

    setLoading(true);
    try {
      await authApi.register({
        email,
        password,
        firstName,
        lastName,
        cpf: cpf.replace(/\D/g, "") || undefined,
      });
      toast.success("Conta criada com sucesso!", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" }
      });
      nav("/login");
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erro ao criar conta";
      toast.error(msg, {
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

  const labelStyle: React.CSSProperties = {
    display: "block", marginBottom: "0.5rem", fontWeight: 500,
    color: "#8888a0", fontSize: "0.8rem", letterSpacing: "0.5px"
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(201,169,98,0.4)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,98,0.06)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "rgba(201,169,98,0.12)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem"
    }}>
      <div style={{
        background: "rgba(26,26,46,0.6)", border: "1px solid rgba(201,169,98,0.1)",
        borderRadius: 24, padding: "2.5rem 2.5rem", width: "100%", maxWidth: 480,
        boxShadow: "0 16px 64px rgba(0,0,0,0.4)", backdropFilter: "blur(20px)"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
          <p style={{ color: "#6c6c7e", fontSize: "0.85rem" }}>Crie sua conta</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* Nome / Sobrenome */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <div>
              <label style={labelStyle}>Nome</label>
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                required placeholder="Maria" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div>
              <label style={labelStyle}>Sobrenome</label>
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                required placeholder="Silva" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email" placeholder="seuemail@exemplo.com"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* CPF */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>CPF</label>
            <input type="text" value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              required placeholder="000.000.000-00" inputMode="numeric"
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>

          {/* Senha */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>Senha</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                required autoComplete="new-password" placeholder="Minimo 8 caracteres"
                style={{ ...inputStyle, paddingRight: "3rem" }} onFocus={onFocus} onBlur={onBlur} />
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

          {/* Confirmar Senha */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={labelStyle}>Confirmar senha</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required autoComplete="new-password" placeholder="Repita a senha"
                style={{ ...inputStyle, paddingRight: "3rem" }} onFocus={onFocus} onBlur={onBlur} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 4,
                  color: showConfirm ? "#c9a962" : "#6c6c7e", transition: "color 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>
          </div>

          {/* Termos */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10, marginBottom: "1.5rem",
            cursor: "pointer", fontSize: "0.8rem", color: "#8888a0", lineHeight: 1.5
          }}>
            <input type="checkbox" checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{
                width: 18, height: 18, marginTop: 1, accentColor: "#c9a962",
                cursor: "pointer", flexShrink: 0
              }} />
            <span>
              Li e aceito os{" "}
              <span style={{ color: "#c9a962", fontWeight: 500 }}>termos de uso</span>
              {" "}e a{" "}
              <span style={{ color: "#c9a962", fontWeight: 500 }}>politica de privacidade</span>
            </span>
          </label>

          {/* Botão */}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "0.9rem", fontFamily: "'Poppins', sans-serif",
            fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
            color: "#0f0f1a", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
            border: "none", borderRadius: 12, cursor: loading ? "wait" : "pointer",
            boxShadow: "0 4px 20px rgba(201,169,98,0.2)", opacity: loading ? 0.7 : 1,
            transition: "all 0.3s"
          }}>{loading ? "Criando conta..." : "Criar Conta"}</button>
        </form>

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "#6c6c7e" }}>
          Ja tem uma conta?{" "}
          <Link to="/login" style={{ color: "#c9a962", fontWeight: 500, textDecoration: "none" }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
