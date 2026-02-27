import { useState, useEffect, useRef } from "react";
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

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score <= 1) return { level: 1, label: "Fraca", color: "#f44336" };
  if (score <= 2) return { level: 2, label: "Razoável", color: "#ff9800" };
  if (score <= 3) return { level: 3, label: "Boa", color: "#c9a962" };
  return { level: 4, label: "Forte", color: "#4caf50" };
}

export default function Register() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(1800);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { isAuthenticated } = useAuthStore();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) nav("/", { replace: true });
  }, [isAuthenticated]);

  useEffect(() => {
    if (step !== 2) return;
    const interval = setInterval(() => setTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [step]);

  const pwStrength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem", { style: toastErrorStyle });
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres", { style: toastErrorStyle });
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        fullName,
        email,
        document: cpf.replace(/\D/g, ""),
        password,
      });
      toast.success("Cadastro realizado! Verifique seu email.", { style: toastSuccessStyle, iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" } });
      setStep(2);
      setTimer(1800);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Erro ao criar conta";
      toast.error(msg, { style: toastErrorStyle });
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

  const handleConfirmEmail = async () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      toast.error("Digite o código de 6 dígitos", { style: toastErrorStyle });
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmEmail(email, code);
      toast.success("Email confirmado!", { style: toastSuccessStyle, iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" } });
      setStep(3);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Código inválido";
      toast.error(msg, { style: toastErrorStyle });
    } finally { setLoading(false); }
  };

  const handleResendCode = async () => {
    try {
      await authApi.register({ fullName, email, document: cpf.replace(/\D/g, ""), password });
      setTimer(1800);
      setOtpDigits(["", "", "", "", "", ""]);
      toast.success("Novo código enviado!", { style: toastSuccessStyle, iconTheme: { primary: "#c9a962", secondary: "#0f0f1a" } });
    } catch {
      toast.error("Erro ao reenviar código", { style: toastErrorStyle });
    }
  };

  const timerStr = `${Math.floor(timer / 60).toString().padStart(2, "0")}:${(timer % 60).toString().padStart(2, "0")}`;

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
            {step === 1 ? "Crie sua conta" : step === 2 ? "Verifique seu email" : "Cadastro recebido!"}
          </p>
          {/* Step indicator */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: "1rem" }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{
                width: 32, height: 4, borderRadius: 2,
                background: s <= step ? "#c9a962" : "rgba(201,169,98,0.15)",
                transition: "background 0.3s"
              }} />
            ))}
          </div>
        </div>

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Nome completo</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                required placeholder="Maria Silva" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>E-mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required autoComplete="email" placeholder="seuemail@exemplo.com"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>CPF</label>
              <input type="text" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))}
                required placeholder="000.000.000-00" inputMode="numeric"
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>Senha</label>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required autoComplete="new-password" placeholder="Mínimo 8 caracteres"
                  style={{ ...inputStyle, paddingRight: "3rem" }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "0.6rem", minWidth: 44, minHeight: 44, color: showPassword ? "#c9a962" : "#6c6c7e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= pwStrength.level ? pwStrength.color : "rgba(255,255,255,0.1)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.7rem", color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={labelStyle}>Confirmar senha</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required autoComplete="new-password" placeholder="Repita a senha"
                  style={{ ...inputStyle, paddingRight: "3rem" }} onFocus={onFocus} onBlur={onBlur} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "0.6rem", minWidth: 44, minHeight: 44, color: showConfirm ? "#c9a962" : "#6c6c7e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={btnStyle(loading)}>
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div>
            <p style={{ textAlign: "center", color: "#8888a0", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
              Enviamos um código de 6 dígitos para <strong style={{ color: "#c9a962" }}>{email}</strong>
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
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(201,169,98,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(201,169,98,0.08)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = digit ? "rgba(201,169,98,0.4)" : "rgba(201,169,98,0.12)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              ))}
            </div>
            <p style={{ textAlign: "center", color: "#6c6c7e", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
              Expira em <strong style={{ color: timer > 60 ? "#c9a962" : "#f44336" }}>{timerStr}</strong>
            </p>
            <button onClick={handleConfirmEmail} disabled={loading || otpDigits.join("").length !== 6} style={btnStyle(loading)}>
              {loading ? "Verificando..." : "Verificar Código"}
            </button>
            <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.8rem", color: "#6c6c7e" }}>
              Não recebeu?{" "}
              <button onClick={handleResendCode} style={{ background: "none", border: "none", color: "#c9a962", cursor: "pointer", fontWeight: 500, fontSize: "0.8rem", fontFamily: "'Poppins', sans-serif" }}>
                Reenviar código
              </button>
            </p>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 style={{ color: "#fff", fontSize: "1.25rem", marginBottom: "0.75rem", fontFamily: "'Playfair Display', serif" }}>
              Cadastro recebido!
            </h2>
            <p style={{ color: "#8888a0", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              Seu email foi verificado com sucesso. Aguarde a aprovação do administrador para acessar sua conta.
            </p>
            <button onClick={() => nav("/login")} style={btnStyle(false)}>
              Voltar para Login
            </button>
          </div>
        )}

        {step === 1 && (
          <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "0.8rem", color: "#6c6c7e" }}>
            Já tem uma conta?{" "}
            <Link to="/login" style={{ color: "#c9a962", fontWeight: 500, textDecoration: "none" }}>Entrar</Link>
          </p>
        )}
      </div>
    </div>
  );
}

const btnStyle = (loading: boolean): React.CSSProperties => ({
  width: "100%", padding: "0.9rem", fontFamily: "'Poppins', sans-serif",
  fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px",
  color: "#0f0f1a", background: "linear-gradient(135deg, #c9a962 0%, #a68b4b 100%)",
  border: "none", borderRadius: 12, cursor: loading ? "wait" : "pointer",
  boxShadow: "0 4px 20px rgba(201,169,98,0.2)", opacity: loading ? 0.7 : 1,
  transition: "all 0.3s"
});

const toastErrorStyle = { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(244,67,54,0.3)" };
const toastSuccessStyle = { background: "#1a1a2e", color: "#fff", border: "1px solid rgba(201,169,98,0.2)" };
