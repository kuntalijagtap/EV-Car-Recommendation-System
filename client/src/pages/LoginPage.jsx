import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(location.state?.from || '/catalog', { replace: true });
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="page-enter aurora-glass w-full max-w-md space-y-6 rounded-3xl p-8 shadow-2xl transition duration-300 hover:shadow-xl">
        <div className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-aurora-violet/35 bg-aurora-violet/15 text-aurora-lime transition duration-300 hover:rotate-6 hover:scale-110">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-aurora-text">Welcome Back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your personal EV preferences & wishlist
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full rounded-xl border border-aurora-border bg-aurora-base px-3.5 py-2.5 text-aurora-text placeholder-slate-500 transition duration-200 focus:border-aurora-violet focus:outline-none focus:ring-2 focus:ring-aurora-violet/20"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-aurora-border bg-aurora-base px-3.5 py-2.5 text-aurora-text placeholder-slate-500 transition duration-200 focus:border-aurora-violet focus:outline-none focus:ring-2 focus:ring-aurora-violet/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-aurora-violet py-3 text-xs font-bold text-white shadow-violet transition hover:brightness-110 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" state={location.state} className="font-semibold text-aurora-lime hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
