import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: 'Pune',
    monthlyBudget: 30000,
    dailyCommuteKm: 40,
    familySize: 4,
    homeCharging: true,
    preferredBodyType: 'SUV',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        {
          city: formData.city,
          monthlyBudget: Number(formData.monthlyBudget),
          dailyCommuteKm: Number(formData.dailyCommuteKm),
          familySize: Number(formData.familySize),
          homeCharging: Boolean(formData.homeCharging),
          preferredBodyType: formData.preferredBodyType,
        }
      );

      if (res.success) {
        navigate(location.state?.from || '/catalog', { replace: true });
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="aurora-glass w-full max-w-lg space-y-6 rounded-3xl p-8 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-aurora-violet/35 bg-aurora-violet/15 text-aurora-lime">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-aurora-text">Join EVora</h2>
          <p className="text-xs text-slate-400">
            Create an account with your commute preferences for tailored AI recommendations
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Kuntali Jagtap"
                className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text placeholder-slate-500 focus:outline-none focus:border-aurora-violet"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="kuntali@example.com"
                className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text placeholder-slate-500 focus:outline-none focus:border-aurora-violet"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Password (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text placeholder-slate-500 focus:outline-none focus:border-aurora-violet"
            />
          </div>

          {/* Commute Preferences (Personalization Profile) */}
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-aurora-lime">
              Commute & Charging Profile
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Pune, Mumbai"
                  className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text focus:outline-none focus:border-aurora-violet"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Daily Commute (km)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  name="dailyCommuteKm"
                  value={formData.dailyCommuteKm}
                  onChange={handleChange}
                  className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text focus:outline-none focus:border-aurora-violet font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Preferred Body</label>
                <select
                  name="preferredBodyType"
                  value={formData.preferredBodyType}
                  onChange={handleChange}
                  className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text focus:outline-none focus:border-aurora-violet"
                >
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="MUV">MUV</option>
                  <option value="Crossover">Crossover</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Family Members</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  name="familySize"
                  value={formData.familySize}
                  onChange={handleChange}
                  className="w-full bg-white border border-aurora-border rounded-xl px-3 py-2 text-aurora-text focus:outline-none focus:border-aurora-violet font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-aurora-border cursor-pointer">
              <input
                type="checkbox"
                name="homeCharging"
                checked={formData.homeCharging}
                onChange={handleChange}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-300 font-medium">
                I have access to home / apartment overnight charging
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-aurora-violet py-3 text-xs font-bold text-white shadow-violet transition hover:brightness-110 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Profile...' : 'Complete Registration'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" state={location.state} className="text-emerald-400 hover:underline font-semibold">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
