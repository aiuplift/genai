/**
 * Unit tests for ContextDocumentManager
 * Tests file validation, text extraction, upload, retrieval, and removal.
 *
 * Requirements: 23.1, 23.2, 23.3, 23.4, 23.5, 23.6
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateFile,
  getFileExtension,
  extractText,
  countPrintableChars,
  getContextDocPath,
  upload,
  getContextText,
  removeDocument,
  replaceDocument,
  CONSTANTS,
  ERROR_CODES
} from '../../public/js/chat/context-document-manager.js';

// --- Helpers ---

/**
 * Create a mock file object for testing.
 * @param {string} name - filename
 * @param {string} content - text content
 * @param {string} type - MIME type
 * @returns {object} Mock File-like object
 */
function createMockFile(name, content = '', type = 'text/plain') {
  return {
    name,
    type,
    size: content.length,
    _content: content,
    text() {
      return Promise.resolve(content);
    }
  };
}

/**
 * Create a mock SyncEngine for testing.
 */
function createMockSyncEngine() {
  const store = {};
  return {
    _store: store,
    immediateWrite(path, value) {
      if (value === null) {
        delete store[path];
      } else {
        store[path] = value;
      }
      return Promise.resolve();
    },
    subscribe(path, callback) {
      const value = store[path] || null;
      // Simulate async Firebase callback
      setTimeout(() => callback(value), 0);
      return () => {};
    }
  };
}

// --- Tests ---

describe('ContextDocumentManager - getFileExtension', () => {
  it('extracts .txt extension', () => {
    expect(getFileExtension('document.txt')).toBe('.txt');
  });

  it('extracts .pdf extension', () => {
    expect(getFileExtension('report.pdf')).toBe('.pdf');
  });

  it('extracts .md extension', () => {
    expect(getFileExtension('notes.md')).toBe('.md');
  });

  it('handles uppercase extensions (lowercased)', () => {
    expect(getFileExtension('FILE.TXT')).toBe('.txt');
    expect(getFileExtension('Doc.PDF')).toBe('.pdf');
    expect(getFileExtension('README.MD')).toBe('.md');
  });

  it('handles multiple dots in filename', () => {
    expect(getFileExtension('my.file.name.txt')).toBe('.txt');
  });

  it('returns empty string for no extension', () => {
    expect(getFileExtension('noextension')).toBe('');
  });

  it('returns empty string for null/undefined', () => {
    expect(getFileExtension(null)).toBe('');
    expect(getFileExtension(undefined)).toBe('');
    expect(getFileExtension('')).toBe('');
  });
});

describe('ContextDocumentManager - validateFile', () => {
  it('accepts .txt files', () => {
    const file = createMockFile('document.txt');
    expect(validateFile(file)).toEqual({ valid: true });
  });

  it('accepts .pdf files', () => {
    const file = createMockFile('report.pdf', '', 'application/pdf');
    expect(validateFile(file)).toEqual({ valid: true });
  });

  it('accepts .md files', () => {
    const file = createMockFile('notes.md', '', 'text/markdown');
    expect(validateFile(file)).toEqual({ valid: true });
  });

  it('accepts case-insensitive extensions', () => {
    expect(validateFile(createMockFile('FILE.TXT'))).toEqual({ valid: true });
    expect(validateFile(createMockFile('DOC.PDF'))).toEqual({ valid: true });
    expect(validateFile(createMockFile('README.MD'))).toEqual({ valid: true });
  });

  it('rejects unsupported formats', () => {
    const docx = createMockFile('file.docx');
    const result = validateFile(docx);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported format');
  });

  it('rejects .html files', () => {
    const html = createMockFile('page.html');
    expect(validateFile(html).valid).toBe(false);
  });

  it('rejects .jpg files', () => {
    const jpg = createMockFile('image.jpg');
    expect(validateFile(jpg).valid).toBe(false);
  });

  it('rejects files with no extension', () => {
    const noExt = createMockFile('noextension');
    expect(validateFile(noExt).valid).toBe(false);
  });

  it('rejects null/undefined file', () => {
    expect(validateFile(null).valid).toBe(false);
    expect(validateFile(undefined).valid).toBe(false);
  });

  it('rejects file without name', () => {
    expect(validateFile({}).valid).toBe(false);
    expect(validateFile({ name: '' }).valid).toBe(false);
  });
});

describe('ContextDocumentManager - extractText', () => {
  it('extracts text from .txt file', async () => {
    const file = createMockFile('doc.txt', 'Hello, world!');
    const result = await extractText(file);
    expect(result.success).toBe(true);
    expect(result.text).toBe('Hello, world!');
  });

  it('extracts text from .md file', async () => {
    const content = '# Heading\n\nSome markdown content.';
    const file = createMockFile('notes.md', content, 'text/markdown');
    const result = await extractText(file);
    expect(result.success).toBe(true);
    expect(result.text).toBe(content);
  });

  it('handles empty .txt file', async () => {
    const file = createMockFile('empty.txt', '');
    const result = await extractText(file);
    expect(result.success).toBe(true);
    expect(result.text).toBe('');
  });

  it('handles .txt file with unicode content', async () => {
    const content = 'Café résumé naïve über';
    const file = createMockFile('unicode.txt', content);
    const result = await extractText(file);
    expect(result.success).toBe(true);
    expect(result.text).toBe(content);
  });

  it('attempts to extract text from PDF (text-based)', async () => {
    // Simulate a text-based PDF that readAsText can handle
    const textContent = 'This is readable text from a PDF document.';
    const file = createMockFile('readable.pdf', textContent, 'application/pdf');
    const result = await extractText(file);
    expect(result.success).toBe(true);
    expect(result.text).toBe(textContent);
  });

  it('fails gracefully for binary PDF content', async () => {
    // Simulate binary content that would come from a scanned PDF
    const binaryContent = String.fromCharCode(0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 20);
    const file = createMockFile('binary.pdf', binaryContent, 'application/pdf');
    const result = await extractText(file);
    expect(result.success).toBe(false);
    expect(result.error).toContain('.txt or .md');
  });

  it('fails for empty PDF', async () => {
    const file = createMockFile('empty.pdf', '', 'application/pdf');
    const result = await extractText(file);
    expect(result.success).toBe(false);
    expect(result.error).toContain('.txt or .md');
  });
});

describe('ContextDocumentManager - countPrintableChars', () => {
  it('counts standard ASCII printable characters', () => {
    expect(countPrintableChars('Hello')).toBe(5);
  });

  it('counts spaces and punctuation', () => {
    expect(countPrintableChars('Hello, world!')).toBe(13);
  });

  it('counts newlines and tabs', () => {
    // 'line1' (5) + '\n' (1) + 'line2' (5) + '\t' (1) + 'tab' (3) = 15
    expect(countPrintableChars('line1\nline2\ttab')).toBe(15);
  });

  it('does not count control characters', () => {
    expect(countPrintableChars('\x00\x01\x02\x03')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(countPrintableChars('')).toBe(0);
  });
});

describe('ContextDocumentManager - getContextDocPath', () => {
  it('constructs correct RTDB path', () => {
    const path = getContextDocPath('participant-123', 'ABC456');
    expect(path).toBe('/sessions/ABC456/chat/participant-123/contextDocument');
  });

  it('handles different participant IDs and passcodes', () => {
    const path = getContextDocPath('user-uuid-xyz', 'XYZ789');
    expect(path).toBe('/sessions/XYZ789/chat/user-uuid-xyz/contextDocument');
  });
});

describe('ContextDocumentManager - upload', () => {
  let syncEngine;

  beforeEach(() => {
    syncEngine = createMockSyncEngine();
  });

  it('successfully uploads a .txt file', async () => {
    const file = createMockFile('doc.txt', 'Hello context');
    const result = await upload(file, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe('Hello context');
  });

  it('stores document data in RTDB', async () => {
    const file = createMockFile('notes.md', 'My notes');
    await upload(file, 'p1', 'SESS01', { syncEngine });

    const path = '/sessions/SESS01/chat/p1/contextDocument';
    const stored = syncEngine._store[path];
    expect(stored).toBeDefined();
    expect(stored.filename).toBe('notes.md');
    expect(stored.extractedText).toBe('My notes');
    expect(stored.uploadedAt).toBeTypeOf('number');
  });

  it('rejects unsupported format', async () => {
    const file = createMockFile('doc.docx', 'content');
    const result = await upload(file, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(false);
    expect(result.error).toBe(ERROR_CODES.UNSUPPORTED_FORMAT);
  });

  it('rejects when extracted text exceeds 50KB limit', async () => {
    const bigContent = 'x'.repeat(CONSTANTS.MAX_EXTRACTED_TEXT_SIZE + 1);
    const file = createMockFile('big.txt', bigContent);
    const result = await upload(file, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(false);
    expect(result.error).toBe(ERROR_CODES.SIZE_EXCEEDED);
  });

  it('accepts text at exactly 50KB limit', async () => {
    const exactContent = 'a'.repeat(CONSTANTS.MAX_EXTRACTED_TEXT_SIZE);
    const file = createMockFile('exact.txt', exactContent);
    const result = await upload(file, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(true);
    expect(result.extractedText).toHaveLength(CONSTANTS.MAX_EXTRACTED_TEXT_SIZE);
  });

  it('returns EXTRACTION_FAILED for binary PDF', async () => {
    const binaryContent = String.fromCharCode(0, 1, 2, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 19, 20);
    const file = createMockFile('scan.pdf', binaryContent, 'application/pdf');
    const result = await upload(file, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(false);
    expect(result.error).toBe(ERROR_CODES.EXTRACTION_FAILED);
  });

  it('handles sync write failure', async () => {
    const failingSyncEngine = {
      immediateWrite() {
        return Promise.reject(new Error('Network error'));
      },
      subscribe: syncEngine.subscribe
    };
    const file = createMockFile('doc.txt', 'content');
    const result = await upload(file, 'p1', 'PASS01', { syncEngine: failingSyncEngine });

    expect(result.success).toBe(false);
    expect(result.error).toBe(ERROR_CODES.EXTRACTION_FAILED);
  });
});

describe('ContextDocumentManager - getContextText', () => {
  let syncEngine;

  beforeEach(() => {
    syncEngine = createMockSyncEngine();
  });

  it('returns extracted text when document exists', async () => {
    const path = '/sessions/PASS01/chat/p1/contextDocument';
    syncEngine._store[path] = {
      filename: 'doc.txt',
      extractedText: 'My context text',
      uploadedAt: 1000
    };

    const text = await getContextText('p1', 'PASS01', { syncEngine });
    expect(text).toBe('My context text');
  });

  it('returns null when no document exists', async () => {
    const text = await getContextText('p1', 'PASS01', { syncEngine });
    expect(text).toBeNull();
  });

  it('returns null when document has no extractedText', async () => {
    const path = '/sessions/PASS01/chat/p1/contextDocument';
    syncEngine._store[path] = { filename: 'doc.txt', uploadedAt: 1000 };

    const text = await getContextText('p1', 'PASS01', { syncEngine });
    expect(text).toBeNull();
  });
});

describe('ContextDocumentManager - removeDocument', () => {
  let syncEngine;

  beforeEach(() => {
    syncEngine = createMockSyncEngine();
  });

  it('removes document from RTDB', async () => {
    const path = '/sessions/PASS01/chat/p1/contextDocument';
    syncEngine._store[path] = {
      filename: 'doc.txt',
      extractedText: 'text',
      uploadedAt: 1000
    };

    await removeDocument('p1', 'PASS01', { syncEngine });
    expect(syncEngine._store[path]).toBeUndefined();
  });

  it('does not throw if document does not exist', async () => {
    await expect(
      removeDocument('p1', 'PASS01', { syncEngine })
    ).resolves.toBeUndefined();
  });
});

describe('ContextDocumentManager - replaceDocument', () => {
  let syncEngine;

  beforeEach(() => {
    syncEngine = createMockSyncEngine();
  });

  it('replaces existing document with new one', async () => {
    const path = '/sessions/PASS01/chat/p1/contextDocument';
    syncEngine._store[path] = {
      filename: 'old.txt',
      extractedText: 'old content',
      uploadedAt: 1000
    };

    const newFile = createMockFile('new.md', 'new content');
    const result = await replaceDocument(newFile, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(true);
    expect(result.extractedText).toBe('new content');
    expect(syncEngine._store[path].filename).toBe('new.md');
    expect(syncEngine._store[path].extractedText).toBe('new content');
  });

  it('rejects invalid replacement file', async () => {
    const path = '/sessions/PASS01/chat/p1/contextDocument';
    syncEngine._store[path] = {
      filename: 'existing.txt',
      extractedText: 'existing content',
      uploadedAt: 1000
    };

    const invalidFile = createMockFile('bad.docx', 'content');
    const result = await replaceDocument(invalidFile, 'p1', 'PASS01', { syncEngine });

    expect(result.success).toBe(false);
    expect(result.error).toBe(ERROR_CODES.UNSUPPORTED_FORMAT);
  });
});

describe('ContextDocumentManager - CONSTANTS', () => {
  it('has correct max text size (50KB = 51200 chars)', () => {
    expect(CONSTANTS.MAX_EXTRACTED_TEXT_SIZE).toBe(51200);
  });

  it('has correct accepted formats', () => {
    expect(CONSTANTS.ACCEPTED_FORMATS).toContain('.txt');
    expect(CONSTANTS.ACCEPTED_FORMATS).toContain('.pdf');
    expect(CONSTANTS.ACCEPTED_FORMATS).toContain('.md');
    expect(CONSTANTS.ACCEPTED_FORMATS).toHaveLength(3);
  });
});
