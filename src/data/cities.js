// The three pilot cities.
//
// `center` is used only to work out which city a reporter is in, by comparing
// their GPS position against each centre. It is not used for finding stops —
// that still uses the full stop list for the detected city.
//
// `languages` is the list offered in that country: the local language first
// (which becomes the default) and English as the fallback for visitors.

export const CITIES = [
  {
    id: 'bologna',
    name: 'Bologna',
    country: 'IT',
    center: { lat: 44.4949, lon: 11.3426 },
    languages: ['it', 'en'],
  },
  {
    id: 'granada',
    name: 'Granada',
    country: 'ES',
    center: { lat: 37.1773, lon: -3.5986 },
    languages: ['es', 'en'],
  },
  {
    id: 'thessaloniki',
    name: 'Θεσσαλονίκη',
    country: 'GR',
    center: { lat: 40.6401, lon: 22.9444 },
    languages: ['el', 'en'],
  },
];

// How far from a city centre we still consider someone "in" that city.
// The three cities are thousands of km apart, so this only needs to be
// generous enough to cover each metropolitan area and its outskirts.
export const CITY_RADIUS_KM = 80;

export const ALL_LANGUAGES = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'it', flag: '🇮🇹' },
  { code: 'el', flag: '🇬🇷' },
  { code: 'es', flag: '🇪🇸' },
];

export function getCity(id) {
  return CITIES.find((c) => c.id === id) ?? null;
}

/** Languages to offer for a city — falls back to all of them if unknown. */
export function languagesFor(cityId) {
  const city = getCity(cityId);
  const codes = city ? city.languages : ALL_LANGUAGES.map((l) => l.code);
  return ALL_LANGUAGES.filter((l) => codes.includes(l.code));
}

/** The language a city defaults to (its local one). */
export function defaultLangFor(cityId) {
  return getCity(cityId)?.languages[0] ?? 'en';
}
