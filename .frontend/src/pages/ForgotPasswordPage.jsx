import { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Logo from '../components/layout/Logo';
import { validateEmail } from '../utils/authValidators';
import { classNames } from '../utils/format';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 400);
  };

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-card sm:p-10">
        <div className="mb-8">
          <Logo />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-950 sm:text-3xl">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Enter the email for your account. If it exists, we will send a reset link (demo: no email is
          sent).
        </p>

        {submitted ? (
          <div className="mt-8 space-y-6">
            <p
              className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
              role="status"
            >
              If an account exists for <span className="font-semibold">{email.trim()}</span>, you will
              receive password reset instructions shortly.
            </p>
            <Link
              to="/login"
              className="block text-center text-sm font-semibold text-ink-900 underline underline-offset-2"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="label-base" id="forgot-email-label">
                Email
              </span>
              <input
                className={classNames('input-base', error ? 'border-rose-300 ring-1 ring-rose-200' : '')}
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                onBlur={() => {
                  if (email.trim()) {
                    const err = validateEmail(email);
                    setError(err || '');
                  }
                }}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'forgot-email-error' : undefined}
                aria-labelledby="forgot-email-label"
              />
              {error ? (
                <p id="forgot-email-error" className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}
            </label>
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={busy}>
              {busy ? 'Sending…' : 'Send reset link'}
            </Button>
            <p className="text-center text-sm text-ink-500">
              <Link to="/login" className="font-semibold text-ink-900 underline underline-offset-2">
                Cancel
              </Link>
            </p>
          </form>
        )}
      </div>
    </Container>
  );
}

export default ForgotPasswordPage;
