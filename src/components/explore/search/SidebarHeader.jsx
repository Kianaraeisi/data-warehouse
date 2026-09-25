export function SidebarHeader({ onUploadClick }) {
  return (
    <header className="search-panel-header">
      <div className="brand-block">
        <div className="brand-mark">EC</div>
        <div>
          <div className="brand-eyebrow">Spatial Data Warehouse</div>
          <h1>Dataset Explorer</h1>
        </div>
      </div>
      <button onClick={onUploadClick} className="btn-primary upload-trigger">
        <span className="upload-trigger-icon">＋</span>
        Upload
      </button>
    </header>
  );
}
