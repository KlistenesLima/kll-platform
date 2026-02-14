import { FiInbox } from 'react-icons/fi';

interface Props { title: string; description: string; action?: React.ReactNode; }

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="text-center py-16">
      <FiInbox className="mx-auto text-gray-300" size={64} />
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}