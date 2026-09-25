import { DatasetCard } from "./DatasetCard";

export function SearchResults({ results, error, onResultLoad }) {
  const count = Array.isArray(results) ? results.length : 0;

  return (
    <section className="search-results">
      <div className="results-heading">
        <div>
          <div className="section-kicker">Catalog</div>
          <h2>Results</h2>
        </div>
        <span className="results-count">{results === null ? "—" : count}</span>
      </div>

      {error ? (
        <div className="results-empty" role="alert">
          <strong>Unable to load datasets</strong>
          <span>{error}</span>
        </div>
      ) : results === null ? (
        <div className="results-empty">
          <div className="empty-state-icon">⌕</div>
          <strong>Ready to search</strong>
          <span>Choose filters above, then search the dataset catalog.</span>
        </div>
      ) : results.length === 0 ? (
        <div className="results-empty">
          <div className="empty-state-icon">∅</div>
          <strong>No datasets found</strong>
          <span>Try removing one or more filters.</span>
        </div>
      ) : (
        <div className="results-list">
          {results.map((result) => (
            <DatasetCard key={result.id} dataset={result} onLoad={onResultLoad} />
          ))}
        </div>
      )}
    </section>
  );
}
