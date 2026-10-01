import { SectionHead } from './SectionHead';

// Spec-sheet rows. Bracketed values are facts the backend must supply before launch;
// they are left visible on purpose rather than filled with reassuring guesses.
const ROWS = [
  ['Storage', 'Held temporarily on [STORAGE PROVIDER / REGION], only while the link is active.'],
  ['Access ends', 'At the expiry time you choose. Expired links are refused by the server, not just hidden in the interface.'],
  ['Deletion', 'Originals, previews and temporary copies are deleted within [DELETION WINDOW] after expiry. Backups follow [BACKUP RETENTION].'],
  ['Encryption', 'Transfers will use HTTPS. We do not claim end-to-end encryption.'],
  ['This demo', 'Nothing is uploaded. The demo reads only the file name and size, and only in your browser.'],
];

export function Privacy() {
  return (
    <section id="privacy" className="section section--alt" aria-labelledby="privacy-title">
      <div className="container privacy">
        <SectionHead index="02" label="Privacy, plainly" title="What happens to your file" id="privacy-title">
          Temporary doesn't mean invisible. This is how Prosphere is designed to work at launch. Bracketed values are still being decided, and we won't guess them.
        </SectionHead>
        <div className="privacy__sheet">
          <dl className="spec frame">
            {ROWS.map(([k, v]) => (
              <div key={k} className="spec__row">
                <dt className="mono">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="caveat" role="note">
            <p className="mono caveat__k">What expiry can't undo</p>
            <p>
              Anyone who downloads your file or takes a screenshot keeps that copy. An expired link can't reach
              files already on someone else's device. Only share with people you trust.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
