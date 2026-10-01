import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, CheckCircle2, AlertCircle, Zap, Home, Car, IndianRupee } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.profile?.city || 'Pune',
    monthlyBudget: user?.profile?.monthlyBudget || 30000,
    dailyCommuteKm: user?.profile?.dailyCommuteKm || 40,
    familySize: user?.profile?.familySize || 4,
    homeCharging: user?.profile?.homeCharging ?? true,
    preferredBodyType: user?.profile?.preferredBodyType || 'SUV',
  });

  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
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
    setLoading(true);
    setStatusMessage({ text: '', type: '' });

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setStatusMessage({ text: 'Preferences updated successfully! AI Advisor will use these parameters.', type: 'success' });
      } else {
        setStatusMessage({ text: res.message || 'Failed to update preferences.', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Commute & Personal Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Your profile parameters are automatically injected into the AI Advisor to eliminate range anxiety and tailor recommendations.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400'
              : 'bg-red-950/40 border border-red-500/40 text-red-400'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
        {/* Account Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-emerald-400" />
            <span>Account Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Driving & Commute Telemetry */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Commute Telemetry & Lifestyle</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Primary City of Travel</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Pune, Mumbai, Delhi, Bengaluru"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Daily Round-Trip Commute (km)</label>
              <input
                type="number"
                min={1}
                max={500}
                name="dailyCommuteKm"
                value={formData.dailyCommuteKm}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Preferred Body Type</label>
              <select
                name="preferredBodyType"
                value={formData.preferredBodyType}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Hatchback">Hatchback</option>
                <option value="MUV">MUV</option>
                <option value="Crossover">Crossover</option>
                <option value="Any">Any / Open to Suggestions</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Family Size</label>
              <input
                type="number"
                min={1}
                max={9}
                name="familySize"
                value={formData.familySize}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="homeCharging"
                checked={formData.homeCharging}
                onChange={handleChange}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <span className="text-slate-200 font-semibold text-xs">
                Dedicated Home / Parking Lot AC Charging Available
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-7">
              Having home charging allows the AI advisor to recommend vehicles with smaller battery packs (saving purchase cost) while maintaining 100% daily convenience.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Preferences'}</span>
        </button>
      </form>
    </div>
  );
}
