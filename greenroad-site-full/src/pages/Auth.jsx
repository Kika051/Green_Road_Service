import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Mail, Lock, User } from 'lucide-react';
import { auth, db, googleProvider } from '../firebase/firebaseConfig';
import { useForm } from '../hooks';
import { Button, Input, Alert } from '../components';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { values, handleChange } = useForm({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Créer profil utilisateur
  const createUserProfile = async (user, displayName) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        name: displayName || user.displayName || 'Utilisateur',
        createdAt: new Date(),
        role: 'client',
      });
    }
    return userSnap.exists() ? userSnap.data() : { role: 'client' };
  };

  // Inscription
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (values.password !== values.confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, { displayName: values.name });
      await createUserProfile(userCredential.user, values.name);
      await sendEmailVerification(userCredential.user);
      setSuccess(t('auth.success.accountCreated'));
      await auth.signOut();
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? t('auth.errors.emailInUse') : t('auth.errors.genericError'));
    }

    setLoading(false);
  };

  // Connexion
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const userData = await createUserProfile(userCredential.user);

      if (!userCredential.user.emailVerified && userData.role === 'client') {
        await auth.signOut();
        setError(t('auth.errors.emailNotVerified'));
        setLoading(false);
        return;
      }

      navigate(userData.role === 'admin' || userData.role === 'driver' ? '/dashboard' : '/');
    } catch (err) {
      setError(t('auth.errors.invalidCredential'));
    }

    setLoading(false);
  };

  // Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userData = await createUserProfile(result.user);
      navigate(userData.role === 'admin' || userData.role === 'driver' ? '/dashboard' : '/');
    } catch {
      setError(t('auth.errors.googleError'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            <span className="text-green-500">Green</span>RoadServices
          </h1>
          <p className="text-zinc-400 mt-2">
            {isLogin ? t('auth.loginTitle') : t('auth.signupTitle')}
          </p>
        </div>

        {success && <Alert type="success" className="mb-4">{success}</Alert>}

        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full mb-6" loading={loading}>
            {t('auth.googleLogin')}
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-zinc-700"></div>
            <span className="text-zinc-500 text-sm">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-zinc-700"></div>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
            {!isLogin && (
              <Input
                name="name"
                label={t('auth.fullName')}
                icon={User}
                placeholder="Jean Dupont"
                value={values.name}
                onChange={handleChange}
                required
              />
            )}

            <Input
              name="email"
              type="email"
              label={t('auth.email')}
              icon={Mail}
              placeholder="votre@email.com"
              value={values.email}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              label={t('auth.password')}
              icon={Lock}
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              required
            />

            {!isLogin && (
              <Input
                name="confirmPassword"
                type="password"
                label={t('auth.confirmPassword')}
                icon={Lock}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChange={handleChange}
                required
              />
            )}

            {error && <Alert type="error">{error}</Alert>}

            <Button type="submit" className="w-full" loading={loading}>
              {isLogin ? t('auth.login') : t('auth.signup')}
            </Button>
          </form>

          <p className="text-center text-zinc-400 mt-6">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="text-green-500 ml-2 font-medium"
            >
              {isLogin ? t('auth.signupLink') : t('auth.loginLink')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
