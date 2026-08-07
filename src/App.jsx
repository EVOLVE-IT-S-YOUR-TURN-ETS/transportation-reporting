import { useState } from 'react';
import StationPicker from './components/StationPicker';
import IssueSelector from './components/IssueSelector';

const WEBHOOK_URL = 'https://script.google.com/a/macros/evolveitsyourturn.org/s/AKfycbyQ9KLQSc6gW_2H7FyJSO4Aap_vB_aLwAnC1FUy7619lzkLKi81iLHQ4olBOg68-1iDsg/exec';

// Read city and lang from URL params: ?city=bologna&lang=en
const params = new URLSearchParams(window.location.search);
const CITY = params.get('city') || 'bologna';
const LANG = params.get('lang') || 'en';

const STEPS = ['station', 'issue', 'details', 'contact', 'done'];

export default function App() {
  const [step, setStep] = useState(0);
  const [report, setReport] = useState({
    city: CITY,
    lang: LANG,
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

  function canAdvance() {
    if (STEPS[step] === 'station') return !!report.station;
    if (STEPS[step] === 'issue') return !!report.issue?.category;
    return true;
  }

  return (
    <div className="min-h-svh bg-[#fa6f77] flex flex-col">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <p className="text-white/60 text-xs uppercase tracking-widest mb-1">
          {CITY.charAt(0).toUpperCase() + CITY.slice(1)}
        </p>
        <h1 className="text-white text-2xl font-black uppercase leading-tight">
          Report a transport issue
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
            <h2 className="text-white font-bold text-lg mb-4">Where are you?</h2>
            <StationPicker
              city={CITY}
              onSelect={(station) => setReport((r) => ({ ...r, station }))}
            />
          </section>
        )}

        {STEPS[step] === 'issue' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">What's the issue?</h2>
            <IssueSelector
              onSelect={(issue) => setReport((r) => ({ ...r, issue }))}
            />
          </section>
        )}

        {STEPS[step] === 'details' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-4">Anything else to add?</h2>
            <textarea
              className="w-full p-4 rounded-xl text-gray-800 text-base min-h-32 resize-none"
              placeholder="Optional — any extra details..."
              value={report.details}
              onChange={(e) => setReport((r) => ({ ...r, details: e.target.value }))}
            />
          </section>
        )}

        {STEPS[step] === 'contact' && (
          <section>
            <h2 className="text-white font-bold text-lg mb-2">Want a follow-up?</h2>
            <p className="text-white/70 text-sm mb-4">We may contact you for more information.</p>
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
              <span className="text-white font-semibold">Yes, contact me</span>
            </label>
            {report.contact.wantsContact && (
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full p-3 rounded-xl text-gray-800"
                  placeholder="Email address"
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
                  placeholder="Phone number (optional)"
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
            <h2 className="text-white text-2xl font-black uppercase mb-2">Thank you!</h2>
            <p className="text-white/80 mb-8">Your report has been submitted.</p>
            <button
              onClick={() => {
                setStep(0);
                setReport({
                  city: CITY, lang: LANG,
                  station: null, issue: null, details: '',
                  contact: { wantsContact: false, email: '', phone: '' },
                });
              }}
              className="w-full bg-white text-[#fa6f77] font-black uppercase py-4 rounded-2xl text-lg"
            >
              Make another report
            </button>
          </section>
        )}
      </main>

      {/* Partner logos */}
      <footer className="px-6 pb-4 pt-2">
        <img
          src="/partner-logos.png"
          alt="Co-funded by the European Union | NEXO | EVOLVE | You in Europe"
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
              Back
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
            {submitting ? 'Sending...' : STEPS[step] === 'contact' ? 'Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
