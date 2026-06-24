import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const navLinks = [
  { id: 'home', to: '/', label: 'Home', hash: '' },
  { id: 'about', to: '/#about', label: 'About Us', hash: 'about' },
  { id: 'services', to: '/#services', label: 'Services', hash: 'services' },
  { id: 'doctors', to: '/#doctors', label: 'Doctors', hash: 'doctors' },
  { id: 'contact', to: '/#contact', label: 'Contact Us', hash: 'contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState('home');
  const location = useLocation();
  const navRef = useRef(null);
  const linkRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = useCallback((id) => {
    const el = linkRefs.current[id];
    const nav = navRef.current;
    if (!el || !nav) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicator({ left: elRect.left - navRect.left, width: elRect.width });
  }, []);

  // Scroll-spy: highlight nav item matching visible section
  useEffect(() => {
    if (location.pathname !== '/') return;

    const sections = navLinks.filter((l) => l.hash).map((l) => document.getElementById(l.hash));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          const id = visible[0].target.id;
          setActiveId(id);
          updateIndicator(id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((s) => s && observer.observe(s));

    const onScrollTop = () => {
      if (window.scrollY < 100) {
        setActiveId('home');
        updateIndicator('home');
      }
    };
    window.addEventListener('scroll', onScrollTop, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScrollTop);
    };
  }, [location.pathname, updateIndicator]);

  // Sync with URL hash on load
  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveId('');
      return;
    }
    const hash = location.hash.replace('#', '');
    const id = hash || 'home';
    setActiveId(id);
    requestAnimationFrame(() => updateIndicator(id));
  }, [location.pathname, location.hash, updateIndicator]);

  const handleClick = (link) => {
    setActiveId(link.id);
    updateIndicator(link.id);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Logo />

        <nav ref={navRef} className="relative hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.id}
              ref={(el) => { linkRefs.current[link.id] = el; }}
              href={link.to}
              onClick={() => handleClick(link)}
              className={`relative pb-1 text-sm font-medium transition-colors duration-300 ${
                activeId === link.id ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
              }`}
            >
              {link.label}
            </a>
          ))}
          {/* Animated sliding underline */}
          {activeId && indicator.width > 0 && (
            <span
              className="absolute -bottom-1 h-0.5 rounded-full bg-primary-500 transition-all duration-300 ease-in-out"
              style={{ left: indicator.left, width: indicator.width }}
            />
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="btn-outline px-5 py-2.5">Login</Link>
          <Link to="/register" className="btn-primary px-5 py-2.5">Register</Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.to}
              onClick={() => handleClick(link)}
              className={`block py-3 text-sm font-medium ${activeId === link.id ? 'text-primary-500' : 'text-gray-600'}`}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/login" className="btn-outline w-full">Login</Link>
            <Link to="/register" className="btn-primary w-full">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}
