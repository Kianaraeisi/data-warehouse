export function TagFilter({ tags, onChange }) {
  return (
    <section className="filter-section">
      <div className="filter-section-heading compact-heading">
        <div>
          <div className="section-kicker">Metadata filter</div>
          <div className="section-title">Tags</div>
        </div>
      </div>
      <label className="field-group">
        <span>Keywords</span>
        <input
          type="text"
          placeholder="e.g. flood, urban, buildings"
          value={tags}
          onChange={(event) => onChange("tags", event.target.value)}
          className="tags-input"
        />
      </label>
      <div className="field-hint">Separate multiple tags with commas.</div>
    </section>
  );
}
