import { SectionHead } from './SectionHead';

// Bracketed values are facts the backend must supply before launch.
// They stay visible on purpose rather than being filled with reassuring guesses.
const ROWS = [
  ['Stays on your device', 'The original file, card and account numbers, your name and your address.'],
  ['What the AI sees', 'Merchants, amounts and dates, with identifiers swapped for placeholders like [CARD_1].'],
  ['Where analysis runs', '[ON-DEVICE MODEL / CLOUD MODEL]. Not decided yet. We’ll state it here before launch.'],
  ['What we keep', 'Nothing from your statement. [Confirm logging and retention policy before launch.]'],
];
export function Privacy() {
  return (
    <section id="privacy" className="section" aria-labelledby="privacy-title">
      <div className="split split--flip">
        <div className="orb-slot" data-orb="2" />
        <div className="split__text">
          <SectionHead eyebrow="Privacy, plainly" title="What leaves your device" id="privacy-title">
            Your statement is personal. Here's exactly what's planned to stay with you and what doesn't.
          </SectionHead>
          <dl className="facts glass reveal">
            {ROWS.map(([k, v]) => (
              <div key={k} className="facts__row">
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="caveat reveal" role="note">
            <strong>What redaction can’t hide.</strong> Spending patterns say a lot about a person, even without a
            name. That’s why removing identifiers is the minimum, and on-device analysis is the goal.
          </div>
        </div>
      </div>
    </section>
  );
}
