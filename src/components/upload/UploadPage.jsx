import { useUploadForm } from "../../hooks/useUploadForm";
import { API_BASE_URL } from "../../config/api";
import { ClassificationSection } from "./ClassificationSection";
import { ManifestSection } from "./ManifestSection";
import { ProfilingSection } from "./ProfilingSection";
import { ColumnMappingSection } from "./ColumnMappingSection";
import { UploadSummary } from "./UploadSummary";
import "../../styles/UploadModal.css";

export default function UploadPage({ onBack }) {
  const form = useUploadForm(() => {
    alert("Dataset Registered!");
    onBack();
  });

  const handleProfile = async () => {
    try {
      await form.profileFile();
    } catch {
      // The hook exposes the message in the upload form.
    }
  };

  const handleSubmit = async () => {
    try {
      await form.submit();
    } catch (error) {
      console.error("Upload request failed", error);
    }
  };

  return (
    <div className="upload-page">
      <aside className="upload-sidebar">
        <button type="button" onClick={onBack}>← Back to Explore</button>
        <h2>Upload Dataset</h2>
        <nav className="upload-section-nav">
          <a href="#classification">1. Classification</a>
          <a href="#manifest">2. Manifest</a>
          <a href="#profiling">3. Profiling</a>
          <a href="#mapping">4. Mapping</a>
          <a href="#output">5. Output</a>
        </nav>
      </aside>

      <main className="upload-main">
        <div className="backend-status">
          <strong>Connected Backend</strong>
          <span>{API_BASE_URL}</span>
        </div>

        {form.error && <div className="upload-error" role="alert">{form.error}</div>}
        <ClassificationSection form={form} />
        <ManifestSection form={form} />
        <ProfilingSection form={form} onProfile={handleProfile} />
        <ColumnMappingSection form={form} />
        <UploadSummary form={form} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
