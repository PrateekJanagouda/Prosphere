import { SectionHead } from './SectionHead';

const QA = [
  [
    'What happens when a link expires?',
    'The link stops working and anyone who opens it sees an expired page. Stored copies are then deleted on a separate schedule ([DELETION WINDOW]). Expiry and deletion are two different steps, and we tell you about both.',
  ],
  ['Where is my file stored?', 'Temporarily on [STORAGE PROVIDER / REGION], only while your link is active. In this demo, nothing is stored anywhere.'],
  ['Can recipients keep a copy?', 'Yes. Anyone who downloads the file or takes a screenshot keeps that copy. Expiry has no effect on it.'],
  ['Is this live?', "Not yet. This is a demo of the experience. The share button creates a sample link that doesn't carry a file."],
];

export function Faq() {
  return (
    <section id="faq" className="section section--faq" aria-labelledby="faq-title">
      <div className="faq-wrap">
        <div className="orb-slot orb-slot--small" data-orb="4" />
        <SectionHead eyebrow="Questions" title="Before you share" id="faq-title" />
        <div className="faq glass reveal">
          {QA.map(([q, a], i) => (
            <details key={q} className="faq__item" open={i === 0}>
              <summary>
                <span>{q}</span>
                <span className="faq__icon" aria-hidden="true" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
