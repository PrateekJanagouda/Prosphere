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

// Three.js loads after the page shell, so text is readable immediately.
const HeroScene = lazy(() => import('./three/HeroScene'));

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

  if (hash.startsWith('#/s/')) return <ExpiredPage />;

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero>
          <SceneBoundary>
            <Suspense fallback={null}>
              <HeroScene reduced={reduced} />
            </Suspense>
          </SceneBoundary>
        </Hero>
        <HowItWorks />
        <Privacy />
        <ShareDemo reduced={reduced} />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
