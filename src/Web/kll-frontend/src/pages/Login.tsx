import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    login(name, email);
    toast.success(`Bem-vindo, ${name}!`);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-2xl font-bold mt-4">Entrar na KLL Store</h1>
          <p className="text-gray-500 mt-1">Simule um login para testar o fluxo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="JoÃ£o Silva" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" placeholder="joao@email.com" required />
          </div>
          <button type="submit" className="btn-primary w-full">Entrar</button>
        </form>
      </div>
    </div>
  );
}