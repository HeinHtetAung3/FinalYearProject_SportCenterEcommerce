import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';

function TermsPage() {
  return (
    <Container className="max-w-3xl py-12 md:py-16">
      <p className="text-2xs font-semibold uppercase tracking-widest text-accent-500">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950">
        Terms of service
      </h1>
      <p className="mt-4 text-sm text-ink-500">Last updated: April 2026</p>

      <div className="prose prose-sm mt-10 max-w-none space-y-6 text-ink-700">
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">1. Using SportsHub</h2>
          <p className="mt-2 leading-relaxed">
            By accessing this website you agree to these terms. We provide an online storefront for
            sports and lifestyle products. Product information, pricing, and availability may change
            without notice.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">2. Orders &amp; payment</h2>
          <p className="mt-2 leading-relaxed">
            When you place an order, you offer to purchase the items in your cart subject to
            acceptance and shipment. Payment methods shown at checkout are for demonstration unless
            a live payment provider is configured. You are responsible for providing accurate shipping
            and contact details.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">3. Returns</h2>
          <p className="mt-2 leading-relaxed">
            Return windows and restocking rules follow the policy stated at checkout and on your
            order confirmation. Contact support through your profile or orders page for return
            authorisations.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">4. Limitation of liability</h2>
          <p className="mt-2 leading-relaxed">
            To the extent permitted by law, SportsHub and its operators are not liable for indirect
            or consequential damages arising from use of the site or products. Nothing in these terms
            limits liability that cannot be limited by applicable law.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl font-bold text-ink-950">5. Contact</h2>
          <p className="mt-2 leading-relaxed">
            Questions about these terms? Use the help links in the site footer or reach your account
            team through the email on file in your profile.
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

export default TermsPage;
