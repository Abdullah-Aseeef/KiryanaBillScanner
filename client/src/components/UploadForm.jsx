import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { uploadImage } from '../api';
import './UploadForm.css';

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function UploadForm({ onUploadSuccess = null }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl]
  );

  const validateAndSetFile = (candidate) => {
    if (!candidate) return;

    if (!candidate.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (candidate.size > 10 * 1024 * 1024) {
      setError('Image is too large. Maximum allowed size is 10MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setError('');
    setPreviewUrl(URL.createObjectURL(candidate));
    setFile(candidate);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const droppedFile = event.dataTransfer?.files?.[0];
    validateAndSetFile(droppedFile);
  };

  const onDropZoneKeyDown = (event) => {
    if (file) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  const onFileInputChange = (event) => {
    const chosenFile = event.target.files?.[0];
    validateAndSetFile(chosenFile);
  };

  const openFilePicker = () => {
    if (uploading) return;
    inputRef.current?.click();
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl('');
    setFile(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file || uploading) return;

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadImage(formData);

      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      clearPreview();
    } catch (err) {
      const apiMessage = err?.response?.data?.error;
      setError(apiMessage || err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const hasFile = Boolean(file);

  return (
    <section className="upload-form fade-in">
      <div className="upload-header">
        <h2>Upload Bill</h2>
        <p className="upload-subtitle">Drop a clear bill photo to parse items with Gemini</p>
      </div>

      <input
        ref={inputRef}
        className="file-input-hidden"
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        disabled={uploading}
      />

      <button
        type="button"
        className={`drop-zone ${dragActive ? 'drag-active' : ''} ${hasFile ? 'has-preview' : ''}`}
        onClick={hasFile ? undefined : openFilePicker}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        onKeyDown={onDropZoneKeyDown}
        disabled={uploading}
      >
        {hasFile ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Bill preview" className="preview-image" />
            <div className="preview-overlay">
              <div>
                <div className="preview-filename">{file.name}</div>
                <div className="preview-size">{formatFileSize(file.size)}</div>
              </div>
              <button
                type="button"
                className="btn-clear-preview"
                onClick={clearPreview}
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="drop-content">
            <div className="drop-icon">🧾</div>
            <div className="drop-text">Click or drag image here</div>
            <div className="drop-hint">We will extract line items and estimated totals</div>
            <div className="drop-formats">PNG, JPG, WEBP up to 10MB</div>
          </div>
        )}
      </button>

      {error && <div className="upload-error">{error}</div>}

      <button
        type="button"
        className="btn-upload"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? (
          <>
            <span className="btn-spinner"></span>
            {' '}
            Processing with Gemini...
          </>
        ) : (
          'Upload & Parse Bill'
        )}
      </button>

      {uploading && (
        <div className="processing-note">
          <div className="processing-bar">
            <div className="processing-bar-fill"></div>
          </div>
          AI extraction can take up to a minute for complex images.
        </div>
      )}
    </section>
  );
}

export default UploadForm;

UploadForm.propTypes = {
  onUploadSuccess: PropTypes.func,
};
