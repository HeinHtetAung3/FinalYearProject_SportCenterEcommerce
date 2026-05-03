import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import { IconArrowRight } from '../ui/Icon';

function EditorialSection({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="bg-ink-50 py-16 dark:bg-ink-900/40">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-2xs font-semibold uppercase tracking-widest text-accent-600 dark:text-accent-400">
              Journal
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-4xl">
              Stories from the field.
            </h2>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.href || '#'}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card dark:border-ink-800 dark:bg-ink-950"
            >
              {item.imageUrl ? (
                <div className="aspect-[16/10] overflow-hidden bg-ink-100 dark:bg-ink-800">
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-bold text-ink-950 group-hover:text-accent-600 dark:text-ink-50 dark:group-hover:text-accent-400">
                  {item.title}
                </h3>
                {item.excerpt ? (
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-ink-600 dark:text-ink-300">{item.excerpt}</p>
                ) : null}
                <span className="mt-4 inline-flex items-center gap-1 text-2xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400">
                  Read more <IconArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default EditorialSection;
