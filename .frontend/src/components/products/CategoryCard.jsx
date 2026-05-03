import { Link } from 'react-router-dom';
import { IconArrowRight } from '../ui/Icon';
import { classNames } from '../../utils/format';

function CategoryCard({ category, large = false }) {
  return (
    <Link
      to={category.to}
      className={classNames(
        'group relative block overflow-hidden rounded-3xl bg-ink-950 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow',
        large ? 'aspect-[4/5] md:aspect-auto md:h-full' : 'aspect-[3/4]'
      )}
    >
      <img
        src={category.image}
        alt={category.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 ease-out group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-ink-950/80 via-ink-950/30 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-6 text-white sm:p-8">
        <span className="text-2xs font-semibold uppercase tracking-widest text-volt-300">
          {category.eyebrow}
        </span>
        <h3 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {category.title}
        </h3>
        <p className="mt-2 text-sm text-white/80">{category.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-2xs font-bold uppercase tracking-wider text-white">
          Shop now <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default CategoryCard;
