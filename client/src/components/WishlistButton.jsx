import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function WishlistButton({ evId, showLabel = false }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    if (authLoading) return () => { active = false; };
    if (!isAuthenticated) {
      setIsSaved(false);
      return () => { active = false; };
    }

    api.get(`/wishlist/check/${evId}`)
      .then((res) => {
        if (active) setIsSaved(res.data.inWishlist);
      })
      .catch(() => {
        if (active) setIsSaved(false);
      });

    return () => { active = false; };
  }, [evId, isAuthenticated, authLoading]);

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setBusy(true);
    try {
      if (isSaved) {
        await api.delete(`/wishlist/${evId}`);
        setIsSaved(false);
      } else {
        await api.post('/wishlist', { evId });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={busy || authLoading}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border transition disabled:opacity-50 ${
        isSaved
          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
          : 'border-aurora-border bg-white text-slate-500 hover:border-rose-300 hover:text-rose-700'
      } ${showLabel ? 'px-3 py-2 text-xs font-semibold' : 'h-10 w-10'}`}
    >
      <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      {showLabel && <span>{isSaved ? 'Saved' : 'Save to wishlist'}</span>}
    </button>
  );
}