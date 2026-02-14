const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Paid: 'bg-green-100 text-green-800',
  Processing: 'bg-blue-100 text-blue-800',
  Shipped: 'bg-indigo-100 text-indigo-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
  Created: 'bg-gray-100 text-gray-800',
  InTransit: 'bg-blue-100 text-blue-800',
  OutForDelivery: 'bg-orange-100 text-orange-800',
  Confirmed: 'bg-green-100 text-green-800',
  Failed: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, string> = {
  Pending: 'Pendente',
  Paid: 'Pago',
  Processing: 'Processando',
  Shipped: 'Enviado',
  Delivered: 'Entregue',
  Cancelled: 'Cancelado',
  Created: 'Criado',
  InTransit: 'Em TrÃ¢nsito',
  OutForDelivery: 'Saiu para Entrega',
  Confirmed: 'Confirmado',
  Failed: 'Falhou',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {statusLabels[status] || status}
    </span>
  );
}