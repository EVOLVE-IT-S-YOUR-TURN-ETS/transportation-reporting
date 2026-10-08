import { useState, useRef } from 'react';
import StationPicker from './components/StationPicker';
import IssueSelector from './components/IssueSelector';
import { t } from './data/translations';
import { useGeolocation } from './utils/useGeolocation';
import { detectCity } from './utils/detectCity';
import { CITIES, ALL_LANGUAGES, getCity, languagesFor, defaultLangFor } from './data/cities';
import { haversineDistance } from './utils/haversine';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwnkxKT66MOkRy_ziV0tSlB7aU3AwiIzw1iwFjWgpzFVwF7LXdIFaxjxZhv_wZWyTqzEQ/exec';

const params = new URLSearchParams(window.location.search);
const INITIAL_CITY = params.get('city') || null;
const URL_LANG = params.get('lang');

const STEPS = ['station', 'issue', 'details', 'contact', 'done'];

function getDistanceBucket(coords, station) {
  if (!coords || !station?.lat || !station?.lon) return 'unavailable';
  const km = haversineDistance(coords.lat, coords.lon, station.lat, station.lon);
  const meters = km * 1000;
  if (meters <= 50) return 'at stop';
  if (meters <= 300) return 'nearby';
  return 'remote';
}

export default function App() {
  const sessionId = useRef(crypto.randomUUID());

  const [step, setStep] = useState(0);
  const [langOverride, setLangOverride] = useState(null);
  const [cityOverride, setCityOverride] = useState(null);
  const [report, setReport] = useState({
    station: null,
    issue: null,
    details: '',
    contact: { wantsContact: false, email: '', phone: '' },
    demographics: { wantsDemographics: null, gender: '', age: '', income: '' },
    honeypot: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const geo = useGeolocation();

  const detectedCity = geo.coords ? detectCity(geo.coords.lat, geo.coords.lon) : null;
  const city = cityOverride ?? INITIAL_CITY ?? detectedCity;
  const lang = langOverride ?? URL_LANG ?? (city ? defaultLangFor(city) : 'en');
  const languages = city ? languagesFor(city) : ALL_LANGUAGES;

  async function next() {
    if (STEPS[step] === 'contact') {
      const distanceBucket = getDistanceBucket(geo.coords, report.station);

      setSubmitting(true);
      setSubmitError(false);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ...report, city, lang, sessionId: sessionId.current, distanceBucket }),
          signal: controller.signal,
        });
        clearTimeout(timeout);
      } catch (err) {
        console.error('Submission failed:', err);
        setSubmitError(true);
        setSubmitting(false);
        return;
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

  if (!city && geo.loading) {
    return (
      <div className="min-h-svh bg-[#fa6f77] flex items-center justify-center px-6">
        <p className="text-white text-lg text-center">{t(lang, 'detectingLocation')}</p>
      </div>
    );
  }

  if (!city) {
    return (
      <div className="min-h-svh bg-[#fa6f77] flex flex-col">
        <header className="px-6 pt-8 pb-4">
          <div className="flex items-center justify-end gap-1.5 mb-1">
            {languages.map(({ code, flag }) => (
              <button key={code} onClick={() => changeLang(code)} aria-label={code}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${lang === code ? 'bg-white' : 'bg-white/20'}`}>
                {flag}
              </button>
            ))}
          </div>
          <h1 className="text-white text-2xl font-black uppercase leading-tight">{t(lang, 'selectYourCity')}</h1>
        </header>
        <main className="flex-1 px-6 pb-6">
          <p className="text-white/70 text-sm mb-4">{t(lang, 'selectCityNote')}</p>
          <div className="flex flex-col gap-3">
            {CITIES.map(({ id, name }) => (
              <button key={id} onClick={() => chooseCity(id)}
                className="w-full bg-white/20 text-white font-bold py-4 rounded-2xl text-lg transition-all active:bg-white active:text-[#fa6f77]">
                {name}
              </button>
            ))}
          </div>
        </main>
        <footer className="px-6 pb-8 pt-2">
          <img src={`${import.meta.env.BASE_URL}partner-logos.png`} alt={t(lang, 'partnerLogosAlt')} className="w-full max-w-sm mx-auto block" />
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#fa6f77] flex flex-col">
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-white/60 text-xs uppercase tracking-widest">{getCity(city)?.name ?? city}</p>
          <div className="flex gap-1.5">
            {languages.map(({ code, flag }) => (
              <button key={code} onClick={() => changeLang(code)} aria-label={code}
                className={`w-7 h-7 rounded-full text-sm flex items-center justify-center transition-all ${lang === code ? 'bg-white' : 'bg-white/20'}`}>
                {flag}
              </button>
            ))}
          </div>
        </div>
        <h1 className="text-white text-2xl font-black uppercase leading-tight">{t(lang, 'reportIssue')}</h1>
      </header>

      <div className="flex gap-2 px-6 pb-4">
        {STEPS.slice(0, -1).map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
        ))}
      </div>

      <main className="flex-1 px-6 pb-6 space-y-6">

        {STEPS[step] === 'station' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">{t(lang, 'whereAreYou')}</h2>
            <StationPicker city={city} lang={lang} geo={geo} onSelect={(station) => setReport((r) => ({ ...r, station }))} />
          </section>
        )}

        {STEPS[step] === 'issue' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">{t(lang, 'whatsTheIssue')}</h2>
            <IssueSelector lang={lang} onSelect={(issue) => setReport((r) => ({ ...r, issue }))} />
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
          <section className="space-y-6">

            {/* Honeypot — invisible to humans */}
            <input type="text" name="website" style={{ display: 'none' }} tabIndex={-1} autoComplete="off"
              value={report.honeypot} onChange={(e) => setReport((r) => ({ ...r, honeypot: e.target.value }))} />

            {/* Contact */}
            <div>
              <h2 className="text-white font-bold text-lg mb-3">{t(lang, 'wantFollowUp')}</h2>
              <label className="flex items-center gap-3 bg-white/20 rounded-xl p-4 mb-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5" checked={report.contact.wantsContact}
                  onChange={(e) => setReport((r) => ({ ...r, contact: { ...r.contact, wantsContact: e.target.checked } }))} />
                <span className="text-white font-semibold">{t(lang, 'yesContactMe')}</span>
              </label>
              {report.contact.wantsContact && (
                <div className="space-y-3">
                  <input type="email" className="w-full p-3 rounded-xl text-gray-800"
                    placeholder={t(lang, 'emailPlaceholder')} value={report.contact.email}
                    onChange={(e) => setReport((r) => ({ ...r, contact: { ...r.contact, email: e.target.value } }))} />
                  <input type="tel" className="w-full p-3 rounded-xl text-gray-800"
                    placeholder={t(lang, 'phonePlaceholder')} value={report.contact.phone}
                    onChange={(e) => setReport((r) => ({ ...r, contact: { ...r.contact, phone: e.target.value } }))} />
                  <p className="text-white/60 text-xs px-1">{t(lang, 'contactPrivacyNote')}</p>
                </div>
              )}
            </div>

            {/* Demographics */}
            <div>
              <h2 className="text-white font-bold text-lg mb-1">{t(lang, 'helpUsUnderstand')}</h2>
              <p className="text-white/70 text-sm mb-4">{t(lang, 'demographicsNote')}</p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, wantsDemographics: true } }))}
                  className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${report.demographics.wantsDemographics === true ? 'bg-white text-[#fa6f77]' : 'bg-white/20 text-white'}`}>
                  {t(lang, 'yesContactMe')}
                </button>
                <button
                  onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, wantsDemographics: false, gender: '', age: '', income: '' } }))}
                  className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${report.demographics.wantsDemographics === false ? 'bg-white text-[#fa6f77]' : 'bg-white/20 text-white'}`}>
                  No
                </button>
              </div>

              {report.demographics.wantsDemographics === true && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4 text-white/70 text-xs leading-relaxed">
                    {t(lang, 'demographicsPrivacy')}
                  </div>

                  <div>
                    <p className="text-white font-semibold mb-2">{t(lang, 'genderLabel')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[['Woman','Woman'],['Man','Man'],['Non-binary / other','Non-binary / other'],[t(lang,'preferNotToSay'),'Prefer not to say']].map(([label, key]) => (
                        <button key={key} onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, gender: key } }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${report.demographics.gender === key ? 'bg-white text-[#fa6f77]' : 'bg-white/20 text-white'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold mb-2">{t(lang, 'ageLabel')}</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[['Under 18','Under 18'],['18–25','18-25'],['26–40','26-40'],['41–60','41-60'],['61 or over','61+'],[t(lang,'preferNotToSay'),'Prefer not to say']].map(([label, key]) => (
                        <button key={key} onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, age: key } }))}
                          className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${report.demographics.age === key ? 'bg-white text-[#fa6f77]' : 'bg-white/20 text-white'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-semibold mb-2">{t(lang, 'incomeLabel')}</p>
                    <div className="space-y-2">
                      {[['Below average for my area','Below average'],['About average for my area','About average'],['Above average for my area','Above average'],[t(lang,'preferNotToSay'),'Prefer not to say']].map(([label, key]) => (
                        <button key={key} onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, income: key } }))}
                          className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${report.demographics.income === key ? 'bg-white text-[#fa6f77]' : 'bg-white/20 text-white'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {STEPS[step] === 'done' && (
          <section className="text-center pt-8">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-white text-2xl font-black uppercase mb-2">{t(lang, 'thankYou')}</h2>
            <p className="text-white/80 mb-8">{t(lang, 'reportSubmitted')}</p>
            <button
              onClick={() => { setStep(0); setReport({ station: null, issue: null, details: '', contact: { wantsContact: false, email: '', phone: '' }, demographics: { wantsDemographics: null, gender: '', age: '', income: '' }, honeypot: '' }); }}
              className="w-full bg-white text-[#fa6f77] font-black uppercase py-4 rounded-2xl text-lg">
              {t(lang, 'makeAnotherReport')}
            </button>
          </section>
        )}
      </main>

      <footer className="px-6 pb-4 pt-2">
        <img src={`${import.meta.env.BASE_URL}partner-logos.png`} alt={t(lang, 'partnerLogosAlt')} className="w-full max-w-sm mx-auto block" />
      </footer>

      {STEPS[step] !== 'done' && (
        <div className="px-6 pb-8">
          {submitError && (
            <p className="bg-white/20 text-white text-sm rounded-xl p-3 mb-3">{t(lang, 'submitFailed')}</p>
          )}
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={back} className="flex-1 bg-white/20 text-white font-bold py-4 rounded-2xl text-base">
                {t(lang, 'back')}
              </button>
            )}
            <button onClick={next} disabled={!canAdvance()}
              className={`flex-1 font-black uppercase py-4 rounded-2xl text-base transition-all ${canAdvance() ? 'bg-white text-[#fa6f77]' : 'bg-white/30 text-white/50 cursor-not-allowed'}`}>
              {submitting ? t(lang, 'sending') : STEPS[step] === 'contact' ? t(lang, 'submit') : t(lang, 'next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
