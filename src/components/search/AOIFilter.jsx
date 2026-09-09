export function AOIFilter({ selectedArea, onAreaCleared }) {
  return (
    <section className="filter-section">
      <div className="filter-section-heading">
        <div>
          <div className="section-kicker">Spatial filter</div>
          <div className="section-title">Area of Interest</div>
        </div>
        <span className={`status-dot ${selectedArea ? "status-dot-active" : ""}`} />
      </div>

      {selectedArea ? (
        <div className="aoi-selected-card">
          <div className="aoi-status-row">
            <div>
              <strong>AOI selected</strong>
              <span>Search will use the drawn geometry</span>
            </div>
            <span className="status-badge">Ready</span>
          </div>

          {selectedArea.coordinates?.length > 0 && (
            <details className="aoi-details">
              <summary>View {selectedArea.coordinates.length} coordinates</summary>
              <div className="aoi-coords">
                {selectedArea.coordinates.map((coord, idx) => (
                  <div key={idx} className="coord-item">
                    <span className="coord-index">{idx + 1}</span>
                    <span>{coord.lat}°, {coord.lng}°</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          <button className="btn-ghost clear-area-button" onClick={onAreaCleared}>
            Clear selected area
          </button>
        </div>
      ) : (
        <div className="aoi-empty-state">
          <div className="aoi-empty-icon">⌁</div>
          <div>
            <strong>No area selected</strong>
            <span>Draw a polygon or rectangle on the map.</span>
          </div>
        </div>
      )}
    </section>
  );
}
