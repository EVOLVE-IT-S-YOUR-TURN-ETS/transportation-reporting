import { useState, useRef } from 'react';
import StationPicker from './components/StationPicker';
import IssueSelector from './components/IssueSelector';
import { haversineDistance } from './utils/haversine';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwnkxKT66MOkRy_ziV0tSlB7aU3AwiIzw1iwFjWgpzFVwF7LXdIFaxjxZhv_wZWyTqzEQ/exec';

// Read city and lang from URL params: ?city=bologna&lang=en
const params = new URLSearchParams(window.location.search);
const CITY = params.get('city') || 'bologna';
const LANG = params.get('lang') || 'en';

const STEPS = ['station', 'issue', 'details', 'contact', 'done'];

function getDistanceBucket(userCoords, station) {
  if (!userCoords || !station?.lat || !station?.lon) return 'unavailable';
  const km = haversineDistance(userCoords.lat, userCoords.lon, station.lat, station.lon);
  const meters = km * 1000;
  if (meters <= 50) return 'at stop';
  if (meters <= 300) return 'nearby';
  return 'remote';
}

export default function App() {
  // Session ID — in-memory only, gone when tab closes
  const sessionId = useRef(crypto.randomUUID());

  const [step, setStep] = useState(0);
  const [report, setReport] = useState({
    city: CITY,
    lang: LANG,
    station: null,
    issue: null,
    details: '',
    contact: { wantsContact: false, email: '', phone: '' },
    demographics: {
      wantsDemographics: null, // null = not answered, true/false = answered
      gender: '',
      age: '',
      income: '',
    },
    honeypot: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  async function next() {
    if (STEPS[step] === 'contact') {
      // Capture GPS distance — race against a 3s timeout so it never blocks submission
      const distanceBucket = await Promise.race([
        new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
              resolve(getDistanceBucket(coords, report.station));
            },
            () => resolve('unavailable')
          );
        }),
        new Promise((resolve) => setTimeout(() => resolve('unavailable'), 3000)),
      ]);

      setSubmitting(true);
      setSubmitError(false);
      const payload = { ...report, sessionId: sessionId.current, distanceBucket };
      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload),
        });
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
          <section className="space-y-6">

            {/* Honeypot — invisible to humans */}
            <input
              type="text"
              name="website"
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
              value={report.honeypot}
              onChange={(e) => setReport((r) => ({ ...r, honeypot: e.target.value }))}
            />

            {/* Contact section */}
            <div>
              <h2 className="text-white font-bold text-lg mb-1">
                Can we contact you with follow-up questions about your report?
              </h2>
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
                <span className="text-white font-semibold">Yes</span>
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
                  <p className="text-white/60 text-xs px-1">
                    Your contact details will only be used to follow up on your report and will not be shared with third parties.
                  </p>
                </div>
              )}
            </div>

            {/* Demographics section */}
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Help us understand our users</h2>
              <p className="text-white/70 text-sm mb-4">
                Would you like to answer a few optional questions? Your answers are anonymous and never linked to your contact information.
              </p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, wantsDemographics: true } }))}
                  className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                    report.demographics.wantsDemographics === true
                      ? 'bg-white text-[#fa6f77]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, wantsDemographics: false, gender: '', age: '', income: '' } }))}
                  className={`flex-1 py-3 rounded-xl font-bold text-base transition-all ${
                    report.demographics.wantsDemographics === false
                      ? 'bg-white text-[#fa6f77]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  No
                </button>
              </div>

              {report.demographics.wantsDemographics === true && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-xl p-4 text-white/70 text-xs leading-relaxed">
                    Your answers are anonymous and never linked to your contact information or report. This data is collected by EVOLVE to understand who uses public transport and improve services across European cities. Responses are retained for 7 years. You may skip any question.
                  </div>

                  {/* Gender */}
                  <div>
                    <p className="text-white font-semibold mb-2">Gender</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Woman', 'Man', 'Non-binary / other', 'Prefer not to say'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, gender: opt } }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                            report.demographics.gender === opt
                              ? 'bg-white text-[#fa6f77]'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age */}
                  <div>
                    <p className="text-white font-semibold mb-2">Age</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Under 18', '18–25', '26–40', '41–60', '61 or over', 'Prefer not to say'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, age: opt } }))}
                          className={`py-2.5 px-2 rounded-xl text-sm font-medium transition-all ${
                            report.demographics.age === opt
                              ? 'bg-white text-[#fa6f77]'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Income */}
                  <div>
                    <p className="text-white font-semibold mb-2">Income</p>
                    <div className="space-y-2">
                      {['Below average for my area', 'About average for my area', 'Above average for my area', 'Prefer not to say'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setReport((r) => ({ ...r, demographics: { ...r.demographics, income: opt } }))}
                          className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium text-left transition-all ${
                            report.demographics.income === opt
                              ? 'bg-white text-[#fa6f77]'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          {opt}
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
            <h2 className="text-white text-2xl font-black uppercase mb-2">Thank you!</h2>
            <p className="text-white/80 mb-8">Your report has been submitted.</p>
            <button
              onClick={() => {
                setStep(0);
                setReport({
                  city: CITY, lang: LANG,
                  station: null, issue: null, details: '',
                  contact: { wantsContact: false, email: '', phone: '' },
                  demographics: { wantsDemographics: null, gender: '', age: '', income: '' },
                  honeypot: '',
                });
              }}
              className="w-full bg-white text-[#fa6f77] font-black uppercase py-4 rounded-2xl text-lg mb-4"
            >
              Make another report
            </button>
            <a
              href="https://evolveitsyourturn.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block bg-white/20 text-white font-bold py-4 rounded-2xl text-base mb-6"
            >
              Learn more about EVOLVE
            </a>
            <p className="text-white/60 text-sm mb-3 uppercase tracking-widest">Follow us or share</p>
            <div className="flex justify-center gap-6">
              <a href="https://www.facebook.com/evolve.itsyourturn" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.988H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="https://www.instagram.com/evolve_itsyourturn/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.975 1.246 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.974-2.242 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584-.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.516 2.497 5.783 2.225 7.15 2.163 8.416 2.105 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.197.157 3.355.673 2.014 2.014.673 3.355.157 5.197.072 7.052.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.855.601 3.697 1.942 5.038 1.341 1.341 3.183 1.857 5.038 1.942C8.332 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 1.855-.085 3.697-.601 5.038-1.942 1.341-1.341 1.857-3.183 1.942-5.038.058-1.28.072-1.689.072-4.948 0-3.259-.014-3.668-.072-4.948-.085-1.855-.601-3.697-1.942-5.038C20.645.673 18.803.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
              <a href="https://www.linkedin.com/company/eiyt" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
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
            {submitting ? 'Sending...' : STEPS[step] === 'contact' ? (submitError ? 'Retry' : 'Submit') : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}
