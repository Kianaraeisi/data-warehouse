import { useState } from "react";
import { useUploadForm } from "../../hooks/useUploadForm";
import { API_BASE_URL } from "../../config/api";
import { ClassificationSection } from "./ClassificationSection";
import { ManifestSection } from "./ManifestSection";
import { ProfilingSection } from "./ProfilingSection";
import { ColumnMappingSection } from "./ColumnMappingSection";
import { UploadSummary } from "./UploadSummary";
import "../../styles/UploadModal.css";

const steps = ["Classification", "Manifest", "Profiling", "Mapping", "Summary"];

export default function UploadPage({ onBack }) {
  const [currentStep, setCurrentStep] = useState(0);
  const form = useUploadForm(() => {
    alert("Dataset Registered!");
    onBack();
  });

  const handleNext = () => {
    if (!form.validateStep(currentStep)) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

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
        <nav aria-label="Upload progress">
          <ol className="upload-step-indicator">
            {steps.map((step, index) => {
              const state = index === currentStep
                ? "current"
                : index < currentStep
                ? "completed"
                : "upcoming";

              return (
                <li
                  key={step}
                  className={`upload-step upload-step-${state}`}
                  aria-current={index === currentStep ? "step" : undefined}
                >
                  <span className="upload-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                  <span className="upload-step-status">
                    {state === "completed" ? "Complete" : state === "current" ? "Current" : "Upcoming"}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>

      <main className="upload-main">
        <p className="upload-step-count" aria-live="polite">
          Step {currentStep + 1} of {steps.length}
        </p>
        <div className="backend-status">
          <strong>Connected Backend</strong>
          <span>{API_BASE_URL}</span>
        </div>

        {form.error && <div className="upload-error" role="alert">{form.error}</div>}
        <div className="upload-step-content" hidden={currentStep !== 0}>
          <ClassificationSection form={form} />
        </div>
        <div className="upload-step-content" hidden={currentStep !== 1}>
          <ManifestSection form={form} />
        </div>
        <div className="upload-step-content" hidden={currentStep !== 2}>
          <ProfilingSection form={form} onProfile={handleProfile} />
        </div>
        <div className="upload-step-content" hidden={currentStep !== 3}>
          <ColumnMappingSection form={form} />
        </div>
        <div className="upload-step-content" hidden={currentStep !== 4}>
          <UploadSummary form={form} onSubmit={handleSubmit} />
        </div>
        <div className="upload-wizard-actions">
          <button
            type="button"
            className="upload-wizard-back"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Back
          </button>
          {currentStep < steps.length - 1 && (
            <button type="button" className="upload-wizard-next" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
