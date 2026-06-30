import { useState } from "react";
import "../../styles/UploadModal.css";

export function UploadModal({ onClose }) {
  const [sourceType, setSourceType] = useState("file");
  const [file, setFile] = useState(null);
  const [ogcUrl, setOgcUrl] = useState("");
  const [ogcType, setOgcType] = useState("WFS");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [desc, setDesc] = useState("");
  const [crs, setCrs] = useState("EPSG:4326");
  const [isSpatial, setIsSpatial] = useState(true);
  const [geomType, setGeomType] = useState("Polygon");
  const [bbox, setBbox] = useState({ xmin: 0, ymin: 0, xmax: 0, ymax: 0 });

  const handleCalcBbox = async () => {
    if (!file) return alert("Please select a file first.");

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      let lons = [];
      let lats = [];

      const extract = (arr) => {
        if (typeof arr[0] === "number") {
          lons.push(arr[0]);
          lats.push(arr[1]);
        } else {
          arr.forEach(extract);
        }
      };

      if (json.features) {
        json.features.forEach((f) => {
          if (f.geometry) extract(f.geometry.coordinates);
        });
      } else if (json.geometry) {
        extract(json.geometry.coordinates);
      }

      if (lons.length > 0) {
        setBbox({
          xmin: Math.min(...lons).toFixed(6),
          ymin: Math.min(...lats).toFixed(6),
          xmax: Math.max(...lons).toFixed(6),
          ymax: Math.max(...lats).toFixed(6),
        });
      } else {
        alert("No coordinates found.");
      }
    } catch (e) {
      alert("Invalid GeoJSON file.");
    }
  };

  const handleSubmit = async () => {
    if (!name) return alert("Name is required.");

    const payload = {
      name,
      tags: tags.split(",").map((t) => t.trim()),
      desc,
      sourceType,
      ogcUrl,
      ogcType,
      isSpatial,
      geomType,
      crs,
      bbox,
    };

    try {
      await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("Dataset Registered!");
      onClose();
    } catch (e) {
      console.log("Mock upload successful (Backend offline).");
      alert("Dataset Registered (Mock)!");
      onClose();
    }
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-content">
        <div className="upload-modal-header">
          <h2>Upload Dataset</h2>
          <button onClick={onClose} className="btn-secondary">✕</button>
        </div>

        <div className="source-type-options">
          <label>
            <input type="radio" checked={sourceType === "file"} onChange={() => setSourceType("file")} />
            File (FTP)
          </label>
          <label>
            <input type="radio" checked={sourceType === "ogc"} onChange={() => setSourceType("ogc")} />
            OGC Service
          </label>
        </div>

        {sourceType === "file" ? (
          <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ marginBottom: 16 }} />
        ) : (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <input type="text" placeholder="OGC URL..." value={ogcUrl} onChange={(e) => setOgcUrl(e.target.value)} />
            <select value={ogcType} onChange={(e) => setOgcType(e.target.value)} style={{ background: "var(--card)", color: "#fff", border: "1px solid var(--border)" }}>
              <option>WFS</option>
              <option>WMS</option>
              <option>WCS</option>
            </select>
          </div>
        )}

        <div className="upload-form-grid">
          <div>
            <label>Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label>Tags (comma separated)</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div>
            <label>Description</label>
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
        </div>

        <div className="spatial-section">
          <label>
            <input type="checkbox" checked={isSpatial} onChange={(e) => setIsSpatial(e.target.checked)} />
            Spatial Dataset
          </label>
          {isSpatial && (
            <div style={{ marginTop: 10 }}>
              <div className="bbox-grid">
                <div>
                  <label>W (xmin)</label>
                  <input type="number" value={bbox.xmin} onChange={(e) => setBbox({ ...bbox, xmin: e.target.value })} />
                </div>
                <div>
                  <label>S (ymin)</label>
                  <input type="number" value={bbox.ymin} onChange={(e) => setBbox({ ...bbox, ymin: e.target.value })} />
                </div>
                <div>
                  <label>E (xmax)</label>
                  <input type="number" value={bbox.xmax} onChange={(e) => setBbox({ ...bbox, xmax: e.target.value })} />
                </div>
                <div>
                  <label>N (ymax)</label>
                  <input type="number" value={bbox.ymax} onChange={(e) => setBbox({ ...bbox, ymax: e.target.value })} />
                </div>
              </div>
              <button onClick={handleCalcBbox} className="btn-secondary" style={{ width: "100%", padding: 8 }}>
                Calculate BBox from File
              </button>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} className="btn-primary" style={{ width: "100%", padding: 12 }}>
          Register Dataset
        </button>
      </div>
    </div>
  );
}
