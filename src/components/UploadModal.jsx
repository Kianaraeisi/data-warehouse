import { useState } from "react";
import { fromArrayBuffer } from "geotiff";
import shp from "shpjs";
import proj4 from "proj4";

import "../styles/UploadModal.css";
const API_BASE_URL = "http://130.192.238.11:8008";

export function UploadModal({ onClose }) {
  const [sourceType, setSourceType] = useState("file");
  const [file, setFile] = useState(null);
  const [dataType, setDataType] = useState("");
  const [dataFormat, setDataFormat] = useState("");
  const [detectedGeomType, setDetectedGeomType] = useState("");
  const [ogcUrl, setOgcUrl] = useState("");
  const [ogcType, setOgcType] = useState("WFS");
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [desc, setDesc] = useState("");
  const [crs, setCrs] = useState("EPSG:4326");
  const [targetCrs, setTargetCrs] = useState("EPSG:4326");
  const [isSpatial, setIsSpatial] = useState(true);
  const [geomType, setGeomType] = useState("Polygon");
  const [bbox, setBbox] = useState({ xmin: 0, ymin: 0, xmax: 0, ymax: 0 });
  const [profile, setProfile] = useState({featureCount: 0,columns: [],});
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const detectFileInfo = async (selectedFile) => {
  if (!selectedFile) return;

  const extension = selectedFile.name.split(".").pop().toLowerCase();

  setDataType("");
  setDataFormat("");
  setDetectedGeomType("");
  setCrs("Unknown");
  setProfile({
    featureCount: 0,
    columns: [],
  });

  if (extension === "geojson" || extension === "json") {
    setDataFormat("GeoJSON");
    setDataType("Vector");

    try {
      const text = await selectedFile.text();
      const json = JSON.parse(text);

      let features = [];

      if (json.type === "FeatureCollection") {
        features = json.features || [];
      } else if (json.type === "Feature") {
        features = [json];
      }

      const geometryTypes = [
        ...new Set(
          features
            .map((feature) => feature?.geometry?.type)
            .filter(Boolean)
        ),
      ];

      if (geometryTypes.length === 1) {
        setDetectedGeomType(geometryTypes[0]);
      } else if (geometryTypes.length > 1) {
        setDetectedGeomType(`Mixed (${geometryTypes.join(", ")})`);
      } else {
        setDetectedGeomType("Unknown");
      }

      if (json.crs?.properties?.name) {
        setCrs(json.crs.properties.name);
      } else {
        setCrs("EPSG:4326");
      }

      const columns = new Set();

      features.forEach((feature) => {
        Object.keys(feature.properties || {}).forEach((key) => {
          columns.add(key);
        });
      });

      setProfile({
  featureCount: features.length,
  columns: [...columns],
});

setSelectedAttributes([...columns]);

      const xs = [];
      const ys = [];

      const extractCoordinates = (coords) => {
        if (!Array.isArray(coords)) return;

        if (
          coords.length >= 2 &&
          typeof coords[0] === "number" &&
          typeof coords[1] === "number"
        ) {
          xs.push(coords[0]);
          ys.push(coords[1]);
          return;
        }

        coords.forEach(extractCoordinates);
      };

      features.forEach((feature) => {
        if (feature?.geometry?.coordinates) {
          extractCoordinates(feature.geometry.coordinates);
        }
      });

      if (xs.length && ys.length) {
        setBbox({
          xmin: Math.min(...xs).toFixed(6),
          ymin: Math.min(...ys).toFixed(6),
          xmax: Math.max(...xs).toFixed(6),
          ymax: Math.max(...ys).toFixed(6),
        });
      }
    } catch (error) {
      console.error(error);
      setDataType("Unknown");
      setDataFormat("Invalid GeoJSON");
      setDetectedGeomType("Unknown");
      setCrs("Unknown");
    }

    return;
  }

  if (extension === "shp" || extension === "zip") {
  setDataType("Vector");
  setDataFormat("Shapefile");

  try {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const geojson = await shp(arrayBuffer);

    const features =
      geojson?.type === "FeatureCollection"
        ? geojson.features || []
        : [];

    // Geometry Type
    const geometryTypes = [
      ...new Set(
        features
          .map((feature) => feature?.geometry?.type)
          .filter(Boolean)
      ),
    ];

    if (geometryTypes.length === 1) {
      setDetectedGeomType(geometryTypes[0]);
    } else if (geometryTypes.length > 1) {
      setDetectedGeomType(`Mixed (${geometryTypes.join(", ")})`);
    } else {
      setDetectedGeomType("Unknown");
    }

    // Profiling
    const columns = new Set();

    features.forEach((feature) => {
      Object.keys(feature.properties || {}).forEach((key) => {
        columns.add(key);
      });
    });

    setProfile({
      featureCount: features.length,
      columns: [...columns],
    });

    // Bounding Box
    const xs = [];
    const ys = [];

    const extractCoordinates = (coords) => {
      if (!Array.isArray(coords)) return;

      if (
        coords.length >= 2 &&
        typeof coords[0] === "number" &&
        typeof coords[1] === "number"
      ) {
        xs.push(coords[0]);
        ys.push(coords[1]);
        return;
      }

      coords.forEach(extractCoordinates);
    };

    features.forEach((feature) => {
      if (feature?.geometry?.coordinates) {
        extractCoordinates(feature.geometry.coordinates);
      }
    });

    if (xs.length && ys.length) {
      setBbox({
        xmin: Math.min(...xs).toFixed(6),
        ymin: Math.min(...ys).toFixed(6),
        xmax: Math.max(...xs).toFixed(6),
        ymax: Math.max(...ys).toFixed(6),
      });
    }

    // shpjs may reproject to WGS84 when .prj exists
    setCrs("EPSG:4326");
  } catch (error) {
    console.error("Shapefile profiling error:", error);

    setDetectedGeomType("Unknown");
    setCrs("Unknown");
  }

  return;
}

  if (extension === "tif" || extension === "tiff") {
  setDataType("Raster");
  setDataFormat("GeoTIFF");
  setDetectedGeomType("N/A");

  try {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const tiff = await fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();

    // Bounding Box
    const tiffBbox = image.getBoundingBox();

    if (tiffBbox?.length === 4) {
      setBbox({
        xmin: tiffBbox[0].toFixed(6),
        ymin: tiffBbox[1].toFixed(6),
        xmax: tiffBbox[2].toFixed(6),
        ymax: tiffBbox[3].toFixed(6),
      });
    }

    // CRS
    const geoKeys = image.getGeoKeys();

    if (geoKeys?.ProjectedCSTypeGeoKey) {
      setCrs(`EPSG:${geoKeys.ProjectedCSTypeGeoKey}`);
    } else if (geoKeys?.GeographicTypeGeoKey) {
      setCrs(`EPSG:${geoKeys.GeographicTypeGeoKey}`);
    } else {
      setCrs("Unknown");
    }

    // Basic raster profiling
    setProfile({
      featureCount: 0,
      columns: [
        `Width: ${image.getWidth()}`,
        `Height: ${image.getHeight()}`,
        `Bands: ${image.getSamplesPerPixel()}`,
      ],
    });
  } catch (error) {
    console.error("GeoTIFF profiling error:", error);
    setCrs("Unknown");
  }

  return;
}

  if (extension === "csv") {
    setDataType("Tabular");
    setDataFormat("CSV");
    setDetectedGeomType("N/A");
    setCrs("N/A");
    return;
  }

  setDataType("Unknown");
  setDataFormat(extension.toUpperCase() || "Unknown");
  setDetectedGeomType("Unknown");
  setCrs("Unknown");

  // GEOJSON / JSON
  if (extension === "geojson" || extension === "json") {
    setDataFormat("GeoJSON");
    setDataType("Vector");

    try {
      const text = await selectedFile.text();
      const json = JSON.parse(text);

      let features = [];

      if (json.type === "FeatureCollection") {
        features = json.features || [];
      } else if (json.type === "Feature") {
        features = [json];
      }

      // Geometry Type
      const geometryTypes = [
        ...new Set(
          features
            .map((f) => f?.geometry?.type)
            .filter(Boolean)
        ),
      ];

      if (geometryTypes.length === 1) {
        setDetectedGeomType(geometryTypes[0]);
      } else if (geometryTypes.length > 1) {
        setDetectedGeomType(`Mixed (${geometryTypes.join(", ")})`);
      } else {
        setDetectedGeomType("Unknown");
      }

      // CRS
      // Modern GeoJSON is normally WGS84 / EPSG:4326
      if (json.crs?.properties?.name) {
        setCrs(json.crs.properties.name);
      } else {
        setCrs("EPSG:4326");
      }

      // Profiling
      const columns = new Set();

      features.forEach((feature) => {
        Object.keys(feature.properties || {}).forEach((key) => {
          columns.add(key);
        });
      });

      setProfile({
        featureCount: features.length,
        columns: [...columns],
      });

      // Bounding Box
      const xs = [];
      const ys = [];

      const extractCoordinates = (coords) => {
        if (!Array.isArray(coords)) return;

        if (
          coords.length >= 2 &&
          typeof coords[0] === "number" &&
          typeof coords[1] === "number"
        ) {
          xs.push(coords[0]);
          ys.push(coords[1]);
          return;
        }

        coords.forEach(extractCoordinates);
      };

      features.forEach((feature) => {
        if (feature?.geometry?.coordinates) {
          extractCoordinates(feature.geometry.coordinates);
        }
      });

      if (xs.length && ys.length) {
        setBbox({
          xmin: Math.min(...xs).toFixed(6),
          ymin: Math.min(...ys).toFixed(6),
          xmax: Math.max(...xs).toFixed(6),
          ymax: Math.max(...ys).toFixed(6),
        });
      }
    } catch (error) {
      console.error(error);
      setDataType("Unknown");
      setDataFormat("Invalid GeoJSON");
      setDetectedGeomType("Unknown");
      setCrs("Unknown");
    }

    return;
  }

  // SHAPEFILE
  if (extension === "shp") {
    setDataType("Vector");
    setDataFormat("Shapefile");
    setDetectedGeomType("Unknown");
    setCrs("Unknown — .prj file required");
    return;
  }

  // GEOTIFF
  if (extension === "tif" || extension === "tiff") {
    setDataType("Raster");
    setDataFormat("GeoTIFF");
    setDetectedGeomType("N/A");
    setCrs("Unknown");
    return;
  }

  // CSV
  if (extension === "csv") {
    setDataType("Tabular");
    setDataFormat("CSV");
    setDetectedGeomType("N/A");
    setCrs("N/A");
    return;
  }

  setDataType("Unknown");
  setDataFormat(extension.toUpperCase() || "Unknown");
  setDetectedGeomType("Unknown");
  setCrs("Unknown");
};


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
    const reprojectPoint = (x, y) => {
  if (!crs || !targetCrs || crs === targetCrs) {
    return [x, y];
  }

  try {
    return proj4(crs, targetCrs, [x, y]);
  } catch (error) {
    console.error("Reprojection error:", error);
    return [x, y];
  }
};
    const payload = {
      registry: {
        name,
        description: desc,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        crs,
        temporal_start: null,
        temporal_end: null,
        crs: crs,
target_crs: targetCrs,
      },
      source: {
        type: sourceType,
        filename: file?.name || null,
        format: file?.name?.split(".").pop() || null,
        ogc_url: sourceType === "ogc" ? ogcUrl : null,
        ogc_type: sourceType === "ogc" ? ogcType : null,
      },
      spatial_footprint: isSpatial
        ? {
            type: "Polygon",
            coordinates: [[
              [Number(bbox.xmin), Number(bbox.ymin)],
              [Number(bbox.xmax), Number(bbox.ymin)],
              [Number(bbox.xmax), Number(bbox.ymax)],
              [Number(bbox.xmin), Number(bbox.ymax)],
              [Number(bbox.xmin), Number(bbox.ymin)],
            ]],
          }
        : null,
      datasource_class: {
  is_spatial: isSpatial,
  data_class: dataType
    ? dataType.toLowerCase()
    : "unknown",
  format: dataFormat || "Unknown",
  geometry_type: detectedGeomType || null,
},
      manifest: {
  profile: {
    feature_count: profile.featureCount,
    columns: profile.columns,
  },
  attributes: selectedAttributes.reduce((acc, column) => {
  acc[column] = true;
  return acc;
}, {}),
},
      features: [],
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/datasources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Upload request failed: ${res.status}`);
      }

      alert("Dataset Registered!");
      onClose();
    } catch (e) {
      console.error("Upload request failed", e);
      alert("Dataset registration failed. Please try again.");
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
          <>
          <input type="file" onChange={(e) => {
  const selectedFile = e.target.files[0];
  setFile(selectedFile);
  detectFileInfo(selectedFile);
}} style={{ marginBottom: 16 }} />
{file && (
  <div className="upload-profile">
    <h4>Data Profile</h4>

    <p><strong>Data Type:</strong> {dataType || "Unknown"}</p>
    <p><strong>Data Format:</strong> {dataFormat || "Unknown"}</p>
    <p><strong>Geometry Type:</strong> {detectedGeomType || "Unknown"}</p>
    <p><strong>CRS:</strong> {crs || "Unknown"}</p>
    <p><strong>Feature Count:</strong> {profile.featureCount}</p>

    <p>
      <strong>Detected Columns:</strong>{" "}
      {profile.columns.length
        ? profile.columns.join(", ")
        : "None detected"}
    </p>

    <p>
      <strong>Bounding Box:</strong>{" "}
      {bbox.xmin}, {bbox.ymin}, {bbox.xmax}, {bbox.ymax}
    </p>
  </div>
)}

{file && profile.columns.length > 0 && (
  <div className="upload-mapping">
    <h4>Attributes Mapping</h4>

    <p>
      Non-spatial columns will be stored in
      <strong> attributes JSONB</strong>.
    </p>

    {profile.columns.map((column) => (
  <div key={column}>
    <label>
      <input
        type="checkbox"
        checked={selectedAttributes.includes(column)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedAttributes((prev) => [...prev, column]);
          } else {
            setSelectedAttributes((prev) =>
              prev.filter((item) => item !== column)
            );
          }
        }}
      />
      {" "}
      {column}
    </label>
  </div>
))}
</div>
)}
  {file && profile.columns.length > 0 && (
  <div className="upload-mapping">
    <h4>Data Mapping</h4>
    <label>
  Target CRS
  <input
  type="text"
  value={targetCrs}
  onChange={(e) => setTargetCrs(e.target.value)}
  style={{ marginLeft: 8 }}
/>
</label>

<br />
<br />

    <label>
      Primary Key
      <select style={{ marginLeft: 8 }}>
        <option value="">Auto</option>
        {profile.columns.map((column) => (
          <option key={column} value={column}>
            {column}
          </option>
        ))}
      </select>
    </label>

    <br /><br />

    <label>
      Geometry Column
      <select style={{ marginLeft: 8 }}>
        <option value="geometry">geometry</option>
      </select>
    </label>
  </div>
)}

</>
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

