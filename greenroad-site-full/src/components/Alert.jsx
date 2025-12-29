import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Alert réutilisable
 */
const Alert = ({ type = 'info', children, className = '' }) => {
  const config = {
    success: {
      bg: 'bg-green-900/30 border-green-700',
      text: 'text-green-400',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-900/30 border-red-700',
      text: 'text-red-400',
      icon: XCircle,
    },
    warning: {
      bg: 'bg-yellow-900/30 border-yellow-700',
      text: 'text-yellow-400',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-900/30 border-blue-700',
      text: 'text-blue-400',
      icon: Info,
    },
  };

  const { bg, text, icon: Icon } = config[type];

  return (
    <div className={`${bg} border rounded-lg p-3 flex items-start gap-2 ${className}`}>
      <Icon className={`${text} flex-shrink-0 mt-0.5`} size={18} />
      <p className={`${text} text-sm`}>{children}</p>
    </div>
  );
};

export default Alert;
