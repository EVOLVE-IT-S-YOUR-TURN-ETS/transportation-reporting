import { useState, useEffect } from 'react';
import { useGeolocation } from '../utils/useGeolocation';
import { findNearestStop } from '../utils/haversine';
import { t } from '../data/translations';

export default function StationPicker({ city, lang, onSelect }) {
  const { loading, error, coords } = useGeolocation();
  const [stops, setStops] = useState([]);
  const [nearest, setNearest] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!city) return;
    import(`../data/stops/${city}.json`).then((mod) => setStops(mod.default));
  }, [city]);

  useEffect(() => {
    if (coords && stops.length > 0) {
      const { stop } = findNearestStop(coords.lat, coords.lon, stops);
      setNearest(stop);
      setSelected(stop);
      onSelect(stop);
    }
  }, [coords, stops]);

  function handleChange(e) {
    const stop = stops.find((s) => s.id === e.target.value);
    setSelected(stop);
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
    // Location denied or unavailable — show full dropdown
    return (
      <div>
        <p className="text-white/80 text-sm mb-2">
          {t(lang, 'enableLocationNote')}
        </p>
        <select
          className="w-full p-3 rounded-xl text-gray-800 text-base"
          onChange={handleChange}
          defaultValue=""
        >
          <option value="" disabled>{t(lang, 'selectAStop')}</option>
          {stops.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
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
          defaultValue={selected?.id ?? ''}
        >
          {stops.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
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
