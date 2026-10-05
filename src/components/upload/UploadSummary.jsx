export function UploadSummary({ form, onSubmit }) {
  return (
    <section id="output" className="upload-section">
      <h2>5. Output / Submit</h2>

      <div className="output-summary">
        <p><strong>Dataset:</strong> {form.name || "Not set"}</p>
        <p><strong>Source:</strong> {form.sourceType}</p>
        <p><strong>Spatial:</strong> {form.isSpatial ? "Yes" : "No"}</p>
        <p><strong>Format:</strong> {form.dataFormat || "Not selected"}</p>
        <p><strong>CRS:</strong> {form.crs}</p>
      </div>

      <button
        type="button"
        className="register-button"
        onClick={onSubmit}
        disabled={form.submitting || !form.hasRequiredSourceInfo}
      >
        {form.submitting ? "Registering..." : "Register Dataset"}
      </button>
    </section>
  );
}
