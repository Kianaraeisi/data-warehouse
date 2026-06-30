import "../styles/SearchPanel.css";

export function SearchPanel({
  selectedArea,
  onAreaCleared,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  tags,
  onTagsChange,
  onSearch,
  searching,
  results,
  onResultLoad,
  onUploadClick,
}) {
  return (
    <aside className="search-panel">
      <div className="search-panel-header">
        <h1>🌍 DataWarehouse</h1>
        <button onClick={onUploadClick} className="btn-secondary">
          + Upload
        </button>
      </div>

      <div className="search-panel-filters">
        <div className="section-title">📍 Area of Interest</div>

        {selectedArea ? (
          <div className="aoi-section aoi-selected">
            <div className="aoi-status">✔ AOI Selected on map</div>
            {selectedArea.coordinates && selectedArea.coordinates.length > 0 && (
              <div className="aoi-coords">
                {selectedArea.coordinates.map((coord, idx) => (
                  <div key={idx} className="coord-item">
                    <span className="coord-index">{idx + 1}.</span>
                    <span>
                      Lat: {coord.lat}°<br />
                      Lon: {coord.lng}°
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button className="btn-secondary" onClick={onAreaCleared} style={{ padding: "5px 0", fontSize: 11, width: "100%", marginTop: 8 }}>
              ✕ Clear area
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 12, marginBottom: 16, color: "var(--text-muted)" }}>
            Draw on map...
          </div>
        )}

        <div className="section-title">📅 Date Range</div>
        <div className="date-range">
          <input type="date" value={dateFrom} onChange={(e) => onDateFromChange(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => onDateToChange(e.target.value)} />
        </div>

        <div className="section-title">🏷 Tags</div>
        <input type="text" placeholder="e.g. flood, urban" value={tags} onChange={(e) => onTagsChange(e.target.value)} className="tags-input" />

        <button className="btn-primary search-button" onClick={onSearch} disabled={searching}>
          {searching ? "Searching..." : "🔍 Search Datasets"}
        </button>
      </div>

      <div className="search-results">
        <div className="section-title">📋 Results {results && `(${results.length})`}</div>

        {results === null ? (
          <div className="results-empty">No search executed.</div>
        ) : results.length === 0 ? (
          <div className="results-empty">No data found.</div>
        ) : (
          results.map((r, i) => (
            <div key={i} className="result-item">
              <div className="result-item-name">{r.name}</div>
              <div className="result-item-date">{r.date}</div>

              <div className="result-item-actions">
                <button onClick={() => onResultLoad(r)} className="btn-secondary">
                  👁 Load
                </button>
                <button className="btn-primary">↓ Download</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="search-panel-footer">🟢 All Datasets: Connected & Ready</div>
    </aside>
  );
}
