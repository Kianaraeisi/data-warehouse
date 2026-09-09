export function DatasetCard({ dataset, onLoad }) {
  return (
    <article className="result-item">
      <div className="result-item-topline">
        <span className="dataset-type-pill">Dataset</span>
        <span className="result-item-date">{dataset.date || "No date"}</span>
      </div>

      <div className="result-item-name">{dataset.name}</div>

      <div className="result-item-actions">
        <button onClick={() => onLoad(dataset)} className="btn-secondary">
          View on map
        </button>
        <button className="btn-ghost">Download</button>
      </div>
    </article>
  );
}
