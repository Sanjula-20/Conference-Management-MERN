import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const Layout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin' || location.pathname === '/reviewer-dashboard' || location.pathname === '/payment-dashboard' || location.pathname === '/payment';

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isDashboard && <Header />}
      <main className="flex-grow">
        <Outlet />
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

export default Layout;
