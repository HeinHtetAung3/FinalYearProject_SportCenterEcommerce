import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';

function PrivacyPage() {
  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <p className="text-2xs font-semibold uppercase tracking-widest text-accent-500">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950">
        Privacy policy
      </h1>
      <p className="mt-4 text-sm text-ink-500">Last updated: April 2026</p>

      <div className="prose prose-sm mt-10 max-w-none space-y-6 text-ink-700">
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">1. What we collect</h2>
          <p className="mt-2 leading-relaxed">
            We collect information you provide when you register, place an order, or update your
            profile — such as name, email, phone, shipping address, and marketing preferences.
            We also collect technical data (device, browser, approximate region) to secure the site
            and improve performance.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">2. How we use data</h2>
          <p className="mt-2 leading-relaxed">
            Data is used to fulfil orders, authenticate accounts, send transactional messages, and —
            if you opt in — marketing. We use cookies and local storage for sessions, cart, and
            preferences such as recently viewed products.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">3. Sharing</h2>
          <p className="mt-2 leading-relaxed">
            We share data with service providers who help us run the store (hosting, email, payment
            when enabled) under strict agreements. We do not sell your personal information.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">4. Your choices</h2>
          <p className="mt-2 leading-relaxed">
            You can update profile data, marketing preferences, and saved addresses in your account.
            Where applicable law applies, you may request access, correction, or deletion of personal
            data by contacting support.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">5. Security</h2>
          <p className="mt-2 leading-relaxed">
            We use industry-standard measures to protect data in transit and at rest. No method of
            transmission over the internet is completely secure; please use a strong, unique password.
          </p>
        </section>
      </div>

      <p className="mt-12 text-sm text-ink-500">
        <Link to="/" className="font-semibold text-ink-900 hover:text-accent-600">
          Back to home
        </Link>
      </p>
    </Container>
  );
}

export default PrivacyPage;
