export function ColumnMappingSection({ form }) {
  return (
    <section id="mapping" className="upload-section">
      <h2>4. Column Mapping</h2>

      <label>Primary Key Strategy</label>
      <select
        value={form.primaryKeyStrategy}
        onChange={(event) => form.setPrimaryKeyStrategy(event.target.value)}
      >
        <option value="uuid">UUID per row</option>
        <option value="existing">Use existing column</option>
        <option value="serial">Serial</option>
      </select>

      <label>Foreign Key Column</label>
      <select
        value={form.foreignKeyColumn}
        onChange={(event) => form.setForeignKeyColumn(event.target.value)}
      >
        <option value="">None</option>
        {form.detectedColumns.map((column) => (
          <option key={column} value={column}>{column}</option>
        ))}
      </select>

      <label>Geometry Column</label>
      <select defaultValue="geometry">
        <option value="geometry">geometry</option>
      </select>

      <label>JSONB Attributes</label>
      <div className="mapping-box">Detected non-spatial columns will appear here.</div>

      <label>Drop Columns</label>
      <div className="mapping-box">Select columns to exclude.</div>
    </section>
  );
}
