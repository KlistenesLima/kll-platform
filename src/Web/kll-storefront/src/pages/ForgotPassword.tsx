import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api";
import { DiamondIcon, EyeIcon, EyeOffIcon } from "../components/Icons";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const nav = useNavigate();

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1.25rem", fontFamily: "'Poppins', sans-serif",
    fontSize: "0.9rem", color: "#fff", background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(201,169,98,0.12)", borderRadius: 10,
    outline: "none", transition: "all 0.2s", boxSizing: "border-box"
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("Código enviado para seu email!", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" }
      });
      setStep(2);
    } catch {
      toast.error("Erro ao enviar código", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
    } finally { setLoading(false); }
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[idx] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Digite o código de 6 dígitos", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      toast.success("Senha redefinida com sucesso!", {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)" },
        iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" }
      });
      setStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao redefinir senha";
      toast.error(msg, {
        style: { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" }
      });
    } finally { setLoading(false); }
  };

  const btnStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem", fontFamily: "'Poppins', sans-serif",
    fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
    color: "#0f0f1a", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
    border: "none", borderRadius: 12, cursor: loading ? "wait" : "pointer",
    boxShadow: "0 4px 20px rgba(201,169,98,0.2)", opacity: loading ? 0.7 : 1,
    transition: "all 0.3s"
  };

  return (
    <div style={{ minHeight: "calc(100vh - 72px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{
        background: "rgba(26,26,46,0.6)", border: "1px solid rgba(201,169,98,0.1)",
        borderRadius: 24, padding: "clamp(1.25rem, 5vw, 2.5rem)", width: "100%", maxWidth: 480,
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
          <p style={{ color: "#6c6c7e", fontSize: "0.85rem" }}>
            {step === 1 ? "Recuperação de senha" : step === 2 ? "Nova senha" : "Senha redefinida!"}
          </p>
        </div>

        {/* STEP 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <p style={{ color: "#8888a0", fontSize: "0.85rem", marginBottom: "1.5rem", textAlign: "center" }}>
              Informe seu email para receber o código de recuperação.
            </p>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="seuemail@exemplo.com" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP + New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <p style={{ textAlign: "center", color: "#8888a0", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Código enviado para <strong style={{ color: "#c9a962" }}>{email}</strong>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(4px, 1.5vw, 8px)", marginBottom: "1.5rem" }}>
              {otpDigits.map((digit, idx) => (
                <input key={idx} ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  style={{
                    width: "clamp(38px, 11vw, 48px)", height: "clamp(48px, 13vw, 56px)", textAlign: "center", fontSize: "clamp(1.1rem, 4vw, 1.5rem)", fontWeight: 700,
                    color: "#c9a962", background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${digit ? "rgba(201,169,98,0.4)" : "rgba(201,169,98,0.12)"}`,
                    borderRadius: 10, outline: "none", fontFamily: "'Poppins', sans-serif"
                  }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.5)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = digit ? "rgba(201,169,98,0.4)" : "rgba(201,169,98,0.12)"; }}
                />
              ))}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Nova senha</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required placeholder="Mínimo 8 caracteres"
                  style={{ ...inputStyle, paddingRight: "3rem" }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "0.6rem", minWidth: 44, minHeight: 44, color: showPassword ? "#c9a962" : "#6c6c7e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Confirmar nova senha</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                required placeholder="Repita a nova senha" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "1rem" }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.75rem", fontFamily: "'Playfair Display', serif" }}>
              Senha redefinida!
            </h2>
            <p style={{ color: "#8888a0", fontSize: "0.9rem", marginBottom: "2rem" }}>
              Sua senha foi alterada com sucesso. Faça login com a nova senha.
            </p>
            <button onClick={() => nav("/login")} style={btnStyle}>
              Ir para Login
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "#6c6c7e" }}>
          <Link to="/login" style={{ color: "#c9a962", fontWeight: 500, textDecoration: "none" }}>Voltar para Login</Link>
        </p>
      </div>
    </div>
  );
}
