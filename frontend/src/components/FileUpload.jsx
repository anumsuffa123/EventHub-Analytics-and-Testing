import { useState, useRef, useCallback } from 'react';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

/**
 * FileUpload — styled drag-and-drop / file picker with inline preview.
 *
 * Props:
 *   onFileSelect(file | null)  called with the validated File or null on remove
 *   error        (string)      external validation error to display
 *   disabled     (boolean)     disables interaction during form submission
 */
const FileUpload = ({ onFileSelect, error, disabled }) => {
  const [dragActive, setDragActive] = useState(false);
  const [dragReject, setDragReject] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [localError, setLocalError] = useState('');
  const inputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Validate and set the selected file
  const processFile = useCallback(
    (file) => {
      if (!file) return;
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
        setLocalError('Only JPG, JPEG and PNG images are allowed.');
        setPreview(null);
        setFileInfo(null);
        onFileSelect(null);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setLocalError('Image size must be less than 2 MB.');
        setPreview(null);
        setFileInfo(null);
        onFileSelect(null);
        return;
      }

      // Valid — generate blob URL preview
      setLocalError('');
      if (preview) URL.revokeObjectURL(preview); // clean up old blob
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setFileInfo({ name: file.name, size: formatBytes(file.size) });
      onFileSelect(file);
    },
    [onFileSelect, preview]
  );

  // ─── Drag events ────────────────────────────────────────────────────────
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    const items = Array.from(e.dataTransfer.items || []);
    const hasInvalid = items.some(
      (item) => item.kind === 'file' && !ALLOWED_TYPES.includes(item.type)
    );
    setDragReject(hasInvalid);
    setDragActive(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragActive(false);
      setDragReject(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setDragActive(false);
    setDragReject(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ─── File picker ─────────────────────────────────────────────────────────
  const handleAreaClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = ''; // allow same file re-selection after remove
  };

  // ─── Remove ──────────────────────────────────────────────────────────────
  const handleRemove = (e) => {
    e.stopPropagation();
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileInfo(null);
    setLocalError('');
    onFileSelect(null);
  };

  const displayError = localError || error;

  const dropZoneClass = [
    'fu-drop-zone',
    dragActive && !dragReject ? 'fu-drag-active' : '',
    dragActive && dragReject ? 'fu-drag-reject' : '',
    disabled ? 'fu-disabled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="fu-wrapper">
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        id="profileImage"
        name="profileImage"
        accept="image/jpeg,image/png"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
        aria-hidden="true"
      />

      {/* ── Drop zone (visible when no file selected) ── */}
      {!preview && (
        <div
          className={dropZoneClass}
          onClick={handleAreaClick}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload profile image"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleAreaClick();
          }}
        >
          {/* Icon circle changes colour based on drag state */}
          <div
            className={[
              'fu-icon-circle',
              dragActive && !dragReject ? 'fu-icon-active' : '',
              dragActive && dragReject ? 'fu-icon-reject' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {dragActive && dragReject ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : dragActive ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 13l-7 7-7-7m7-7v14" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>

          <div className="fu-title">
            {dragActive && dragReject
              ? 'Invalid file type'
              : dragActive
              ? 'Drop your image here'
              : '📷 Upload Profile Image'}
          </div>

          {!dragActive && (
            <>
              <div className="fu-subtitle">Drag &amp; drop your image here</div>
              <div className="fu-or">
                <span>OR</span>
              </div>
              <button
                type="button"
                className="fu-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAreaClick();
                }}
                disabled={disabled}
                tabIndex={-1}
              >
                Choose Image
              </button>
              <div className="fu-hint">JPG, JPEG, PNG &bull; Maximum size: 2 MB</div>
            </>
          )}
        </div>
      )}

      {/* ── Preview card (visible after a valid file is selected) ── */}
      {preview && (
        <div className="fu-preview-card">
          <div className="fu-preview-header">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Image Preview</span>
          </div>

          <div className="fu-preview-body">
            <img src={preview} alt="Selected preview" className="fu-preview-img" />

            <div className="fu-preview-meta">
              <div className="fu-preview-filename" title={fileInfo?.name}>
                {fileInfo?.name}
              </div>
              <div className="fu-preview-size">{fileInfo?.size}</div>

              <button
                type="button"
                className="fu-remove-btn"
                onClick={handleRemove}
                disabled={disabled}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Validation error ── */}
      {displayError && (
        <div className="invalid-feedback fu-error" role="alert">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {displayError}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
