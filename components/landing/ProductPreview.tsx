import { Check, ChevronRight, GitCompareArrows, MapPin } from "lucide-react";

const previewColleges = [
  { name: "NIT Tiruchirappalli", branch: "Computer Science", fit: 91, fee: "₹6.5L", place: "₹27.3L", type: "NIT" },
  { name: "IIIT Allahabad", branch: "Electronics & Communication", fit: 87, fee: "₹4.8L", place: "₹27.8L", type: "IIIT" },
  { name: "NIT Surathkal", branch: "Computer Science", fit: 84, fee: "₹6.8L", place: "₹26.6L", type: "NIT" },
];

export default function ProductPreview() {
  return (
    <div className="landing-product-preview" aria-label="Illustrative EduCompass recommendation preview">
      <div className="landing-preview-topbar">
        <div className="landing-preview-brand"><span /> EduCompass</div>
        <div className="landing-preview-profile">General · Delhi · Rank #5,000</div>
      </div>
      <div className="landing-preview-body">
        <aside className="landing-preview-sidebar" aria-hidden="true">
          <span className="is-active">Matches</span>
          <span>Profile</span>
          <span>Compare</span>
        </aside>
        <main className="landing-preview-main">
          <div className="landing-preview-heading">
            <div>
              <span>YOUR SHORTLIST</span>
              <strong>Best-fit college recommendations</strong>
            </div>
            <button type="button" tabIndex={-1}>Tune priorities</button>
          </div>
          <div className="landing-preview-summary">
            <span><strong>6</strong> decision dimensions</span>
            <span><GitCompareArrows size={13} /> Compare your shortlist</span>
          </div>
          <div className="landing-preview-list">
            {previewColleges.map((college, index) => (
              <article key={college.name} className="landing-preview-card">
                <span className="landing-preview-rank">0{index + 1}</span>
                <div className="landing-preview-fit" aria-label={`${college.fit} fit score`}>
                  <strong>{college.fit}</strong><small>FIT</small>
                </div>
                <div className="landing-preview-college">
                  <div><strong>{college.name}</strong><span>{college.type}</span></div>
                  <p><MapPin size={11} /> Matched for {college.branch}</p>
                </div>
                <div className="landing-preview-metrics"><span>Fees <strong>{college.fee}</strong></span><span>Avg CTC <strong>{college.place}</strong></span></div>
                <Check className="landing-preview-check" size={16} aria-hidden="true" />
              </article>
            ))}
          </div>
          <div className="landing-preview-footer"><span>Transparent fit, not admission probability.</span><ChevronRight size={15} /></div>
        </main>
      </div>
    </div>
  );
}
