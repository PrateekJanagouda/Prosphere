import { SectionHead } from './SectionHead';

// Bracketed values are facts the backend must supply before launch.
// They stay visible on purpose rather than being filled with reassuring guesses.
const ROWS = [
  ['Where it’s held', 'Temporarily on [STORAGE PROVIDER / REGION], only while the link is active.'],
  ['When access ends', 'At the expiry time you choose. The server refuses expired links. Hiding them in the interface isn’t enough.'],
  ['When copies are deleted', 'Originals, previews and temporary copies are deleted within [DELETION WINDOW] after expiry. Backups follow [BACKUP RETENTION].'],
  ['Encryption', 'Transfers will use HTTPS. We don’t claim end-to-end encryption.'],
];

export function Privacy() {
  return (
    <section id="privacy" className="section" aria-labelledby="privacy-title">
      <div className="split split--flip">
        <div className="orb-slot" data-orb="2" />
        <div className="split__text">
          <SectionHead eyebrow="Privacy, plainly" title="Where your file goes" id="privacy-title">
            Temporary doesn’t mean invisible. This is how Prosphere is designed to work at launch.
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
            <strong>What expiry can’t undo.</strong> Anyone who downloads your file or takes a screenshot keeps that
            copy. Only share with people you trust.
          </div>
        </div>
      </div>
    </section>
  );
}
