import { useEffect } from 'react';

/**
 * Adds `is-in` to every `.reveal` element as it scrolls into view.
 * Content is only hidden once this hook has run (html.reveal-ready),
 * so the page is fully readable if JavaScript fails.
 */
export function useReveal(deps = []) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
