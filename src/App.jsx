import { Suspense, lazy, useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Privacy } from './components/Privacy';
import { ShareDemo } from './components/ShareDemo';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { ExpiredPage } from './components/ExpiredPage';
import { SceneBoundary } from './components/SceneBoundary';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useReveal } from './hooks/useReveal';

// Three.js loads after the page shell, so text is readable immediately.
const Experience = lazy(() => import('./three/Experience'));

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const reduced = useReducedMotion();
  const hash = useHashRoute();
  const expired = hash.startsWith('#/s/');
  useReveal([expired]);

  return (
    <>
      {/* One 3D scene behind every page; sections steer it with data-orb anchors. */}
      <SceneBoundary>
        <Suspense fallback={null}>
          <Experience reduced={reduced} />
        </Suspense>
      </SceneBoundary>

      {expired ? (
        <ExpiredPage />
      ) : (
        <>
          <a className="skip" href="#main">Skip to content</a>
          <Header />
          <main id="main">
            <Hero />
            <HowItWorks />
            <Privacy />
            <ShareDemo />
            <Faq />
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
