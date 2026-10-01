import { SectionHead } from './SectionHead';

const QA = [
  [
    'Does my statement get uploaded?',
    "No. The plan is to open and clean it on your device. If any step ever needs a server, this page will say so before you use it.",
  ],
  ['What does the AI actually see?', 'Merchants, amounts and dates. Your card number, name and account details are swapped for placeholders first.'],
  ['Can it still learn things about me?', 'Spending patterns are personal even without a name. Removing identifiers is the minimum; running the analysis on your device is the goal.'],
  ['Is this live?', "Not yet. This page is a preview. Nothing you add here is analysed or sent anywhere."],
];
export function Faq() {
  return (
    <section id="faq" className="section section--faq" aria-labelledby="faq-title">
      <div className="faq-wrap">
        <div className="orb-slot orb-slot--small" data-orb="4" />
        <SectionHead eyebrow="Questions" title="Before you try it" id="faq-title" />
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
