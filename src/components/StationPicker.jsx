import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '../utils/useGeolocation';
import { findNearestStop } from '../utils/haversine';
import { t } from '../data/translations';

export default function StationPicker({ city, lang, onSelect }) {
  const { loading, error, coords } = useGeolocation();
  const [rawStops, setRawStops] = useState([]);
  const [nearest, setNearest] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    if (!city) return;
    import(`../data/stops/${city}.json`).then((mod) => setRawStops(mod.default));
  }, [city]);

  // Normalize every stop so downstream code doesn't have to worry about
  // whether the entry has `id` (single) or `ids` (array). Attach a synthetic
  // `_key` that is guaranteed unique-per-render for React and never touches
  // the underlying data.
  const stops = useMemo(
    () =>
      rawStops.map((s, i) => ({
        ...s,
        _key: String(s.id ?? (Array.isArray(s.ids) ? s.ids.join('-') : i)),
      })),
    [rawStops]
  );

  useEffect(() => {
    if (coords && stops.length > 0) {
      const { stop } = findNearestStop(coords.lat, coords.lon, stops);
      if (stop) {
        const idx = stops.indexOf(stop);
        setNearest(stop);
        setSelectedIdx(idx);
        onSelect(stop);
      }
    }
    // onSelect intentionally omitted — parent's reference changes each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords, stops]);

  // Lookup by index (from the <option value={i}>) — always finds the row,
  // regardless of whether the data has id/ids/nothing.
  function handleChange(e) {
    const idx = Number(e.target.value);
    const stop = stops[idx];
    if (!stop) return;                      // guard against the empty "select…" option
    setSelectedIdx(idx);
    onSelect(stop);
  }

  if (loading) {
    return (
      <div className="text-white text-center py-4">
        <p className="text-lg">{t(lang, 'findingNearestStop')}</p>
      </div>
    );
  }

  if (error || !coords) {
    return (
      <div>
        <p className="text-white/80 text-sm mb-2">
          {t(lang, 'enableLocationNote')}
        </p>
        <select
          className="w-full p-3 rounded-xl text-gray-800 text-base"
          onChange={handleChange}
          value={selectedIdx ?? ''}
        >
          <option value="" disabled>{t(lang, 'selectAStop')}</option>
          {stops.map((s, i) => (
            <option key={s._key} value={i}>{s.name}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      {nearest && !showAll && (
        <div className="bg-white/20 rounded-xl p-4 mb-3">
          <p className="text-white/70 text-sm uppercase tracking-wide mb-1">{t(lang, 'nearestStop')}</p>
          <p className="text-white text-xl font-bold">{nearest.name}</p>
        </div>
      )}

      {showAll ? (
        <select
          className="w-full p-3 rounded-xl text-gray-800 text-base"
          onChange={handleChange}
          value={selectedIdx ?? ''}
        >
          <option value="" disabled>{t(lang, 'selectAStop')}</option>
          {stops.map((s, i) => (
            <option key={s._key} value={i}>{s.name}</option>
          ))}
        </select>
      ) : (
        <button
          className="text-white/80 underline text-sm"
          onClick={() => setShowAll(true)}
        >
          {t(lang, 'chooseDifferentStop')}
        </button>
      )}
    </div>
  );
}