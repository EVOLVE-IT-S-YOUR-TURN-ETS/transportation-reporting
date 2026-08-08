import { useState } from 'react';
import StationPicker from './components/StationPicker';
import IssueSelector from './components/IssueSelector';
import { t } from './data/translations';

const WEBHOOK_URL = 'https://script.google.com/a/macros/evolveitsyourturn.org/s/AKfycbyQ9KLQSc6gW_2H7FyJSO4Aap_vB_aLwAnC1FUy7619lzkLKi81iLHQ4olBOg68-1iDsg/exec';

// Read city and lang from URL params: ?city=bologna&lang=en
const params = new URLSearchParams(window.location.search);
const CITY = params.get('city') || 'bologna';
const INITIAL_LANG = params.get('lang') || 'en';

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'it', flag: '🇮🇹' },
  { code: 'el', flag: '🇬🇷' },
  { code: 'es', flag: '🇪🇸' },
];

const STEPS = ['station', 'issue', 'details', 'contact', 'done'];

export default function App() {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(INITIAL_LANG);
  const [report, setReport] = useState({
    city: CITY,
    lang: INITIAL_LANG,
    station: null,
    issue: null,
    details: '',
    contact: { wantsContact: false, email: '', phone: '' },
  });

  const [submitting, setSubmitting] = useState(false);

  async function next() {
    if (STEPS[step] === 'contact') {
      setSubmitting(true);
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          body: JSON.stringify(report),
        });
      } catch (err) {
        console.error('Submission failed:', err);
      }
      setSubmitting(false);
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function changeLang(code) {
    setLang(code);
    setReport((r) => ({ ...r, lang: code }));
    const url = new URL(window.location);
    url.searchParams.set('lang', code);
    window.history.replaceState({}, '', url);
  }

  function canAdvance() {
    if (STEPS[step] === 'station') return !!report.station;
    if (STEPS[step] === 'issue') return !!report.issue?.category;
    return true;
  }

  return (
    <div className="min-h-svh bg-[#fa6f77] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3 mb-1">
          <p className="text-white/60 text-xs uppercase tracking-widest">
            {CITY.charAt(0).toUpperCase() + CITY.slice(1)}
          </p>
          <div className="flex gap-1.5">
            {LANGUAGES.map(({ code, flag }) => (
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
              city={CITY}
              lang={lang}
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
                  city: CITY, lang,
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
          src="/partner-logos.png"
          alt={t(lang, 'partnerLogosAlt')}
          className="w-full max-w-sm mx-auto block"
        />
      </footer>

      {/* Navigation */}
      {STEPS[step] !== 'done' && (
        <div className="px-6 pb-8 flex gap-3">
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
      )}
    </div>
  );
}