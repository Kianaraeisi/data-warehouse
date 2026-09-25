export function ClassificationSection({ form }) {
  return (
    <section id="classification" className="upload-section">
      <h2>1. Datasource Classification</h2>

      <label>Is the datasource spatial?</label>
      <div className="inline-options">
        <label>
          <input
            type="radio"
            checked={form.isSpatial}
            onChange={() => form.setIsSpatial(true)}
          />
          Yes — spatial
        </label>
        <label>
          <input
            type="radio"
            checked={!form.isSpatial}
            onChange={() => form.setIsSpatial(false)}
          />
          No — non-spatial
        </label>
      </div>

      <label>Source Type</label>
      <select
        value={form.sourceType}
        onChange={(event) => form.setSourceType(event.target.value)}
      >
        <option value="file">File upload</option>
        <option value="ogc">OGC service</option>
      </select>

      {form.isSpatial && (
        <>
          <label>Spatial Data Class</label>
          <div className="inline-options">
            <label>
              <input
                type="radio"
                name="dataClass"
                checked={form.dataClass === "vector"}
                onChange={() => form.setDataClass("vector")}
              />
              Vector
            </label>
            <label>
              <input
                type="radio"
                name="dataClass"
                checked={form.dataClass === "raster"}
                onChange={() => form.setDataClass("raster")}
              />
              Raster
            </label>
          </div>
        </>
      )}

      {form.sourceType === "file" ? (
        <>
          <label>Upload File</label>
          <input
            type="file"
            onChange={(event) => form.handleFileChange(event.target.files[0])}
          />

          <label>Format</label>
          <select
            value={form.dataFormat}
            onChange={(event) => form.setDataFormat(event.target.value)}
          >
            <option value="">Select format</option>
            <option value="GeoJSON">GeoJSON</option>
            <option value="JSON">JSON</option>
            <option value="Shapefile">Shapefile</option>
            <option value="GeoPackage">GeoPackage</option>
            <option value="CSV">CSV</option>
            <option value="GeoTIFF">GeoTIFF</option>
            <option value="TIFF">TIFF</option>
          </select>
        </>
      ) : (
        <>
          <label>OGC URL</label>
          <input
            value={form.ogcUrl}
            onChange={(event) => form.setOgcUrl(event.target.value)}
          />

          <label>OGC Type</label>
          <select
            value={form.ogcType}
            onChange={(event) => form.setOgcType(event.target.value)}
          >
            <option value="WFS">WFS</option>
            <option value="WMS">WMS</option>
          </select>
        </>
      )}
    </section>
  );
}
