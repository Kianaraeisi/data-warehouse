import { AOIFilter } from "./AOIFilter";
import { DateFilter } from "./DateFilter";
import { TagFilter } from "./TagFilter";

export function SearchFilters({
  selectedArea,
  onAreaCleared,
  filters,
  onFilterChange,
  onSearch,
  searching,
}) {
  return (
    <div className="search-panel-filters">
      <div className="filters-heading">
        <div>
          <div className="section-kicker">Explore datasets</div>
          <h2>Search filters</h2>
        </div>
        <span className="filters-count">3 filters</span>
      </div>
      <AOIFilter selectedArea={selectedArea} onAreaCleared={onAreaCleared} />
      <DateFilter
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onChange={onFilterChange}
      />
      <TagFilter tags={filters.tags} onChange={onFilterChange} />
      <button
        className="btn-primary search-button"
        onClick={onSearch}
        disabled={searching}
      >
        <span>{searching ? "Searching..." : "Search datasets"}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
