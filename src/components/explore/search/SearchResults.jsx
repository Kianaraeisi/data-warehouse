import { useEffect, useState } from "react";
import { DatasetCard } from "./DatasetCard";
import { loadDatasourceFeatures } from "../../../services/datasourceApi";

export function SearchResults({ results, error, searching, onResultLoad }) {
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [removedIds, setRemovedIds] = useState(() => new Set());
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const datasets = Array.isArray(results) ? results : [];

  useEffect(() => {
    setSelectedIds(new Set());
    setRemovedIds(new Set());
    setDownloadError("");
  }, [results]);

  const visibleDatasets = datasets.filter((dataset) => !removedIds.has(dataset.id));
  const allSelected =
    visibleDatasets.length > 0 &&
    visibleDatasets.every((dataset) => selectedIds.has(dataset.id));

  const handleSelect = (id, selected) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(
      allSelected ? new Set() : new Set(visibleDatasets.map((dataset) => dataset.id))
    );
  };

  const handleRemove = (id) => {
    setRemovedIds((current) => new Set(current).add(id));
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  };

  const downloadDatasets = async (datasetsToDownload) => {
    if (!datasetsToDownload.length || downloading) return;

    setDownloading(true);
    setDownloadError("");
    try {
      const downloaded = await Promise.all(
        datasetsToDownload.map((dataset) => loadDatasourceFeatures(dataset))
      );
      const blob = new Blob([JSON.stringify({ datasets: downloaded }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `datasets-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (downloadFailure) {
      setDownloadError(
        downloadFailure instanceof Error
          ? downloadFailure.message
          : "Unable to download datasets."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="search-results">
      <div className="results-heading">
        <div>
          <div className="section-kicker">Catalog</div>
          <h2>Results</h2>
        </div>
        <span className="results-count">{results === null ? "—" : visibleDatasets.length}</span>
      </div>

      {error ? (
        <div className="results-empty" role="alert">
          <strong>Unable to load datasets</strong>
          <span>{error}</span>
        </div>
      ) : searching ? (
        <div className="results-empty" role="status" aria-live="polite">
          <div className="empty-state-icon" aria-hidden="true">...</div>
          <strong>Searching catalog</strong>
          <span>Checking datasets against the selected filters.</span>
        </div>
      ) : results === null ? (
        <div className="results-empty">
          <div className="empty-state-icon">⌕</div>
          <strong>Ready to search</strong>
          <span>Choose filters above, then search the dataset catalog.</span>
        </div>
      ) : datasets.length === 0 ? (
        <div className="results-empty">
          <div className="empty-state-icon">∅</div>
          <strong>No datasets found</strong>
          <span>Try removing one or more filters.</span>
        </div>
      ) : visibleDatasets.length === 0 ? (
        <div className="results-empty">
          <strong>No visible datasets</strong>
          <span>All results have been removed from this list.</span>
        </div>
      ) : (
        <>
          <div className="results-toolbar">
            <button
              type="button"
              className="results-select-all"
              onClick={handleSelectAll}
              aria-pressed={allSelected}
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
            <button
              type="button"
              className="results-download-selected"
              onClick={() =>
                downloadDatasets(
                  visibleDatasets.filter((dataset) => selectedIds.has(dataset.id))
                )
              }
              disabled={selectedIds.size === 0 || downloading}
            >
              {downloading ? "Downloading..." : `Download selected (${selectedIds.size})`}
            </button>
          </div>
          {downloadError && (
            <div className="results-empty" role="alert">
              <strong>Unable to download datasets</strong>
              <span>{downloadError}</span>
            </div>
          )}
          <div className="results-list">
            {visibleDatasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onLoad={onResultLoad}
                onDownload={(item) => downloadDatasets([item])}
                selected={selectedIds.has(dataset.id)}
                onSelect={handleSelect}
                onRemove={handleRemove}
                downloading={downloading}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
