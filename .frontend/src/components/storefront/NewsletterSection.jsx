import { useState } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import { useUI } from '../../context/UIContext';
import { subscribeNewsletter } from '../../services/storefrontService';
import { buildCategoryImageUrl } from '../../utils/productImages';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

/**
 * @param {{ showMemberPitch?: boolean }} props
 */
function NewsletterSection({ showMemberPitch = false }) {
  const { showToast } = useUI();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!isValidEmail(trimmed)) {
      showToast('Enter a valid email address.', { variant: 'error' });
      return;
    }
    setBusy(true);
    try {
      const res = await subscribeNewsletter(trimmed);
      if (res.success) {
        showToast(res.message || 'You are subscribed.', { variant: 'success' });
        setEmail('');
      } else {
        showToast(res.message || 'Could not subscribe.', { variant: 'error' });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Could not subscribe. Try again later.';
      showToast(typeof msg === 'string' ? msg : 'Could not subscribe.', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  }

  const newsletterCard = (
    <div
      className={`rounded-3xl border border-ink-100 bg-gradient-to-br from-ink-950 to-ink-900 px-8 py-12 text-white shadow-card dark:border-ink-800 ${showMemberPitch ? 'h-full text-left' : 'mx-auto max-w-2xl text-center'}`}
    >
      <span className="text-2xs font-semibold uppercase tracking-widest text-volt-300">Stay in the loop</span>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Drops, deals & gear picks.</h2>
      <p className="mt-4 text-white/75">
        Get launch and clearance updates. For saved carts, order history and perks, create a free account.
      </p>
      <form
        onSubmit={handleSubmit}
        className={`mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch ${showMemberPitch ? 'max-w-lg' : 'mx-auto max-w-md'}`}
      >
        <label className="sr-only" htmlFor="newsletter-email">
          Email
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
          className="input-base flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:border-volt-400"
        />
        <Button type="submit" variant="accent" disabled={busy} className="sm:w-auto">
          {busy ? 'Joining…' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );

  if (!showMemberPitch) {
    return (
      <section className="py-16">
        <Container>{newsletterCard}</Container>
      </section>
    );
  }

  const memberImage = buildCategoryImageUrl('fitness', 3);

  return (
    <section className="py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
          {newsletterCard}
          <div className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl border border-ink-100 bg-ink-950 text-white shadow-card dark:border-ink-800 lg:min-h-0">
            <img
              src={memberImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/20" aria-hidden />
            <div className="relative p-8 sm:p-10">
              <span className="text-2xs font-semibold uppercase tracking-widest text-volt-300">SportsHub</span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Member account</h2>
              <p className="mt-3 max-w-md text-sm text-white/80">
                Track orders, save addresses, and get to checkout faster next time.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button to="/login" variant="accent" size="lg">
                  Create account
                </Button>
                <Button
                  to="/products"
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white hover:text-ink-950"
                >
                  Continue shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default NewsletterSection;
