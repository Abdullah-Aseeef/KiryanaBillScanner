import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { uploadImage, uploadAudio } from '../api';
import { useLanguage } from '../context/LanguageContext';
import WhatsAppCTA from './WhatsAppCTA';
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
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const { t } = useLanguage();

  const [mode, setMode] = useState('photo');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const switchMode = (next) => {
    setMode(next);
    setFile(null);
    setError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  const validateImage = (candidate) => {
    if (!candidate) return;
    if (!candidate.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (candidate.size > 10 * 1024 * 1024) {
      setError('Image is too large. Maximum allowed size is 10MB.');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setError('');
    setPreviewUrl(URL.createObjectURL(candidate));
    setFile(candidate);
  };

  const validateAudio = (candidate) => {
    if (!candidate) return;
    if (!candidate.type.startsWith('audio/')) {
      setError('Please choose an audio file (OGG, M4A, MP3, or WAV).');
      return;
    }
    if (candidate.size > 25 * 1024 * 1024) {
      setError('Audio file is too large. Maximum allowed size is 25MB.');
      return;
    }
    setError('');
    setFile(candidate);
  };

  const onDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const dropped = event.dataTransfer?.files?.[0];
    if (mode === 'photo') validateImage(dropped);
    else validateAudio(dropped);
  };

  const onDropZoneKeyDown = (event) => {
    if (file) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (mode === 'photo') imageInputRef.current?.click();
      else audioInputRef.current?.click();
    }
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setFile(null);
    setError('');
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file || uploading) return;
    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      let response;
      if (mode === 'photo') {
        formData.append('image', file);
        response = await uploadImage(formData);
      } else {
        formData.append('audio', file);
        response = await uploadAudio(formData);
      }
      if (onUploadSuccess) onUploadSuccess(response.data);
      clearFile();
    } catch (err) {
      const apiMessage = err?.response?.data?.error;
      setError(apiMessage || err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const isVoice = mode === 'voice';
  const hasFile = Boolean(file);

  return (
    <section className="upload-form fade-in">
      <div className="upload-header">
        <h2>{isVoice ? t('mode_voice') : t('upload_title')}</h2>
        <p className="upload-subtitle">
          {isVoice ? t('voice_drop_hint') : t('upload_subtitle')}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="mode-toggle">
        <button
          type="button"
          className={`mode-btn ${!isVoice ? 'active' : ''}`}
          onClick={() => switchMode('photo')}
        >
          📷 {t('mode_photo')}
        </button>
        <button
          type="button"
          className={`mode-btn ${isVoice ? 'active' : ''}`}
          onClick={() => switchMode('voice')}
        >
          🎙️ {t('mode_voice')}
        </button>
      </div>

      {!isVoice && (
        <>
          <div className="how-it-works">
            <div className="how-step">
              <span className="how-step-num">1</span>
              <div>
                <p className="how-step-title">{t('step1_title')}</p>
                <p className="how-step-desc">{t('step1_desc')}</p>
              </div>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <span className="how-step-num">2</span>
              <div>
                <p className="how-step-title">{t('step2_title')}</p>
                <p className="how-step-desc">{t('step2_desc')}</p>
              </div>
            </div>
            <div className="how-step-arrow">→</div>
            <div className="how-step">
              <span className="how-step-num">3</span>
              <div>
                <p className="how-step-title">{t('step3_title')}</p>
                <p className="how-step-desc">{t('step3_desc')}</p>
              </div>
            </div>
          </div>

          <div className="sample-output">
            <p className="sample-label">{t('sample_label')}</p>
            <div className="sample-rows">
              {[
                { item: 'Aalu', qty: '5 kg', price: 'Rs. 300' },
                { item: 'Basmati Chawal', qty: '2 kg', price: 'Rs. 720' },
                { item: 'Doodh', qty: '4 pcs', price: 'Rs. 680' },
              ].map((row) => (
                <div key={row.item} className="sample-row">
                  <span className="sample-item">{row.item}</span>
                  <span className="sample-qty">{row.qty}</span>
                  <span className="sample-price">{row.price}</span>
                </div>
              ))}
              <div className="sample-total-row">
                <span>Total</span>
                <span>Rs. 1,700</span>
              </div>
            </div>
          </div>
        </>
      )}

      {isVoice && (
        <div className="voice-guide">
          <p className="voice-guide-title">How to record a voice bill</p>
          <ol className="voice-guide-steps">
            <li>Record a voice note on your phone — say e.g. <em>&quot;teen kilo aalu, do liter doodh, ek kg cheeni&quot;</em></li>
            <li>Export the file (WhatsApp voice note, iPhone memo, Android recorder)</li>
            <li>Upload it here — AI transcribes Urdu/English and extracts each item</li>
            <li>Open the Review tab to set any missing prices before verifying</li>
          </ol>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        className="file-input-hidden"
        type="file"
        accept="image/*"
        onChange={(e) => validateImage(e.target.files?.[0])}
        disabled={uploading}
      />
      <input
        ref={audioInputRef}
        className="file-input-hidden"
        type="file"
        accept="audio/*"
        onChange={(e) => validateAudio(e.target.files?.[0])}
        disabled={uploading}
      />

      {/* Drop zone */}
      <button
        type="button"
        className={`drop-zone ${dragActive ? 'drag-active' : ''} ${hasFile ? 'has-preview' : ''}`}
        onClick={hasFile ? undefined : () => (isVoice ? audioInputRef : imageInputRef).current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={onDrop}
        onKeyDown={onDropZoneKeyDown}
        disabled={uploading}
      >
        {hasFile ? (
          isVoice ? (
            <div className="audio-preview">
              <span className="audio-icon">🎵</span>
              <div className="audio-info">
                <div className="preview-filename">{file.name}</div>
                <div className="preview-size">{formatFileSize(file.size)}</div>
              </div>
              <button
                type="button"
                className="btn-clear-preview"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                disabled={uploading}
              >
                Remove
              </button>
            </div>
          ) : (
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
                  onClick={clearFile}
                  disabled={uploading}
                >
                  Remove
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="drop-content">
            <div className="drop-icon">{isVoice ? '🎙️' : '🧾'}</div>
            <div className="drop-text">
              {isVoice ? t('voice_drop_text') : 'Click or drag image here'}
            </div>
            <div className="drop-hint">
              {isVoice
                ? 'Supported formats: OGG, M4A, MP3, WAV'
                : 'We will extract line items and estimated totals'}
            </div>
            <div className="drop-formats">
              {isVoice ? t('voice_formats') : 'PNG, JPG, WEBP up to 10MB'}
            </div>
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
            <span className="btn-spinner"></span>{' '}
            {isVoice ? t('voice_processing_btn') : t('processing_btn')}
          </>
        ) : (
          isVoice ? t('voice_btn') : t('upload_btn')
        )}
      </button>

      {uploading && (
        <div className="processing-note">
          <div className="processing-bar">
            <div className="processing-bar-fill"></div>
          </div>
          {isVoice ? t('voice_processing_note') : t('processing_note')}
        </div>
      )}

      <WhatsAppCTA />
    </section>
  );
}

export default UploadForm;

UploadForm.propTypes = {
  onUploadSuccess: PropTypes.func,
};
