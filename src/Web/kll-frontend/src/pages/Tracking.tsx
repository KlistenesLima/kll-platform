import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiMapPin, FiCheck, FiTruck, FiPackage } from 'react-icons/fi';
import StatusBadge from '../components/StatusBadge';

const mockTracking = {
  trackingCode: 'KLL20250213A1B2C3D4',
  status: 'InTransit',
  recipientName: 'JoÃ£o Silva',
  destinationCity: 'Recife - PE',
  estimatedDelivery: '2025-02-18',
  events: [
    { description: 'Pacote em trÃ¢nsito para cidade destino', location: 'Centro de DistribuiÃ§Ã£o SP', timestamp: '2025-02-13T14:00:00Z' },
    { description: 'Pacote coletado pelo motorista', location: 'Centro de DistribuiÃ§Ã£o SP', timestamp: '2025-02-13T09:00:00Z' },
    { description: 'Pagamento confirmado - envio autorizado', location: 'KLL Logistics', timestamp: '2025-02-13T08:30:00Z' },
    { description: 'Envio criado', location: 'KLL Logistics', timestamp: '2025-02-13T08:00:00Z' },
  ]
};

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [result, setResult] = useState<typeof mockTracking | null>(searchParams.get('code') ? mockTracking : null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult(mockTracking);
      setLoading(false);
    }, 800);
  };

  const iconForIndex = (i: number, total: number) => {
    if (i === 0) return <FiTruck className="text-primary-600" size={20} />;
    if (i === total - 1) return <FiPackage className="text-gray-400" size={20} />;
    return <FiMapPin className="text-gray-400" size={20} />;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-2">Rastrear Pedido</h1>
      <p className="text-gray-500 mb-8">Insira o cÃ³digo de rastreamento para acompanhar sua entrega</p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: KLL20250213A1B2C3D4"
          className="input-field flex-1 font-mono"
        />
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          <FiSearch /> {loading ? 'Buscando...' : 'Rastrear'}
        </button>
      </form>

      {result && (
        <div className="card">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-medium">{result.trackingCode}</span>
              <StatusBadge status={result.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">DestinatÃ¡rio:</span> {result.recipientName}</div>
              <div><span className="text-gray-500">Destino:</span> {result.destinationCity}</div>
              <div><span className="text-gray-500">PrevisÃ£o:</span> {new Date(result.estimatedDelivery).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="font-semibold mb-4">HistÃ³rico</h3>
            <div className="space-y-0">
              {result.events.map((event, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 0 ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      {iconForIndex(i, result.events.length)}
                    </div>
                    {i < result.events.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1" />}
                  </div>
                  <div className="pb-6">
                    <p className="font-medium text-sm">{event.description}</p>
                    <p className="text-sm text-gray-500">{event.location}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}