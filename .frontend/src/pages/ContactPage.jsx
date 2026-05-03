import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';

function ContactPage() {
  return (
    <Container className="max-w-4xl py-12 md:py-16">
      <p className="text-2xs font-semibold uppercase tracking-widest text-accent-500">Contact</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-ink-50">
        We are here to help
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-600 dark:text-ink-300">
        Reach the SportsHub team for order help, product recommendations, partnership requests, or
        general questions.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <article className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900">
          <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">Customer support</h2>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            For order or account issues, use live support chat for the fastest response.
          </p>
          <Link
            to="/support/chat"
            className="mt-4 inline-flex rounded-full bg-ink-950 px-4 py-2 text-2xs font-semibold uppercase tracking-wider text-white transition hover:bg-ink-800"
          >
            Open support chat
          </Link>
        </article>

        <article className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900">
          <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">Business inquiries</h2>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            Email our partnerships desk:
          </p>
          <a
            href="mailto:partnerships@sportshub.example"
            className="mt-3 inline-flex text-sm font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-100"
          >
            partnerships@sportshub.example
          </a>
        </article>
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900">
        <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">Operating hours</h2>
        <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
          Monday to Friday, 9:00 AM - 6:00 PM (local time)
        </p>
      </div>
    </Container>
  );
}

export default ContactPage;
