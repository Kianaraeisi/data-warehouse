export function ManifestSection({ form }) {
  return (
    <section id="manifest" className="upload-section">
      <h2>2. Manifest Metadata</h2>

      <div className="form-grid">
        <div>
          <label>Dataset Name</label>
          <input
            value={form.name}
            onChange={(event) => form.setName(event.target.value)}
          />
        </div>
        <div>
          <label>CRS</label>
          <input
            value={form.crs}
            onChange={(event) => form.setCrs(event.target.value)}
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(event) => form.setDescription(event.target.value)}
          />
        </div>
        <div>
          <label>Tags</label>
          <input
            value={form.tags}
            onChange={(event) => form.setTags(event.target.value)}
            placeholder="buildings, urban, 2026"
          />
        </div>
        <div>
          <label>Temporal Start</label>
          <input
            type="date"
            value={form.temporalStart}
            onChange={(event) => form.setTemporalStart(event.target.value)}
          />
        </div>
        <div>
          <label>Temporal End</label>
          <input
            type="date"
            value={form.temporalEnd}
            onChange={(event) => form.setTemporalEnd(event.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
