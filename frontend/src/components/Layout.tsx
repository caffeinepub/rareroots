import React from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { Home, Search, ShoppingBag, User, Mountain, ShoppingCart } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface LayoutProps {
  children: React.ReactNode;
  cartCount?: number;
}

export default function Layout({ children, cartCount = 0 }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  const isProducer = userProfile?.role === 'producer';
  const profilePath = isProducer ? '/dashboard' : '/collection';

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/discover', label: 'Discover', icon: Search },
    { path: '/orders', label: 'Orders', icon: ShoppingBag },
    { path: profilePath, label: 'Profile', icon: User },
  ] as const;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFFF0' }}>
      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: '60px',
          backgroundColor: '#FFFFF0',
          boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(218,165,32,0.2)',
        }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <Mountain className="w-6 h-6" style={{ color: '#8B4513' }} />
          <span
            className="font-poppins font-bold"
            style={{ fontSize: '22px', color: '#8B4513' }}
          >
            SamriddhiSrot
          </span>
        </Link>

        {/* Right Icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: profilePath })}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-amber-50 transition-colors"
          >
            <User className="w-5 h-5" style={{ color: '#8B4513' }} />
          </button>
          <button
            onClick={() => navigate({ to: '/orders' })}
            className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-amber-50 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" style={{ color: '#8B4513' }} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white font-poppins font-bold"
                style={{ fontSize: '10px', backgroundColor: '#DAA520' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '60px', paddingBottom: '72px' }}>
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`bottom-nav-item ${isActive(path) ? 'active' : ''}`}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: isActive(path) ? '#8B4513' : '#666' }}
            />
            <span style={{ color: isActive(path) ? '#8B4513' : '#666', fontSize: '11px' }}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
