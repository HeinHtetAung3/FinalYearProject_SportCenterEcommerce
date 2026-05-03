import { Link } from 'react-router-dom';
import Container from '../ui/Container';
import Logo from './Logo';

const SHOP_LINKS = [
  { label: 'All Products', to: '/products' },
  { label: 'Running', to: '/products?category=running' },
  { label: 'Football', to: '/products?category=football' },
  { label: 'Fitness', to: '/products?category=fitness' }
];

const HELP_LINKS = [
  { label: 'My Orders', to: '/orders' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Profile', to: '/settings?tab=profile' },
  { label: 'Cart', to: '/cart' },
  { label: 'Support chat', to: '/support/chat' }
];

const LEGAL_LINKS = [
  { label: 'Terms of service', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy' }
];

function Footer() {
  return (
    <footer className="mt-20 bg-ink-950 text-ink-100">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="text-sm text-ink-300">
            Premium gear engineered for athletes. Train smarter, run further, play harder.
          </p>
          <div className="flex gap-3 text-ink-400">
            {['IG', 'YT', 'X', 'TT'].map((label) => (
              <span
                key={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-2xs font-semibold tracking-wider transition hover:border-white hover:text-white"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-widest text-white">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-300">
            {SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-widest text-white">Help</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-300">
            {HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-widest text-white">Legal</h4>
          <ul className="mt-4 space-y-2 text-sm text-ink-300">
            {LEGAL_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-2xs font-bold uppercase tracking-widest text-white">Stay in the loop</h4>
          <p className="mt-4 text-sm text-ink-300">
            Drop your email for early access to drops and member-only deals.
          </p>
          <form
            className="mt-4 flex overflow-hidden rounded-full border border-white/10 bg-white/5"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              required
              placeholder="you@team.com"
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-ink-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-accent-500 px-5 text-2xs font-bold uppercase tracking-wider text-white transition hover:bg-accent-600"
            >
              Join
            </button>
          </form>
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-2xs uppercase tracking-wider text-ink-400 sm:flex-row">
          <span>© {new Date().getFullYear()} SportsHub. All rights reserved.</span>
          <span>Engineered for athletes worldwide.</span>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
