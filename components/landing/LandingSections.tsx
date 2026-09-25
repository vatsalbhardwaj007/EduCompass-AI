import Link from "next/link";
import { ArrowUpRight, Compass, Scale, Wallet } from "lucide-react";

const dimensions = [
  ["01", "Admission safety", "Understand how your rank sits against the historical closing ranks in the sample dataset."],
  ["02", "Return on investment", "Put total tuition and average package side by side before the comparison becomes emotional."],
  ["03", "Branch match", "Keep the course you want visible alongside the college name you recognise."],
  ["04", "Placement", "See the placement signals that contribute to the fit score."],
  ["05", "Hostel", "Account for the practical shape of living away from home."],
  ["06", "Coding culture", "Give technical communities and campus momentum their proper weight."],
];

export function DecisionSection() {
  return (
    <section className="landing-decision-section" aria-labelledby="decision-heading">
      <div className="landing-section-intro" data-reveal="intro">
        <p className="landing-eyebrow">More than a rank</p>
        <h2 id="decision-heading">Make the shortlist<br />mean something.</h2>
        <p>Because choosing a college is not an eligibility problem. It is a life-shaped decision with a lot of noise around it.</p>
      </div>
      <div className="landing-principles" role="list">
        <article role="listitem" data-reveal="column"><span>01</span><h3>Safety, not guesswork</h3><p>Range your shortlist against real cutoffs, branch demand, and the room your score gives you.</p></article>
        <article role="listitem" data-reveal="column" data-reveal-delay="1"><span>02</span><h3>Fit has more than one axis</h3><p>ROI, campus life, hostel quality, and coding culture sit beside the rank—not behind it.</p></article>
        <article role="listitem" data-reveal="column" data-reveal-delay="2"><span>03</span><h3>A plan you can defend</h3><p>Every recommendation comes with a clear why, so the next decision feels like yours.</p></article>
      </div>
    </section>
  );
}

export function MethodSection() {
  return (
    <section id="method" className="landing-method-section" aria-labelledby="method-heading">
      <div className="landing-method-intro" data-reveal="intro">
        <p className="landing-eyebrow">How it works</p>
        <h2 id="method-heading">Less noise.<br />More knowing.</h2>
        <p>EduCompass is a calm, evidence-led layer between your result and your decision.</p>
        <Link href="/profile" className="landing-method-action">Try the planner <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
      <ol className="landing-method-steps">
        <li data-reveal="step"><span>01</span><div><h3>Bring your real score</h3><p>Tell us your exam, rank, category, preferences, and non-negotiables.</p></div></li>
        <li data-reveal="step" data-reveal-delay="1"><span>02</span><div><h3>See the full picture</h3><p>Our fit engine balances admission safety with the life you want after the seat.</p></div></li>
        <li data-reveal="step" data-reveal-delay="2"><span>03</span><div><h3>Move with a shortlist</h3><p>Walk away with a considered set of choices—not a spreadsheet full of maybes.</p></div></li>
      </ol>
    </section>
  );
}

export function DimensionsSection() {
  return (
    <section id="what-we-weigh" className="landing-dimensions-section" aria-labelledby="dimensions-heading">
      <div className="landing-section-intro landing-dimensions-intro" data-reveal="intro">
        <p className="landing-eyebrow">What we weigh</p>
        <h2 id="dimensions-heading">The decision has<br />more than one input.</h2>
        <p>FIT brings six current recommendation dimensions into one transparent starting point. It is not an admission probability.</p>
      </div>
      <div className="landing-dimensions-list" role="list">
        {dimensions.map(([number, heading, copy]) => (
          <article key={heading} role="listitem" data-reveal="factor" data-reveal-delay={number.slice(-1)}><span>{number}</span><div><h3>{heading}</h3><p>{copy}</p></div></article>
        ))}
      </div>
    </section>
  );
}

export function FamiliesSection() {
  return (
    <section id="families" className="landing-families-section" aria-labelledby="families-heading">
      <div className="landing-families-symbols" aria-hidden="true" data-reveal="symbol"><Wallet /><Scale /><Compass /></div>
      <div data-reveal="intro">
        <p className="landing-eyebrow">For families</p>
        <h2 id="families-heading">A decision everyone<br />can understand.</h2>
      </div>
      <div className="landing-families-copy" data-reveal="copy" data-reveal-delay="1">
        <p>Look beyond the first eligible seat. Put affordability, return on investment, branch preference, and campus experience in the same conversation.</p>
        <p>EduCompass makes the trade-offs visible, so a shortlist can become a decision you can explain together.</p>
      </div>
    </section>
  );
}

export function PrincipleSection() {
  return (
    <section className="landing-thoughtful-section" aria-labelledby="thoughtful-heading" data-reveal="statement">
      <p className="landing-eyebrow">Thoughtful by design</p>
      <h2 id="thoughtful-heading">Every score is a starting point for a better conversation—not a verdict.</h2>
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="landing-final-cta" aria-labelledby="cta-heading">
      <p className="landing-eyebrow" data-reveal="eyebrow">Your next move</p>
      <h2 id="cta-heading" data-reveal="headline" data-reveal-delay="1">Turn the question<br />into a plan.</h2>
      <p data-reveal="copy" data-reveal-delay="2">Start with your score. Leave with a little more certainty.</p>
      <Link className="landing-primary-action" href="/profile" data-reveal="cta" data-reveal-delay="3">Launch my planner <span aria-hidden="true">→</span></Link>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="landing-footer" data-reveal="footer">
      <div><strong>EduCompass</strong><span>Smart engineering admissions</span></div>
      <nav aria-label="Footer navigation"><a href="#method">How it works</a><a href="#what-we-weigh">What we weigh</a><a href="#families">For families</a></nav>
      <p>Illustrative sample data for demonstration only. Not for admission decisions.</p>
    </footer>
  );
}
