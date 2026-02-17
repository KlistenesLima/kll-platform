import { useState } from "react";
import { shippingApi } from "../services/api";

interface ShippingOption {
  name: string;
  price: number;
  deliveryDays: string;
}

export default function ShippingCalculator({ cartTotal = 0 }: { cartTotal?: number }) {
  const [cep, setCep] = useState("");
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  };

  const handleCalculate = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) { setError("CEP deve ter 8 dígitos"); return; }
    setLoading(true);
    setError("");
    setOptions([]);
    try {
      const result = await shippingApi.calculate(digits, cartTotal);
      setOptions(result.options);
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao calcular frete");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={{
      padding: "1.25rem", background: "rgba(201,169,98,0.05)",
      border: "1px solid rgba(201,169,98,0.15)", borderRadius: 12, marginTop: "1rem"
    }}>
      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c9a962", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
        Calcular Frete
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          type="text"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          style={{
            flex: 1, padding: "0.7rem 1rem", background: "#252542", color: "#fff",
            border: "1px solid rgba(201,169,98,0.2)", borderRadius: 8,
            fontFamily: "'Poppins', sans-serif", fontSize: "0.9rem", outline: "none"
          }}
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          style={{
            padding: "0.7rem 1.25rem", background: "rgba(201,169,98,0.2)",
            color: "#c9a962", border: "1px solid rgba(201,169,98,0.3)", borderRadius: 8,
            fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "0.85rem",
            cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap"
          }}
        >
          {loading ? "..." : "Calcular"}
        </button>
      </div>

      {error && <p style={{ color: "#f44336", fontSize: "0.8rem", marginTop: "0.5rem" }}>{error}</p>}

      {options.length > 0 && (
        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {options.map((opt, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "0.6rem 0.75rem", background: "#1a1a2e", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)"
            }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "#fff", fontWeight: 500 }}>{opt.name}</p>
                <p style={{ fontSize: "0.75rem", color: "#6c6c7e" }}>{opt.deliveryDays}</p>
              </div>
              <span style={{
                fontWeight: 700, fontSize: "0.9rem",
                color: opt.price === 0 ? "#4caf50" : "#c9a962"
              }}>
                {opt.price === 0 ? "Grátis" : fmt(opt.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
