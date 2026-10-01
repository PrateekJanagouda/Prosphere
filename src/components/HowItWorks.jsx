import { SectionHead } from './SectionHead';

const STEPS = [
  ['Add a statement', 'Drop in a credit card statement. It opens on your device and is never uploaded.'],
  ['Identifiers come off', 'Card numbers, names, addresses and account IDs are replaced with placeholders before anything else happens.'],
  ['Get the insight', 'Only the cleaned-up transactions are analysed. Fees, subscriptions and spending patterns come back, with the real details filled in on your screen.'],
];
export function HowItWorks() {
  return (
    <section id="how" className="section" aria-labelledby="how-title">
      <div className="split">
        <div className="split__text">
          <SectionHead eyebrow="How it works" title="Three steps. Your data stays put." id="how-title" />
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
