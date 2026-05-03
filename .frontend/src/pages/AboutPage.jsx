import { Link } from 'react-router-dom';
import Container from '../components/ui/Container';

function AboutPage() {
  return (
    <Container className="max-w-4xl py-12 md:py-16">
      <p className="text-2xs font-semibold uppercase tracking-widest text-accent-500">About SportsHub</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-ink-50">
        Built for athletes, designed for everyday movement
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink-600 dark:text-ink-300">
        SportsHub curates premium performance gear and lifestyle essentials for runners, teams, and
        active families. We focus on trusted brands, practical performance, and a smooth shopping
        experience from browse to delivery.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        <article className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft dark:border-ink-800 dark:bg-ink-900">
          <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">Performance first</h2>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            Products are selected around comfort, durability, and sport-specific function.
          </p>
        </article>
        <article className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft dark:border-ink-800 dark:bg-ink-900">
          <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">Curated collections</h2>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            Clear collections for Men, Women, Kids, and key sports to help you find gear faster.
          </p>
        </article>
        <article className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft dark:border-ink-800 dark:bg-ink-900">
          <h2 className="text-sm font-semibold text-ink-950 dark:text-ink-50">Reliable support</h2>
          <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">
            Help is available through in-app chat and order tracking whenever you need it.
          </p>
        </article>
      </div>

      <p className="mt-12 text-sm text-ink-500 dark:text-ink-300">
        Ready to explore?
        {' '}
        <Link to="/products" className="font-semibold text-ink-900 hover:text-accent-600 dark:text-ink-100">
          Shop all products
        </Link>
      </p>
    </Container>
  );
}

export default AboutPage;
