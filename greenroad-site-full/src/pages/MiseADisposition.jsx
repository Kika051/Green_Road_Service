import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Calendar, Clock, Timer, User, Mail, Phone, CheckCircle, Car } from 'lucide-react';
import { useAuth, useFetch, useForm, useGoogleAutocomplete } from '../hooks';
import { Button, Input, Alert } from '../components';
import { API_URL } from '../utils/constants';

const MiseADisposition = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { postData, loading } = useFetch();
  const [success, setSuccess] = useState(false);

  const { values, handleChange, setValue, reset } = useForm({
    pickupAddress: '',
    date: '',
    time: '',
    duration: '',
    name: '',
    email: user?.email || '',
    phone: '',
    details: '',
  });

  const { inputRef: pickupRef } = useGoogleAutocomplete((addr) => setValue('pickupAddress', addr));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await postData(`${API_URL}/requestAvailability`, values);

    if (result.success) {
      setSuccess(true);
      reset();
    } else {
      alert(result.error || 'Erreur lors de l\'envoi');
    }
  };

  const durations = [
    { value: '2h', label: '2 heures' },
    { value: '4h', label: '4 heures (demi-journée)' },
    { value: '8h', label: '8 heures (journée)' },
    { value: '10h', label: '10 heures' },
    { value: 'custom', label: 'Sur mesure' },
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="bg-green-900/30 border border-green-700 rounded-xl p-8 text-center max-w-md">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
          <h2 className="text-xl font-semibold text-white mb-2">{t('availability.success.title')}</h2>
          <p className="text-zinc-400 mb-6">{t('availability.success.message')}</p>
          <Button onClick={() => setSuccess(false)}>{t('availability.success.newRequest')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 text-white min-h-screen px-4 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Car size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            {t('availability.title')} <span className="text-green-500">{t('availability.titleHighlight')}</span>
          </h1>
          <p className="text-zinc-400">{t('availability.subtitle')}</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 space-y-5">
          {/* Adresse */}
          <Input
            ref={pickupRef}
            label={t('availability.form.pickupAddress')}
            icon={MapPin}
            placeholder={t('availability.form.pickupPlaceholder')}
            value={values.pickupAddress}
            onChange={(e) => setValue('pickupAddress', e.target.value)}
            required
          />

          {/* Date et Heure */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              name="date"
              label={t('availability.form.date')}
              icon={Calendar}
              value={values.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <Input
              type="time"
              name="time"
              label={t('availability.form.time')}
              icon={Clock}
              value={values.time}
              onChange={handleChange}
              required
            />
          </div>

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              <Timer className="inline mr-2" size={16} />
              {t('availability.form.duration')}
            </label>
            <select
              name="duration"
              value={values.duration}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="">{t('availability.form.durationPlaceholder')}</option>
              {durations.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Coordonnées */}
          <div className="border-t border-zinc-700 pt-5">
            <h3 className="font-medium mb-4 text-zinc-300">{t('availability.form.contactInfo')}</h3>

            <div className="space-y-4">
              <Input
                name="name"
                label={t('availability.form.fullName')}
                icon={User}
                placeholder={t('availability.form.namePlaceholder')}
                value={values.name}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="email"
                  name="email"
                  label={t('availability.form.email')}
                  icon={Mail}
                  placeholder={t('availability.form.emailPlaceholder')}
                  value={values.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="tel"
                  name="phone"
                  label={t('availability.form.phone')}
                  icon={Phone}
                  placeholder={t('availability.form.phonePlaceholder')}
                  value={values.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Détails */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              {t('availability.form.details')}
            </label>
            <textarea
              name="details"
              placeholder={t('availability.form.detailsPlaceholder')}
              value={values.details}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:border-green-500 focus:outline-none resize-none"
            />
          </div>

          <Button type="submit" loading={loading} className="w-full" size="lg">
            {t('availability.form.submit')}
          </Button>
        </form>

        {/* Tarifs */}
        <div className="mt-10 bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          <h3 className="font-semibold mb-4">💡 {t('availability.pricing.title')}</h3>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>• {t('availability.pricing.hourly')}</li>
            <li>• {t('availability.pricing.halfDay')}</li>
            <li>• {t('availability.pricing.fullDay')}</li>
            <li>• {t('availability.pricing.mileage')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MiseADisposition;
