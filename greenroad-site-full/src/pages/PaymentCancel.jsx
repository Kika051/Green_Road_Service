import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { XCircle } from 'lucide-react';
import { Button } from '../components';

const PaymentCancel = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white p-6">
      <div className="text-center max-w-md">
        <XCircle className="mx-auto text-red-500 mb-4" size={64} />
        <h1 className="text-3xl font-bold mb-4">{t('payment.cancel.title')}</h1>
        <p className="text-zinc-400 mb-6">{t('payment.cancel.message')}</p>
        <Link to="/account">
          <Button variant="secondary" size="lg">{t('account.title')}</Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
