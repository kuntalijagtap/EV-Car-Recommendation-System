import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

/** Drag-to-rotate only over an ordered, vehicle-specific frame manifest. */
export default function Frame360Viewer({ frames = [], name = 'vehicle' }) {
  const validFrames = frames.filter((frame) => typeof frame === 'string' && frame.trim());
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const drag = useRef(null);
  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [index]);

  const rotate = (delta) => setIndex((current) => (current + delta + validFrames.length) % validFrames.length);
  const onPointerDown = (event) => {
    if (validFrames.length < 2) return;
    drag.current = { x: event.clientX, moved: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event) => {
    if (!drag.current || validFrames.length < 2) return;
    drag.current.moved += event.clientX - drag.current.x;
    drag.current.x = event.clientX;
    const steps = Math.trunc(drag.current.moved / 8);
    if (steps) {
      rotate(-steps);
      drag.current.moved -= steps * 8;
    }
  };
  const endDrag = () => { drag.current = null; };

  if (validFrames.length < 2) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-aurora-border bg-white px-6 text-center sm:min-h-96">
        <RotateCcw aria-hidden="true" className="mb-3 h-8 w-8 text-aurora-muted" />
        <h3 className="font-display text-lg font-semibold text-aurora-text">360° view unavailable</h3>
        <p className="mt-2 max-w-md text-sm text-aurora-muted">A real rotation needs an ordered set of photos for this exact model. This vehicle has no 360° frames yet.</p>
      </div>
    );
  }

  return (
    <section aria-label={`${name} 360 degree view`} className="space-y-3">
      <div
        className="relative flex aspect-[16/10] min-h-72 touch-pan-y select-none items-center justify-center overflow-hidden rounded-2xl border border-aurora-border bg-white sm:min-h-96"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') rotate(-1);
          if (event.key === 'ArrowRight') rotate(1);
          if (event.key === 'Home') setIndex(0);
        }}
        role="group"
        tabIndex={0}
        aria-label="Drag or use arrow keys to rotate the vehicle"
      >
        {!loaded && !failed && <span className="absolute text-sm text-aurora-muted" role="status">Loading view…</span>}
        {failed ? (
          <p className="px-6 text-center text-sm text-aurora-muted" role="status">This angle could not be loaded. Try another view.</p>
        ) : (
          <img
            key={validFrames[index]}
            src={validFrames[index]}
            alt={`${name}, 360 degree view, frame ${index + 1} of ${validFrames.length}`}
            draggable="false"
            onLoad={() => setLoaded(true)}
            onError={() => { setLoaded(true); setFailed(true); }}
            className={`h-full w-full object-contain transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-aurora-text shadow-sm">360° View</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-aurora-muted">Drag to rotate · {index + 1} of {validFrames.length}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => rotate(-1)} aria-label="Previous angle" className="rounded-lg border border-aurora-border p-2 text-aurora-text hover:bg-aurora-raised"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setIndex(0)} aria-label="Reset view" className="rounded-lg border border-aurora-border p-2 text-aurora-text hover:bg-aurora-raised"><RotateCcw className="h-4 w-4" /></button>
          <button type="button" onClick={() => rotate(1)} aria-label="Next angle" className="rounded-lg border border-aurora-border p-2 text-aurora-text hover:bg-aurora-raised"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </section>
  );
}
