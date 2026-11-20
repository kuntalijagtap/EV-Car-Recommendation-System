import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  House,
  Compass,
  Scale,
  MessageSquare,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  ShieldAlert,
  Bot,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: House },
    { label: 'Catalog', path: '/catalog', icon: Compass },
    { label: 'Compare', path: '/compare', icon: Scale },
    { label: 'AI Advisor', path: '/advisor', icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-aurora-border bg-aurora-base">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-aurora-violet transition-transform group-hover:scale-105">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-aurora-text">EVora</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-aurora-raised text-aurora-text'
                      : 'text-slate-300 hover:bg-aurora-raised hover:text-aurora-text'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            <button type="button" onClick={() => window.dispatchEvent(new Event('evora:open-advisor'))} className="evora-green-gradient inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-[0_7px_20px_rgba(20,160,88,.22)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,160,88,.32)]"><Bot className="h-4 w-4" />Ask EVora</button>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 rounded-xl border border-aurora-border bg-aurora-surface px-3 py-1.5 transition hover:border-aurora-violet/40"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-aurora-violet/30 bg-aurora-violet/15 text-sm font-bold text-aurora-lime">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-200 line-clamp-1">{user?.name}</p>
                    <p className="text-slate-400 capitalize">{user?.role}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="aurora-glass absolute right-0 z-50 mt-2 w-56 rounded-xl py-2 shadow-2xl">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-200 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-aurora-text hover:bg-aurora-raised"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                      Commute & Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-amber-700 hover:bg-aurora-raised"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                      className="flex items-center gap-1.5 rounded-lg border border-transparent px-3.5 py-1.5 text-sm font-medium text-slate-300 transition hover:border-aurora-border hover:bg-aurora-surface hover:text-aurora-text"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-aurora-violet px-3.5 py-1.5 text-sm font-semibold text-white shadow-violet transition hover:brightness-110"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button type="button" aria-label="Ask EVora" onClick={() => window.dispatchEvent(new Event('evora:open-advisor'))} className="evora-green-gradient inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-sm"><Bot className="h-4 w-4" />Ask EVora</button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 hover:text-aurora-text hover:bg-aurora-raised"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="aurora-glass space-y-2 border-x-0 px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-aurora-raised text-aurora-text'
                    : 'text-slate-300 hover:bg-aurora-raised'
                }`}
              >
                <Icon className="h-5 w-5 text-aurora-violet" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-aurora-raised rounded-lg"
                >
                  <UserIcon className="w-4 h-4 text-emerald-400" />
                  Profile & Preferences ({user?.name})
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-amber-700 hover:bg-aurora-raised rounded-lg"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium bg-white text-slate-200 rounded-lg border border-aurora-border"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold bg-aurora-violet text-white rounded-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
