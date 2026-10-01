import { SectionHead } from './SectionHead';

const STEPS = [
  ['Pick a file', 'Choose a document from your device. You see its name and size before anything happens.'],
  ["Decide how long it's available", 'Choose an availability period. You see the exact expiry date, time and timezone before you share.'],
  ['Send the link', 'Send the link to whoever needs it. When the time is up, the link stops working for everyone.'],
];

export function HowItWorks() {
  return (
    <section id="how" className="section" aria-labelledby="how-title">
      <div className="split">
        <div className="split__text">
          <SectionHead eyebrow="How it works" title="Three steps, then it's gone." id="how-title" />
          <ol className="steps">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="step glass reveal" style={{ '--d': `${i * 90}ms` }}>
                <span className="step__n" aria-hidden="true">{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="orb-slot" data-orb="1" />
      </div>
    </section>
  );
}
