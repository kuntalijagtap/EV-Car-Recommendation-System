import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Save, CheckCircle2, AlertCircle, Zap, Heart, Trash2 } from 'lucide-react';
import api from '../services/api';
import { CarFront } from 'lucide-react';
import { getVehicleImage } from '../services/vehicleImage';

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
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState('');
  const [removingId, setRemovingId] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/wishlist')
      .then((res) => {
        if (active && res.data.success) setWishlist(res.data.data);
      })
      .catch(() => {
        if (active) setWishlistError('Could not load your saved vehicles.');
      })
      .finally(() => {
        if (active) setWishlistLoading(false);
      });

    return () => { active = false; };
  }, []);

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

  const handleRemoveFromWishlist = async (evId) => {
    setRemovingId(evId);
    try {
      await api.delete(`/wishlist/${evId}`);
      setWishlist((current) => current.filter((item) => item.ev._id !== evId));
    } catch {
      setWishlistError('Could not remove this vehicle. Please try again.');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-aurora-text tracking-tight">
          Commute & Personal Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          The Advisor uses your saved city, commute, family size, preferred body type, and home-charging access to personalize car matches. Your chat message can override any preference.
        </p>
      </div>

      {statusMessage.text && (
        <div
          className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="aurora-glass space-y-6 rounded-3xl p-6 text-xs sm:p-8">
        {/* Account Info */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-aurora-text flex items-center gap-2 border-b border-slate-800 pb-3">
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
                className="w-full bg-white border border-aurora-border rounded-xl px-3.5 py-2.5 text-aurora-text focus:outline-none focus:border-aurora-violet"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-aurora-raised border border-aurora-border rounded-xl px-3.5 py-2.5 text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Driving & Commute Telemetry */}
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold text-aurora-text flex items-center gap-2 border-b border-slate-800 pb-3">
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
                className="w-full bg-white border border-aurora-border rounded-xl px-3.5 py-2.5 text-aurora-text focus:outline-none focus:border-aurora-violet"
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
                className="w-full bg-white border border-aurora-border rounded-xl px-3.5 py-2.5 text-aurora-text font-mono focus:outline-none focus:border-aurora-violet"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Preferred Body Type</label>
              <select
                name="preferredBodyType"
                value={formData.preferredBodyType}
                onChange={handleChange}
                className="w-full bg-white border border-aurora-border rounded-xl px-3.5 py-2.5 text-aurora-text focus:outline-none focus:border-aurora-violet"
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
                className="w-full bg-white border border-aurora-border rounded-xl px-3.5 py-2.5 text-aurora-text font-mono focus:outline-none focus:border-aurora-violet"
              />
            </div>
          </div>

          <div className="p-4 bg-aurora-raised rounded-2xl border border-aurora-border space-y-2">
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
          className="flex items-center gap-2 rounded-xl bg-aurora-violet px-6 py-3 text-xs font-bold text-white shadow-violet transition hover:brightness-110 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving Changes...' : 'Save Preferences'}</span>
        </button>
      </form>

      <section className="aurora-glass space-y-4 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Heart className="h-4 w-4 text-rose-400" />
          <h2 className="text-sm font-bold text-aurora-text">Your wishlist</h2>
          <span className="ml-auto text-xs text-slate-400">{wishlist.length} saved</span>
        </div>

        {wishlistError && <p role="status" className="text-xs text-rose-300">{wishlistError}</p>}
        {wishlistLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-slate-800/60" />
        ) : wishlist.length ? (
          <div className="divide-y divide-slate-800">
            {wishlist.map(({ wishlistId, ev }) => (
              <div key={wishlistId} className="flex items-center gap-4 py-3">
                {getVehicleImage(ev) ? <img src={getVehicleImage(ev)} alt={`${ev.brandId?.name || ''} ${ev.name}`} className="h-16 w-24 shrink-0 rounded-lg bg-aurora-raised object-cover" /> : <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-aurora-raised text-aurora-violet/60"><CarFront className="h-6 w-6" /></div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold uppercase text-emerald-300">{ev.brandId?.name}</p>
                  <Link to={`/evs/${ev._id}`} className="block truncate text-sm font-bold text-aurora-text hover:text-aurora-lime">{ev.name}</Link>
                  <p className="mt-1 text-xs text-slate-400">
                    {ev.price?.exShowroom ? `₹${(ev.price.exShowroom / 100000).toFixed(2)} lakh` : 'Price on request'}
                    {ev.range?.claimedNedc ? ` · ${ev.range.claimedNedc} km claimed` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFromWishlist(ev._id)}
                  disabled={removingId === ev._id}
                  aria-label={`Remove ${ev.name} from wishlist`}
                  title="Remove from wishlist"
                  className="rounded-lg border border-aurora-border p-2 text-slate-400 transition hover:border-rose-400/40 hover:text-rose-300 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-3 text-sm text-slate-400">
            <p>No saved vehicles yet.</p>
            <Link to="/catalog" className="mt-2 inline-flex items-center text-xs font-semibold text-aurora-lime hover:underline">Browse EVs</Link>
          </div>
        )}
      </section>
    </div>
  );
}
