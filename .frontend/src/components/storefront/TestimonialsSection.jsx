import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import Rating from '../ui/Rating';

function truncate(text, max = 160) {
  if (!text || text.length <= max) return text || '';
  return `${text.slice(0, max).trim()}…`;
}

function TestimonialsSection({ reviews }) {
  if (!Array.isArray(reviews) || reviews.length === 0) return null;

  return (
    <section className="border-y border-ink-100 bg-white py-16 dark:border-ink-800 dark:bg-ink-950">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-2xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
            Testimonials
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
            Athletes who went all in.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="flex flex-col rounded-2xl border border-ink-100 bg-ink-50/50 p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900/40"
            >
              <Rating value={r.rating} showValue />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-700 dark:text-ink-200">
                “{truncate(r.comment)}”
              </p>
              <div className="mt-6 border-t border-ink-100 pt-4 dark:border-ink-800">
                <p className="text-2xs font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                  {r.reviewerLabel}
                </p>
                {r.productId ? (
                  <Link
                    to={`/products/${r.productId}`}
                    className="mt-1 inline-block text-sm font-semibold text-accent-600 hover:text-accent-500 dark:text-accent-400"
                  >
                    {r.productName}
                  </Link>
                ) : (
                  <p className="mt-1 text-sm font-semibold text-ink-900 dark:text-ink-100">{r.productName}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default TestimonialsSection;
