import { SectionHead } from './SectionHead';

const STEPS = [
  {
    k: 'SELECT',
    title: 'Pick a file',
    body: "Choose a document from your device. You see its name and size before anything happens.",
    icon: (
      <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8zM14 3v5h5M9 13h6M9 17h4" />
    ),
  },
  {
    k: 'SET TTL',
    title: "Decide how long it's available",
    body: 'Choose an availability period. You see the exact expiry date, time and timezone before you share.',
    icon: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2" />,
  },
  {
    k: 'SHARE',
    title: 'Send the link',
    body: 'Send the link to whoever needs it. When the time is up, the link stops working for everyone.',
    icon: <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="section" aria-labelledby="how-title">
      <div className="container">
        <SectionHead index="01" label="How it works" title="Three steps. Then it's gone." id="how-title" />
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.k} className="step frame">
              <div className="step__top">
                <span className="mono">{String(i + 1).padStart(2, '0')} / {s.k}</span>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {s.icon}
                </svg>
              </div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
