import { useState } from "react";
import { MapPanel } from "./components/MapPanel";
import { UploadModal } from "./components/UploadModal";
import { SearchPanel } from "./components/SearchPanel";
import "./styles/index.css";

export default function App() {
  const [selectedArea, setSelectedArea] = useState(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [tags, setTags] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loadedFeature, setLoadedFeature] = useState(null);

  const handleSearch = async () => {
    const payload = {
      polygon: selectedArea?.geojson || null,
      datarange: {
        from: dateFrom || "all",
        to: dateTo || "all",
      },
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setSearching(true);
    setLoadedFeature(null);

    try {
      const res = await fetch("http://localhost:8000/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.warn("Backend not running at :8000. Using mock data.");
      setTimeout(() => {
        const mock = Array.from({ length: 4 }, (_, i) => ({
          id: `DS_${i}`,
          name: `Dataset_Turin_${i}`,
          date: "2024-01-01",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [7.6, 45.0],
                [7.7, 45.0],
                [7.7, 45.1],
                [7.6, 45.1],
                [7.6, 45.0],
              ],
            ],
          },
          properties: {
            resolution: "10m",
            cloudCover: "5%",
            source: "Sentinel-2",
          },
        }));
        setResults(mock);
        setSearching(false);
      }, 1000);
      return;
    }
    setSearching(false);
  };

  return (
    <div className="main-layout">
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}

      <SearchPanel
        selectedArea={selectedArea}
        onAreaCleared={() => setSelectedArea(null)}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        tags={tags}
        onTagsChange={setTags}
        onSearch={handleSearch}
        searching={searching}
        results={results}
        onResultLoad={setLoadedFeature}
        onUploadClick={() => setUploadOpen(true)}
      />

      <main className="main-content">
        <MapPanel
          onAreaSelected={setSelectedArea}
          onAreaCleared={() => setSelectedArea(null)}
          results={results}
          loadedFeature={loadedFeature}
        />
      </main>
    </div>
  );
}
