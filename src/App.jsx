import { Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Privacy } from './components/Privacy';
import { InsightDemo } from './components/InsightDemo';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { SceneBoundary } from './components/SceneBoundary';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useReveal } from './hooks/useReveal';

// Three.js loads after the page shell, so text is readable immediately.
const Experience = lazy(() => import('./three/Experience'));

export default function App() {
  const reduced = useReducedMotion();
  useReveal();

  return (
    <>
      {/* One 3D scene behind the page; sections steer it with data-orb anchors. */}
      <SceneBoundary>
        <Suspense fallback={null}>
          <Experience reduced={reduced} />
        </Suspense>
      </SceneBoundary>

      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Privacy />
        <InsightDemo />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
