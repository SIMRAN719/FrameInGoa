import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import BuilderForm from './components/BuilderForm';
import BuilderIdCard from './components/BuilderIdCard';
import { buildQrMatrix } from './lib/qr';
import { buildShareUrl, decodeProfileFromSearch } from './lib/shareLink';
import type { BuilderProfile } from './lib/types';
import './App.css';

const GoaQrScene = lazy(() => import('./components/GoaQrScene'));

const App = () => {
  const [profile, setProfile] = useState<BuilderProfile | null>(null);
  const [isVisitor, setIsVisitor] = useState(false);

  useEffect(() => {
    const decoded = decodeProfileFromSearch(window.location.search);
    if (decoded) {
      setProfile(decoded);
      setIsVisitor(true);
    }
  }, []);

  const shareUrl = useMemo(() => (profile ? buildShareUrl(profile) : ''), [profile]);
  const matrix = useMemo(() => (shareUrl ? buildQrMatrix(shareUrl) : null), [shareUrl]);

  const handleReset = () => {
    setProfile(null);
    setIsVisitor(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="app">
      <header className="app__header">
        <p className="app__kicker">🌴 Frame in Goa</p>
        <h1 className="app__title">Build your Goa street QR</h1>
        <p className="app__subtitle">
          Roads, rooftops, scooters &amp; beaches arranged from above into a scannable QR — plus a shareable builder
          badge.
        </p>
      </header>

      <main className="app__main">
        {!profile || !matrix ? (
          <BuilderForm onSubmit={setProfile} />
        ) : (
          <div className="app__results">
            {isVisitor ? (
              <div className="app__visitor-banner">
                <span>
                  👋 You're viewing <strong>{profile.teamName}</strong>'s Goa badge
                </span>
                <button type="button" className="app__edit-btn" onClick={handleReset}>
                  Make your own →
                </button>
              </div>
            ) : (
              <button type="button" className="app__edit-btn" onClick={handleReset}>
                ← Edit details
              </button>
            )}
            <div className="app__results-grid">
              <Suspense fallback={<div className="app__scene-loading">Paving the streets…</div>}>
                <GoaQrScene matrix={matrix} teamName={profile.teamName} shareUrl={shareUrl} />
              </Suspense>
              <BuilderIdCard teamName={profile.teamName} members={profile.members} />
            </div>
          </div>
        )}
      </main>

      <footer className="app__footer">Made with 🥭 for Hack Heaven Goa · no backend, nothing leaves your device</footer>
    </div>
  );
};

export default App;
