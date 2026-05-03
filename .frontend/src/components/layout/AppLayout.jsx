import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastHost from '../feedback/ToastHost';
import DemoModeBanner from '../feedback/DemoModeBanner';
import SupportChatFab from '../support/SupportChatFab';

function AppLayout({ children }) {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-screen flex-col bg-bone dark:bg-ink-950">
      <DemoModeBanner />
      <Header />
      <main className={isHome ? 'flex-1' : 'flex-1 py-10'}>{children}</main>
      <Footer />
      <SupportChatFab />
      <ToastHost />
    </div>
  );
}

export default AppLayout;
