/**
 * ContextDocumentManager — Handles upload, text extraction, and storage of context documents.
 *
 * Each participant can upload one context document (.txt, .pdf, .md) per session.
 * The extracted text is stored in Firebase RTDB and prepended to all AI chat prompts.
 *
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6
 */

import SyncEngine from '../core/sync-engine.js';

// --- Constants ---
export const CONSTANTS = {
  MAX_EXTRACTED_TEXT_SIZE: 51200, // 50 KB in characters
  ACCEPTED_FORMATS: ['.txt', '.pdf', '.md'],
  ACCEPTED_MIME_TYPES: ['text/plain', 'application/pdf', 'text/markdown', 'text/x-markdown']
};

// --- Error Codes ---
export const ERROR_CODES = {
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  SIZE_EXCEEDED: 'SIZE_EXCEEDED',
  EXTRACTION_FAILED: 'EXTRACTION_FAILED'
};

// --- File Validation ---

/**
 * Get the file extension from a filename (lowercased, with dot).
 * @param {string} filename
 * @returns {string} e.g. '.txt', '.pdf', '.md'
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Validate whether a file is acceptable for upload.
 * Checks format (extension) only — size check happens after extraction.
 *
 * @param {File|{name: string, type?: string}} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file || !file.name) {
    return { valid: false, error: 'No file provided' };
  }

  const ext = getFileExtension(file.name);

  if (!CONSTANTS.ACCEPTED_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported format. Accepted formats: ${CONSTANTS.ACCEPTED_FORMATS.join(', ')}`
    };
  }

  return { valid: true };
}

// --- Text Extraction ---

/**
 * Extract text content from a file based on its type.
 * - .txt and .md files: read as UTF-8 text via FileReader
 * - .pdf files: attempt to read as text (works for text-based PDFs)
 *
 * @param {File} file - The file to extract text from
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
export async function extractText(file) {
  const ext = getFileExtension(file.name);

  try {
    if (ext === '.txt' || ext === '.md') {
      const text = await readFileAsText(file);
      return { success: true, text };
    }

    if (ext === '.pdf') {
      return await extractPdfText(file);
    }

    return { success: false, error: 'Unsupported format' };
  } catch (err) {
    return {
      success: false,
      error: `Text extraction failed: ${err.message || 'Unknown error'}`
    };
  }
}

/**
 * Read a file as UTF-8 text using FileReader.
 * Falls back to file.text() or file._content for non-Blob objects (test mocks).
 * @param {File|Blob|object} file
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    // If the file has _content property (test mock), use it directly
    if (file._content !== undefined) {
      resolve(file._content);
      return;
    }

    // If file has a text() method and is not a Blob (e.g. test mock with text())
    if (typeof file.text === 'function' && !(file instanceof Blob)) {
      file.text().then(resolve).catch(reject);
      return;
    }

    // Use FileReader for real File/Blob objects
    if (typeof FileReader !== 'undefined' && file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
      return;
    }

    // Last fallback: try text() if available
    if (typeof file.text === 'function') {
      file.text().then(resolve).catch(reject);
      return;
    }

    reject(new Error('Cannot read file: unsupported file type'));
  });
}

/**
 * Attempt to extract text from a PDF file.
 * Uses FileReader.readAsText() as a basic approach for text-based PDFs.
 * If that fails or returns non-meaningful text, returns an error
 * suggesting .txt or .md format.
 *
 * @param {File} file
 * @returns {Promise<{ success: boolean, text?: string, error?: string }>}
 */
export async function extractPdfText(file) {
  try {
    const rawText = await readFileAsText(file);

    // Basic sanity check: PDF text extraction via readAsText is unreliable.
    // If the result contains mostly binary/non-printable characters, it failed.
    if (!rawText || rawText.length === 0) {
      return {
        success: false,
        error: 'Could not extract text from PDF. Please try uploading as .txt or .md format.'
      };
    }

    // Check if the content seems like readable text
    // Count printable ASCII characters vs total
    const printableCount = countPrintableChars(rawText);
    const ratio = printableCount / rawText.length;

    if (ratio < 0.5) {
      return {
        success: false,
        error: 'Could not extract readable text from PDF. Please try uploading as .txt or .md format.'
      };
    }

    // Clean up the extracted text (remove null bytes and excessive whitespace)
    const cleanedText = rawText
      .replace(/\0/g, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    if (cleanedText.length === 0) {
      return {
        success: false,
        error: 'PDF appears to be empty. Please try uploading as .txt or .md format.'
      };
    }

    return { success: true, text: cleanedText };
  } catch (err) {
    return {
      success: false,
      error: 'Could not extract text from PDF. Please try uploading as .txt or .md format.'
    };
  }
}

/**
 * Count printable characters in a string (ASCII 32-126, plus newline/tab).
 * @param {string} text
 * @returns {number}
 */
export function countPrintableChars(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      count++;
    }
  }
  return count;
}

// --- RTDB Path Helper ---

/**
 * Get the Firebase RTDB path for a participant's context document.
 * @param {string} participantId
 * @param {string} passcode
 * @returns {string}
 */
export function getContextDocPath(participantId, passcode) {
  return `/sessions/${passcode}/chat/${participantId}/contextDocument`;
}

// --- Main API ---

/**
 * Upload and extract text from a file, then store in RTDB.
 *
 * @param {File} file - The file to upload
 * @param {string} participantId - Participant's unique identifier
 * @param {string} passcode - Session passcode
 * @param {{ syncEngine?: object }} options - Optional dependency injection
 * @returns {Promise<{ success: boolean, error?: string, extractedText?: string }>}
 */
export async function upload(file, participantId, passcode, options = {}) {
  const sync = options.syncEngine || SyncEngine;

  // Validate format
  const validation = validateFile(file);
  if (!validation.valid) {
    return { success: false, error: ERROR_CODES.UNSUPPORTED_FORMAT };
  }

  // Extract text
  const extraction = await extractText(file);
  if (!extraction.success) {
    return { success: false, error: ERROR_CODES.EXTRACTION_FAILED };
  }

  // Check size limit
  if (extraction.text.length > CONSTANTS.MAX_EXTRACTED_TEXT_SIZE) {
    return { success: false, error: ERROR_CODES.SIZE_EXCEEDED };
  }

  // Store in RTDB
  const path = getContextDocPath(participantId, passcode);
  const docData = {
    filename: file.name,
    extractedText: extraction.text,
    uploadedAt: Date.now()
  };

  try {
    await sync.immediateWrite(path, docData);
    return { success: true, extractedText: extraction.text };
  } catch (err) {
    return { success: false, error: ERROR_CODES.EXTRACTION_FAILED };
  }
}

/**
 * Get the current context document text for a participant.
 *
 * @param {string} participantId
 * @param {string} passcode
 * @param {{ syncEngine?: object }} options - Optional dependency injection
 * @returns {Promise<string|null>}
 */
export async function getContextText(participantId, passcode, options = {}) {
  const sync = options.syncEngine || SyncEngine;
  const path = getContextDocPath(participantId, passcode);

  return new Promise((resolve) => {
    let resolved = false;
    const unsub = sync.subscribe(path, (value) => {
      if (!resolved) {
        resolved = true;
        unsub();
        if (value && value.extractedText) {
          resolve(value.extractedText);
        } else {
          resolve(null);
        }
      }
    });

    // If subscribe doesn't fire (no data), resolve null after a short timeout
    // This handles the case where the path doesn't exist
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsub();
        resolve(null);
      }
    }, 3000);
  });
}

/**
 * Remove the context document for a participant.
 *
 * @param {string} participantId
 * @param {string} passcode
 * @param {{ syncEngine?: object }} options - Optional dependency injection
 * @returns {Promise<void>}
 */
export async function removeDocument(participantId, passcode, options = {}) {
  const sync = options.syncEngine || SyncEngine;
  const path = getContextDocPath(participantId, passcode);
  await sync.immediateWrite(path, null);
}

/**
 * Replace an existing context document with a new file.
 * Equivalent to removing the old document and uploading the new one.
 *
 * @param {File} file - The new file to upload
 * @param {string} participantId
 * @param {string} passcode
 * @param {{ syncEngine?: object }} options
 * @returns {Promise<{ success: boolean, error?: string, extractedText?: string }>}
 */
export async function replaceDocument(file, participantId, passcode, options = {}) {
  return upload(file, participantId, passcode, options);
}

// --- Default Export ---
const ContextDocumentManager = {
  upload,
  validateFile,
  getContextText,
  removeDocument,
  replaceDocument,
  extractText,
  getFileExtension,
  getContextDocPath,
  CONSTANTS,
  ERROR_CODES
};

export default ContextDocumentManager;
