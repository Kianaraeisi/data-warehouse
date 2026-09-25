export function DateFilter({ dateFrom, dateTo, onChange }) {
  return (
    <section className="filter-section">
      <div className="filter-section-heading compact-heading">
        <div>
          <div className="section-kicker">Temporal filter</div>
          <div className="section-title">Date range</div>
        </div>
      </div>
      <div className="date-range">
        <label className="field-group">
          <span>From</span>
          <input type="date" value={dateFrom} onChange={(event) => onChange("dateFrom", event.target.value)} />
        </label>
        <label className="field-group">
          <span>To</span>
          <input type="date" value={dateTo} onChange={(event) => onChange("dateTo", event.target.value)} />
        </label>
      </div>
    </section>
  );
}
