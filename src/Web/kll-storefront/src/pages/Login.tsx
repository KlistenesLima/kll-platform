import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      toast.success("Login realizado com sucesso!");
      nav("/");
    } catch {
      toast.error("Usuario ou senha incorretos");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-kll-800">KLL Store</h1>
          <p className="text-gray-500 mt-2">Entre na sua conta</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kll-500 focus:border-transparent outline-none" placeholder="seu.usuario" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kll-500 focus:border-transparent outline-none" placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-kll-600 text-white py-3 rounded-lg font-semibold hover:bg-kll-700 transition disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Usuarios de teste:</p>
          <p className="font-mono text-xs mt-1">admin / REDACTED_SEQ_PASSWORD (admin)</p>
          <p className="font-mono text-xs">cliente / Cliente123! (customer)</p>
        </div>
      </div>
    </div>
  );
}
