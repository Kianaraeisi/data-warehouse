export function ProfilingSection({ form, onProfile }) {
  return (
    <section id="profiling" className="upload-section">
      <h2>3. Profiling</h2>

      <div className="profile-cards">
        <div>
          <span>Columns</span>
          <strong>{form.columnCount}</strong>
        </div>
        <div>
          <span>Features</span>
          <strong>{form.featureCount}</strong>
        </div>
        <div>
          <span>Geometry Type</span>
          <strong>{form.geometryType || "—"}</strong>
        </div>
        <div>
          <span>Detected CRS</span>
          <strong>{form.crs || "—"}</strong>
        </div>
      </div>

      <label>Geometry Type</label>
      <select
        value={form.geometryType}
        onChange={(event) => form.setGeometryType(event.target.value)}
      >
        <option value="Point">Point</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <option value="MultiPoint">MultiPoint</option>
        <option value="MultiLineString">MultiLineString</option>
        <option value="MultiPolygon">MultiPolygon</option>
      </select>

      <div className="bbox-actions">
        <button type="button" onClick={onProfile}>
          Calculate BBox from File
        </button>
        <button type="button" onClick={form.setTorinoBounds}>
          Use Torino bounds
        </button>
      </div>

      <div className="bbox-grid">
        <div><span>West</span><strong>{form.bbox.xmin}</strong></div>
        <div><span>South</span><strong>{form.bbox.ymin}</strong></div>
        <div><span>East</span><strong>{form.bbox.xmax}</strong></div>
        <div><span>North</span><strong>{form.bbox.ymax}</strong></div>
      </div>

      <h3>Detected Columns</h3>
      <div className="detected-columns">
        {form.detectedColumns.length > 0 ? (
          form.detectedColumns.map((column) => <span key={column}>{column}</span>)
        ) : (
          <span>No columns detected yet.</span>
        )}
      </div>
    </section>
  );
}
