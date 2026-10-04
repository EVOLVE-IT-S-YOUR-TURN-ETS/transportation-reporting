import { useState } from 'react';
import StationPicker from './components/StationPicker';
import IssueSelector from './components/IssueSelector';
import { t } from './data/translations';
import { useGeolocation } from './utils/useGeolocation';
import { detectCity } from './utils/detectCity';
import { CITIES, ALL_LANGUAGES, getCity, languagesFor, defaultLangFor } from './data/cities';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyVB-EOb0Dftgmcgs8qvk1pDcSpmBDLt9T6LQtlay0lEBxwfkZquGw9GiIeaFVUU_C3vw/exec';

// Read city and lang from URL params: ?city=bologna&lang=en
// No default for city — if it's missing, the user picks it on a first screen.
const params = new URLSearchParams(window.location.search);
const INITIAL_CITY = params.get('city') || null;
// A lang in the URL always wins. Otherwise the language follows the detected
// city, so it can't be decided until we know where the reporter is.
const URL_LANG = params.get('lang');

const STEPS = ['station', 'issue', 'details', 'contact', 'done'];

export default function App() {
  const [step, setStep] = useState(0);
  // Overrides are only set when the reporter actively picks something.
  // Otherwise city and language are derived below from their position.
  const [langOverride, setLangOverride] = useState(null);
  const [cityOverride, setCityOverride] = useState(null);
  const [report, setReport] = useState({
    station: null,
    issue: null,
    details: '',
    contact: { wantsContact: false, email: '', phone: '' },
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Ask for location once, here, and share it with StationPicker. Doing it in
  // both places would fire two permission requests for the same information.
  const geo = useGeolocation();

  // City, in order of authority: what the reporter picked > what the QR code
  // said > what their position implies. Derived, so no effect needed.
  const detectedCity = geo.coords ? detectCity(geo.coords.lat, geo.coords.lon) : null;
  const city = cityOverride ?? INITIAL_CITY ?? detectedCity;

  // Language follows the same idea: an explicit choice wins, then the URL,
  // then the local language of whichever city we're in.
  const lang = langOverride ?? URL_LANG ?? (city ? defaultLangFor(city) : 'en');

  // Only offer the languages spoken in the country we're in.
  const languages = city ? languagesFor(city) : ALL_LANGUAGES;

  async function next() {
    if (STEPS[step] === 'contact') {
      setSubmitting(true);
      setSubmitError(false);
      try {
        // Don't let a hanging request leave the user stuck on "Sending..."
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          // text/plain keeps this a "simple" request, so the browser skips
          // the CORS preflight that Apps Script cannot answer.
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ...report, city, lang }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        const result = await res.json();
        if (result.status !== 'ok') throw new Error(result.message || 'Unknown error');
      } catch (err) {
        console.error('Submission failed:', err);
        setSubmitError(true);
        setSubmitting(false);
        return; // stay on this step so the report isn't lost
      }
      setSubmitting(false);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function chooseCity(id) {
    setCityOverride(id);
    const url = new URL(window.location);
    url.searchParams.set('city', id);
    window.history.replaceState({}, '', url);
  }

  function changeLang(code) {
    setLangOverride(code);
    const url = new URL(window.location);
    url.searchParams.set('lang', code);
    window.history.replaceState({}, '', url);
  }

  function canAdvance() {
    if (STEPS[step] === 'station') return !!report.station;
    if (STEPS[step] === 'issue') return !!report.issue?.category;
    return true;
  }

  // Still waiting for the browser to report a position — we can't know the
  // city or the language yet, so show a neutral loading screen.
  if (!city && geo.loading) {
    return (
      <div className="min-h-svh bg-[#fa6f77] flex items-center justify-center px-6">
        <p className="text-white text-lg text-center">{t(lang, 'detectingLocation')}</p>
      </div>
    );
  }

  // Location was refused, unavailable, or the reporter is nowhere near a
  // pilot city — fall back to picking manually.
  if (!city) {
    return (
      <div className="min-h-svh bg-[#fa6f77] flex flex-col">
        <header className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-end gap-1.5 mb-1">
            {languages.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                aria-label={code}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  lang === code ? 'bg-white' : 'bg-white/20'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
          <h1 className="text-white text-2xl font-black uppercase leading-tight">
            {t(lang, 'selectYourCity')}
          </h1>
        </header>

        <main className="flex-1 px-6 pb-6">
          <p className="text-white/70 text-sm mb-4">{t(lang, 'selectCityNote')}</p>
          <div className="flex flex-col gap-3">
            {CITIES.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => chooseCity(id)}
                className="w-full bg-white/20 text-white font-bold py-4 rounded-2xl text-lg transition-all active:bg-white active:text-[#fa6f77]"
              >
                {name}
              </button>
            ))}
          </div>
        </main>

        <footer className="px-6 pb-8 pt-2">
          <img
            src={`${import.meta.env.BASE_URL}partner-logos.png`}
            alt={t(lang, 'partnerLogosAlt')}
            className="w-full max-w-sm mx-auto block"
          />
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#fa6f77] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-white/60 text-xs uppercase tracking-widest">
            {getCity(city)?.name ?? city}
          </p>
          <div className="flex gap-1.5">
            {languages.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                aria-label={code}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${
                  lang === code ? 'bg-white' : 'bg-white/20'
                }`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>
        <h1 className="text-white text-2xl font-black uppercase leading-tight">
          {t(lang, 'reportIssue')}
        </h1>
      </header>

      {/* Progress dots */}
      <div className="flex gap-2 px-6 pb-4">
        {STEPS.slice(0, -1).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full flex-1 transition-all ${
              i <= step ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <main className="flex-1 px-6 pb-6 space-y-6">

        {STEPS[step] === 'station' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">{t(lang, 'whereAreYou')}</h2>
            <StationPicker
              city={city}
              lang={lang}
              geo={geo}
              onSelect={(station) => setReport((r) => ({ ...r, station }))}
            />
          </section>
        )}

        {STEPS[step] === 'issue' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">{t(lang, 'whatsTheIssue')}</h2>
            <IssueSelector
              lang={lang}
              onSelect={(issue) => setReport((r) => ({ ...r, issue }))}
            />
          </section>
        )}

        {STEPS[step] === 'details' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">{t(lang, 'anythingElse')}</h2>
            <textarea
              className="w-full p-4 rounded-xl text-gray-800 text-base min-h-32 resize-none"
              placeholder={t(lang, 'detailsPlaceholder')}
              value={report.details}
              onChange={(e) => setReport((r) => ({ ...r, details: e.target.value }))}
            />
          </section>
        )}

        {STEPS[step] === 'contact' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-2">{t(lang, 'wantFollowUp')}</h2>
            <p className="text-white/70 text-sm mb-4">{t(lang, 'followUpNote')}</p>
            <label className="flex items-center gap-3 bg-white/20 rounded-xl p-4 mb-4 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5"
                checked={report.contact.wantsContact}
                onChange={(e) =>
                  setReport((r) => ({
                    ...r,
                    contact: { ...r.contact, wantsContact: e.target.checked },
                  }))
                }
              />
              <span className="text-white font-semibold">{t(lang, 'yesContactMe')}</span>
            </label>
            {report.contact.wantsContact && (
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full p-3 rounded-xl text-gray-800"
                  placeholder={t(lang, 'emailPlaceholder')}
                  value={report.contact.email}
                  onChange={(e) =>
                    setReport((r) => ({
                      ...r,
                      contact: { ...r.contact, email: e.target.value },
                    }))
                  }
                />
                <input
                  type="tel"
                  className="w-full p-3 rounded-xl text-gray-800"
                  placeholder={t(lang, 'phonePlaceholder')}
                  value={report.contact.phone}
                  onChange={(e) =>
                    setReport((r) => ({
                      ...r,
                      contact: { ...r.contact, phone: e.target.value },
                    }))
                  }
                />
              </div>
            )}
          </section>
        )}

        {STEPS[step] === 'done' && (
          <section className="text-center pt-8">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-white text-2xl font-black uppercase mb-2">{t(lang, 'thankYou')}</h2>
            <p className="text-white/80 mb-8">{t(lang, 'reportSubmitted')}</p>
            <button
              onClick={() => {
                setStep(0);
                setReport({
                  station: null, issue: null, details: '',
                  contact: { wantsContact: false, email: '', phone: '' },
                });
              }}
              className="w-full bg-white text-[#fa6f77] font-black uppercase py-4 rounded-2xl text-lg"
            >
              {t(lang, 'makeAnotherReport')}
            </button>
          </section>
        )}
      </main>

      {/* Partner logos */}
      <footer className="px-6 pb-4 pt-2">
        <img
          src={`${import.meta.env.BASE_URL}partner-logos.png`}
          alt={t(lang, 'partnerLogosAlt')}
          className="w-full max-w-sm mx-auto block"
        />
      </footer>

      {/* Navigation */}
      {STEPS[step] !== 'done' && (
        <div className="px-6 pb-8">
          {submitError && (
            <p className="bg-white/20 text-white text-sm rounded-xl p-3 mb-3">
              {t(lang, 'submitFailed')}
            </p>
          )}
          <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="flex-1 bg-white/20 text-white font-bold py-4 rounded-2xl text-base"
            >
              {t(lang, 'back')}
            </button>
          )}
          <button
            onClick={next}
            disabled={!canAdvance()}
            className={`flex-1 font-black uppercase py-4 rounded-2xl text-base transition-all ${
              canAdvance()
                ? 'bg-white text-[#fa6f77]'
                : 'bg-white/30 text-white/50 cursor-not-allowed'
            }`}
          >
            {submitting ? t(lang, 'sending') : STEPS[step] === 'contact' ? t(lang, 'submit') : t(lang, 'next')}
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
