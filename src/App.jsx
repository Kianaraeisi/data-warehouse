import { useState } from "react";
import { MapPanel } from "./components/MapPanel";
import { UploadModal } from "./components/UploadModal";
import { SearchPanel } from "./components/SearchPanel";
import { useDatasetSearch } from "./hooks/useDatasetSearch";
import { useDatasetFeatures } from "./hooks/useDatasetFeatures";
import "./styles/index.css";

export default function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const searchState = useDatasetSearch(selectedArea);
  const featureState = useDatasetFeatures();

  const handleSearch = async () => {
    featureState.clearLoadedFeature();
    await searchState.search();
  };

  return (
    <div className="main-layout">
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}

      <SearchPanel
        selectedArea={selectedArea}
        onAreaCleared={() => setSelectedArea(null)}
        filters={searchState.filters}
        onFilterChange={searchState.updateFilter}
        onSearch={handleSearch}
        searching={searchState.searching}
        results={searchState.results}
        onResultLoad={featureState.loadResult}
        onUploadClick={() => setUploadOpen(true)}
      />

      <main className="main-content">
        <MapPanel
          onAreaSelected={setSelectedArea}
          onAreaCleared={() => setSelectedArea(null)}
          results={searchState.results}
          loadedFeature={featureState.loadedFeature}
        />
      </main>
    </div>
  );
}
