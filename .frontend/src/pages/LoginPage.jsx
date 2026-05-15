import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import { classNames } from '../utils/format';
import {
  validateEmail,
  validateLoginPassword,
  validateRegisterFullName,
  validateRegisterPassword,
  validateConfirmPassword,
  getPasswordStrength,
  strengthBarCount,
} from '../utils/authValidators';
import { getSafeReturnPath } from '../utils/navigationSecurity';
import { getStoredAuth } from '../utils/storage';
import { buildCategoryImageUrl } from '../utils/productImages';

const HERO_IMAGE = buildCategoryImageUrl('running', 4);

const emptyErrors = () => ({
  email: '',
  password: '',
  fullName: '',
  confirmPassword: '',
});

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState(emptyErrors);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFieldErrors(emptyErrors());
    setError('');
  }, [mode]);

  const setField =
    (key) =>
    (eventOrValue) => {
      const value = typeof eventOrValue === 'string' ? eventOrValue : eventOrValue.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
      setError('');
    };

  const validateForm = () => {
    const next = emptyErrors();
    next.email = validateEmail(form.email) || '';
    if (mode === 'login') {
      next.password = validateLoginPassword(form.password) || '';
    } else {
      next.fullName = validateRegisterFullName(form.fullName) || '';
      next.password = validateRegisterPassword(form.password) || '';
      next.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword) || '';
    }
    setFieldErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (!validateForm()) return;
    setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email: form.email.trim(), password: form.password }
          : {
              email: form.email.trim(),
              password: form.password,
              fullName: form.fullName.trim(),
            };
      const { data } = await apiClient.post(endpoint, payload);
      setSession({
        ...(getStoredAuth() || {}),
        ...data,
        email: form.email.trim()
      });
      const next = getSafeReturnPath(location.state?.from);
      const role = String(data?.role || '').toUpperCase();
      const defaultPath = role === 'ADMIN' ? '/admin' : '/';
      navigate(next || defaultPath, { replace: true });
    } catch (apiError) {
      const msg =
        apiError && typeof apiError.message === 'string' && apiError.message.trim()
          ? apiError.message
          : 'Authentication failed.';
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const strength = getPasswordStrength(form.password);
  const barsFilled = strengthBarCount(strength.met);
  const isLogin = mode === 'login';

  const passwordHintId = 'register-password-hint';

  return (
    <Container className="py-6">
      <div className="grid overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <img src={HERO_IMAGE} alt="Athlete" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/80 via-ink-950/40 to-transparent" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <Logo tone="light" />
            <div>
              <p className="text-2xs font-semibold uppercase tracking-widest text-volt-300">
                Member benefits
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tightest">
                Train smarter. <br /> Save more.
              </h2>
              <ul className="mt-6 space-y-2 text-sm text-white/80">
                <li>· Free express shipping</li>
                <li>· Early access to new drops</li>
                <li>· Personalised recommendations</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-6 lg:hidden">
            <Logo />
          </div>

          <div
            className="mb-8 inline-flex rounded-full bg-ink-50 p-1 text-2xs font-bold uppercase tracking-wider text-ink-700"
            role="tablist"
            aria-label="Sign in or create account"
          >
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              id="tab-login"
              onClick={() => setMode('login')}
              className={classNames(
                'rounded-full px-4 py-2 transition',
                isLogin ? 'bg-ink-950 text-white shadow-sm' : 'hover:text-ink-950'
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              id="tab-register"
              onClick={() => setMode('register')}
              className={classNames(
                'rounded-full px-4 py-2 transition',
                !isLogin ? 'bg-ink-950 text-white shadow-sm' : 'hover:text-ink-950'
              )}
            >
              Create account
            </button>
          </div>

          <h1 className="font-display text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
            {isLogin ? 'Welcome back.' : 'Join SportsHub.'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {isLogin
              ? 'Sign in to track orders, saved items, and member-only deals.'
              : 'Create your free account and unlock express shipping, early drops, and personalised picks.'}
          </p>

          {!isLogin ? (
            <ul className="mt-4 list-inside list-disc space-y-1 text-xs text-ink-500">
              <li>One account for checkout, orders, and wishlists</li>
              <li>Save addresses and payment details securely</li>
              <li>Choose a strong password (8+ characters)</li>
            </ul>
          ) : null}

          <form
            className="mt-8 space-y-4"
            onSubmit={handleSubmit}
            noValidate
            aria-labelledby={isLogin ? 'tab-login' : 'tab-register'}
          >
            {!isLogin ? (
              <label className="block">
                <span className="label-base" id="label-fullname">
                  Full name
                </span>
                <input
                  className={classNames(
                    'input-base',
                    fieldErrors.fullName ? 'border-rose-300 ring-1 ring-rose-200' : ''
                  )}
                  autoComplete="name"
                  value={form.fullName}
                  onChange={setField('fullName')}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      fullName: validateRegisterFullName(form.fullName) || '',
                    }))
                  }
                  aria-invalid={fieldErrors.fullName ? 'true' : 'false'}
                  aria-describedby={fieldErrors.fullName ? 'err-fullname' : undefined}
                  aria-labelledby="label-fullname"
                />
                {fieldErrors.fullName ? (
                  <p id="err-fullname" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                    {fieldErrors.fullName}
                  </p>
                ) : null}
              </label>
            ) : null}

            <label className="block">
              <span className="label-base" id="label-email">
                Email
              </span>
              <input
                className={classNames(
                  'input-base',
                  fieldErrors.email ? 'border-rose-300 ring-1 ring-rose-200' : ''
                )}
                type="email"
                autoComplete={isLogin ? 'email' : 'username'}
                autoCapitalize="none"
                inputMode="email"
                value={form.email}
                onChange={setField('email')}
                onBlur={() =>
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: validateEmail(form.email) || '',
                  }))
                }
                aria-invalid={fieldErrors.email ? 'true' : 'false'}
                aria-describedby={fieldErrors.email ? 'err-email' : undefined}
                aria-labelledby="label-email"
              />
              {fieldErrors.email ? (
                <p id="err-email" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
            </label>

            <label className="block">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="label-base mb-0" id="label-password">
                  Password
                </span>
                {isLogin ? (
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold uppercase tracking-wider text-ink-600 underline underline-offset-2 hover:text-ink-950"
                  >
                    Forgot password?
                  </Link>
                ) : null}
              </div>
              <input
                className={classNames(
                  'input-base',
                  fieldErrors.password ? 'border-rose-300 ring-1 ring-rose-200' : ''
                )}
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={setField('password')}
                onBlur={() =>
                  setFieldErrors((prev) => ({
                    ...prev,
                    password: isLogin
                      ? validateLoginPassword(form.password) || ''
                      : validateRegisterPassword(form.password) || '',
                    ...(isLogin ? {} : { confirmPassword: validateConfirmPassword(form.password, form.confirmPassword) || '' }),
                  }))
                }
                aria-invalid={fieldErrors.password ? 'true' : 'false'}
                aria-describedby={
                  [
                    !isLogin ? passwordHintId : '',
                    fieldErrors.password ? 'err-password' : '',
                  ]
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                aria-labelledby="label-password"
              />
              {!isLogin && form.password ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1" aria-hidden="true">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={classNames(
                          'h-1.5 flex-1 rounded-full transition-colors',
                          i < barsFilled ? strength.barClass : 'bg-ink-100'
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-ink-600">
                    Password strength{strength.label ? `: ${strength.label}` : ''}
                  </p>
                </div>
              ) : null}
              {!isLogin ? (
                <p id={passwordHintId} className="mt-1.5 text-xs text-ink-500">
                  Use at least 8 characters. Mix uppercase, lowercase, numbers, and symbols for a stronger
                  password.
                </p>
              ) : null}
              {fieldErrors.password ? (
                <p id="err-password" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                  {fieldErrors.password}
                </p>
              ) : null}
            </label>

            {!isLogin ? (
              <label className="block">
                <span className="label-base" id="label-confirm">
                  Confirm password
                </span>
                <input
                  className={classNames(
                    'input-base',
                    fieldErrors.confirmPassword ? 'border-rose-300 ring-1 ring-rose-200' : ''
                  )}
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={setField('confirmPassword')}
                  onBlur={() =>
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword) || '',
                    }))
                  }
                  aria-invalid={fieldErrors.confirmPassword ? 'true' : 'false'}
                  aria-describedby={fieldErrors.confirmPassword ? 'err-confirm' : undefined}
                  aria-labelledby="label-confirm"
                />
                {fieldErrors.confirmPassword ? (
                  <p id="err-confirm" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                    {fieldErrors.confirmPassword}
                  </p>
                ) : null}
              </label>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
              {busy ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-500">
            By continuing you agree to our{' '}
            <Link to="/" className="font-semibold text-ink-900 underline">
              Terms
            </Link>{' '}
            and{' '}
            <Link to="/" className="font-semibold text-ink-900 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </Container>
  );
}

export default LoginPage;
