/**
 * File Upload Field Component
 *
 * Standalone component for handling file uploads in activity forms.
 * Used primarily in Module 5 (Data Analysis) for chart image uploads.
 *
 * Exports:
 * - createFileUploadField(fieldDef, currentValue, options) → HTMLElement
 * - validateFileUpload(file, acceptedFormats, maxSize) → { valid, error? }
 *
 * Requirements: 9.3, 9.5
 */

// --- Constants ---
const DEFAULT_ACCEPTED_FORMATS = ['image/png', 'image/jpeg', 'application/pdf'];
const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB = 10,485,760 bytes

// Extension-to-MIME mapping for secondary validation
const EXTENSION_MIME_MAP = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.pdf': 'application/pdf'
};

/**
 * Validate a file for upload.
 * Checks both MIME type and file extension against accepted formats,
 * and ensures the file does not exceed the maximum size.
 *
 * @param {File|object} file - File object (or object with name, type, size properties)
 * @param {string[]} [acceptedFormats] - Array of accepted MIME types
 * @param {number} [maxSize] - Maximum file size in bytes
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFileUpload(file, acceptedFormats, maxSize) {
  const formats = acceptedFormats || DEFAULT_ACCEPTED_FORMATS;
  const maxBytes = maxSize != null ? maxSize : DEFAULT_MAX_SIZE_BYTES;

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > maxBytes) {
    const maxMB = (maxBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File size exceeds the maximum of ${maxMB}MB. Please select a smaller file.`
    };
  }

  // Check MIME type
  const mimeValid = formats.includes(file.type);

  // Check file extension as secondary validation
  const fileName = file.name || '';
  const extension = _getFileExtension(fileName).toLowerCase();
  const extensionMime = EXTENSION_MIME_MAP[extension];
  const extensionValid = extensionMime && formats.includes(extensionMime);

  // File is valid if EITHER the MIME type matches OR the extension maps to an accepted format
  if (!mimeValid && !extensionValid) {
    const formatNames = _getFormatNames(formats);
    return {
      valid: false,
      error: `Unsupported file format. Accepted formats: ${formatNames}. Maximum size: ${(maxBytes / (1024 * 1024)).toFixed(0)}MB.`
    };
  }

  return { valid: true };
}

/**
 * Create a file upload field DOM element.
 *
 * @param {object} fieldDef - Field definition from the activity config
 * @param {string} fieldDef.id - Field identifier
 * @param {string} fieldDef.label - Display label for the field
 * @param {string[]} [fieldDef.acceptedFormats] - Accepted MIME types
 * @param {number} [fieldDef.maxSize] - Max file size in bytes
 * @param {object|null} currentValue - Current stored value (base64 data) or null
 * @param {string} [currentValue.filename] - Original filename
 * @param {string} [currentValue.mimetype] - File MIME type
 * @param {string} [currentValue.data] - Base64-encoded file content
 * @param {object} [options] - Additional options
 * @param {function} [options.onFileChange] - Called with file data object when file changes
 * @param {boolean} [options.readOnly] - If true, render in read-only mode
 * @returns {HTMLElement} The file upload field container element
 */
export function createFileUploadField(fieldDef, currentValue, options = {}) {
  const formats = fieldDef.acceptedFormats || DEFAULT_ACCEPTED_FORMATS;
  const maxSize = fieldDef.maxSize != null ? fieldDef.maxSize : DEFAULT_MAX_SIZE_BYTES;
  const fieldId = fieldDef.id || 'file-upload';
  const label = fieldDef.label || 'Upload file';

  // Container
  const container = document.createElement('div');
  container.className = 'file-upload-field';
  container.dataset.fieldId = fieldId;

  // Label
  const labelEl = document.createElement('label');
  labelEl.className = 'file-upload-field__label';
  labelEl.setAttribute('for', `file-input-${fieldId}`);
  labelEl.textContent = label;
  container.appendChild(labelEl);

  // Help text showing accepted formats
  const helpText = document.createElement('p');
  helpText.className = 'file-upload-field__help';
  helpText.textContent = `Accepted formats: ${_getFormatNames(formats)}. Max size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`;
  container.appendChild(helpText);

  if (options.readOnly) {
    // Read-only mode: just show current value or placeholder
    const preview = _createPreviewElement(currentValue);
    container.appendChild(preview);
    return container;
  }

  // File input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = `file-input-${fieldId}`;
  fileInput.className = 'file-upload-field__input';
  fileInput.accept = _getAcceptAttribute(formats);
  fileInput.setAttribute('aria-describedby', `file-help-${fieldId} file-error-${fieldId}`);
  helpText.id = `file-help-${fieldId}`;
  container.appendChild(fileInput);

  // Error message area
  const errorEl = document.createElement('p');
  errorEl.className = 'file-upload-field__error';
  errorEl.id = `file-error-${fieldId}`;
  errorEl.setAttribute('role', 'alert');
  errorEl.setAttribute('aria-live', 'polite');
  errorEl.textContent = '';
  container.appendChild(errorEl);

  // Preview area
  const previewArea = document.createElement('div');
  previewArea.className = 'file-upload-field__preview';
  container.appendChild(previewArea);

  // Show current value if exists
  if (currentValue && currentValue.data) {
    _renderPreview(previewArea, currentValue);
    _addRemoveButton(previewArea, fileInput, errorEl, options.onFileChange);
  }

  // File change handler
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    errorEl.textContent = '';

    if (!file) {
      return;
    }

    // Validate
    const validation = validateFileUpload(file, formats, maxSize);
    if (!validation.valid) {
      errorEl.textContent = validation.error;
      // Clear the file input but retain other field content
      fileInput.value = '';
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result; // data:mimetype;base64,...
      const fileData = {
        filename: file.name,
        mimetype: file.type || _getMimeFromExtension(file.name),
        data: base64Data
      };

      // Update preview
      _renderPreview(previewArea, fileData);
      _addRemoveButton(previewArea, fileInput, errorEl, options.onFileChange);

      // Notify parent
      if (options.onFileChange) {
        options.onFileChange(fileData);
      }
    };

    reader.onerror = () => {
      errorEl.textContent = 'Failed to read file. Please try again.';
      fileInput.value = '';
    };

    reader.readAsDataURL(file);
  });

  return container;
}

// --- Private Helpers ---

/**
 * Get the file extension from a filename.
 * @param {string} filename
 * @returns {string} Extension including the dot (e.g., '.png'), or ''
 * @private
 */
function _getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return '';
  return filename.substring(lastDot);
}

/**
 * Get MIME type from file extension.
 * @param {string} filename
 * @returns {string} MIME type or empty string
 * @private
 */
function _getMimeFromExtension(filename) {
  const ext = _getFileExtension(filename).toLowerCase();
  return EXTENSION_MIME_MAP[ext] || '';
}

/**
 * Get human-readable format names from MIME types.
 * @param {string[]} formats
 * @returns {string}
 * @private
 */
function _getFormatNames(formats) {
  const names = formats.map(mime => {
    switch (mime) {
      case 'image/png': return 'PNG';
      case 'image/jpeg': return 'JPG';
      case 'application/pdf': return 'PDF';
      default: return mime;
    }
  });
  return names.join(', ');
}

/**
 * Get the accept attribute string for the file input.
 * @param {string[]} formats - MIME types
 * @returns {string}
 * @private
 */
function _getAcceptAttribute(formats) {
  // Include both MIME types and extensions for broader browser compatibility
  const parts = [];
  for (const mime of formats) {
    parts.push(mime);
    switch (mime) {
      case 'image/png': parts.push('.png'); break;
      case 'image/jpeg': parts.push('.jpg', '.jpeg'); break;
      case 'application/pdf': parts.push('.pdf'); break;
    }
  }
  return parts.join(',');
}

/**
 * Render a file preview in the preview area.
 * @param {HTMLElement} previewArea
 * @param {object} fileData - { filename, mimetype, data }
 * @private
 */
function _renderPreview(previewArea, fileData) {
  previewArea.innerHTML = '';

  if (!fileData || !fileData.data) {
    return;
  }

  if (fileData.mimetype && fileData.mimetype.startsWith('image/')) {
    // Image preview (thumbnail)
    const img = document.createElement('img');
    img.className = 'file-upload-field__thumbnail';
    img.src = fileData.data;
    img.alt = fileData.filename || 'Uploaded image';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '150px';
    previewArea.appendChild(img);
  } else {
    // Non-image file (PDF): show filename
    const fileInfo = document.createElement('span');
    fileInfo.className = 'file-upload-field__filename';
    fileInfo.textContent = fileData.filename || 'Uploaded file';
    previewArea.appendChild(fileInfo);
  }
}

/**
 * Add a "Remove file" button to the preview area.
 * @param {HTMLElement} previewArea
 * @param {HTMLInputElement} fileInput
 * @param {HTMLElement} errorEl
 * @param {function|undefined} onFileChange
 * @private
 */
function _addRemoveButton(previewArea, fileInput, errorEl, onFileChange) {
  // Remove existing button if any
  const existing = previewArea.querySelector('.file-upload-field__remove-btn');
  if (existing) existing.remove();

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'file-upload-field__remove-btn';
  removeBtn.textContent = 'Remove file';
  removeBtn.setAttribute('aria-label', 'Remove uploaded file');

  removeBtn.addEventListener('click', () => {
    // Clear preview
    previewArea.innerHTML = '';
    // Clear file input
    fileInput.value = '';
    // Clear any error
    errorEl.textContent = '';
    // Notify parent that file was removed
    if (onFileChange) {
      onFileChange(null);
    }
  });

  previewArea.appendChild(removeBtn);
}

/**
 * Create a read-only preview element for a file value.
 * @param {object|null} value
 * @returns {HTMLElement}
 * @private
 */
function _createPreviewElement(value) {
  const preview = document.createElement('div');
  preview.className = 'file-upload-field__preview';

  if (!value || !value.data) {
    const placeholder = document.createElement('p');
    placeholder.className = 'file-upload-field__placeholder';
    placeholder.textContent = 'No file uploaded';
    preview.appendChild(placeholder);
    return preview;
  }

  if (value.mimetype && value.mimetype.startsWith('image/')) {
    const img = document.createElement('img');
    img.className = 'file-upload-field__thumbnail';
    img.src = value.data;
    img.alt = value.filename || 'Uploaded image';
    img.style.maxWidth = '200px';
    img.style.maxHeight = '150px';
    preview.appendChild(img);
  } else {
    const fileInfo = document.createElement('span');
    fileInfo.className = 'file-upload-field__filename';
    fileInfo.textContent = value.filename || 'Uploaded file';
    preview.appendChild(fileInfo);
  }

  return preview;
}

// --- Default Export ---
export default { createFileUploadField, validateFileUpload };
