export function DatasetCard({
  dataset,
  onLoad,
  onDownload,
  selected,
  onSelect,
  onRemove,
  downloading,
}) {
  return (
    <article className="result-item">
      <div className="result-item-topline">
        <label className="dataset-select">
          <input
            type="checkbox"
            checked={selected}
            onChange={(event) => onSelect(dataset.id, event.target.checked)}
            aria-label={`Select ${dataset.name} for download`}
          />
          <span className="dataset-type-pill">Dataset</span>
        </label>
        <div className="result-item-meta">
          <span className="result-item-date">{dataset.date || "No date"}</span>
          <button
            type="button"
            className="result-item-remove"
            onClick={() => onRemove(dataset.id)}
            aria-label={`Remove ${dataset.name} from results`}
            title="Remove dataset"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="result-item-name">{dataset.name}</div>
      <div className="result-item-actions">
        <button onClick={() => onLoad(dataset)} className="btn-secondary">View on map</button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => onDownload(dataset)}
          disabled={downloading}
        >
          Download
        </button>
      </div>
    </article>
  );
}
