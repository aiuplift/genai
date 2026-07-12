import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateFileUpload,
  createFileUploadField
} from '../../public/js/components/file-upload-field.js';

describe('validateFileUpload', () => {
  const defaultFormats = ['image/png', 'image/jpeg', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  describe('valid files', () => {
    it('accepts a PNG file within size limit', () => {
      const file = { name: 'chart.png', type: 'image/png', size: 1024 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('accepts a JPEG file within size limit', () => {
      const file = { name: 'photo.jpg', type: 'image/jpeg', size: 5000000 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('accepts a PDF file within size limit', () => {
      const file = { name: 'doc.pdf', type: 'application/pdf', size: 8000000 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('accepts a file exactly at the size limit', () => {
      const file = { name: 'big.png', type: 'image/png', size: 10 * 1024 * 1024 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('accepts a file with .jpeg extension', () => {
      const file = { name: 'photo.jpeg', type: 'image/jpeg', size: 2000 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('accepts a file based on extension when MIME type is empty', () => {
      const file = { name: 'chart.png', type: '', size: 1024 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('uses default formats and max size when not provided', () => {
      const file = { name: 'chart.png', type: 'image/png', size: 1024 };
      expect(validateFileUpload(file)).toEqual({ valid: true });
    });
  });

  describe('invalid files — size', () => {
    it('rejects a file exceeding 10MB', () => {
      const file = { name: 'huge.png', type: 'image/png', size: 10 * 1024 * 1024 + 1 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the maximum');
      expect(result.error).toContain('10MB');
    });

    it('rejects a very large file', () => {
      const file = { name: 'giant.pdf', type: 'application/pdf', size: 50 * 1024 * 1024 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
    });

    it('respects custom max size', () => {
      const file = { name: 'small.png', type: 'image/png', size: 2000 };
      const result = validateFileUpload(file, defaultFormats, 1000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds the maximum');
    });
  });

  describe('invalid files — format', () => {
    it('rejects a GIF file', () => {
      const file = { name: 'anim.gif', type: 'image/gif', size: 1024 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
      expect(result.error).toContain('PNG');
      expect(result.error).toContain('JPG');
      expect(result.error).toContain('PDF');
    });

    it('rejects a Word document', () => {
      const file = { name: 'doc.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 5000 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });

    it('rejects a text file', () => {
      const file = { name: 'notes.txt', type: 'text/plain', size: 100 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
    });

    it('rejects a file with no type and unknown extension', () => {
      const file = { name: 'data.xyz', type: '', size: 1024 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported file format');
    });
  });

  describe('edge cases', () => {
    it('returns invalid when file is null', () => {
      const result = validateFileUpload(null, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file selected');
    });

    it('returns invalid when file is undefined', () => {
      const result = validateFileUpload(undefined, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('No file selected');
    });

    it('accepts a zero-byte file if format is valid', () => {
      const file = { name: 'empty.png', type: 'image/png', size: 0 };
      expect(validateFileUpload(file, defaultFormats, maxSize)).toEqual({ valid: true });
    });

    it('checks size before format (size error takes precedence)', () => {
      const file = { name: 'huge.gif', type: 'image/gif', size: 20 * 1024 * 1024 };
      const result = validateFileUpload(file, defaultFormats, maxSize);
      expect(result.valid).toBe(false);
      // Size is checked first
      expect(result.error).toContain('exceeds the maximum');
    });
  });
});

describe('createFileUploadField', () => {
  const fieldDef = {
    id: 'chart-upload',
    label: 'Upload Chart Image',
    acceptedFormats: ['image/png', 'image/jpeg', 'application/pdf'],
    maxSize: 10 * 1024 * 1024
  };

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    it('creates a container with the correct class and data attribute', () => {
      const el = createFileUploadField(fieldDef, null);
      expect(el.className).toBe('file-upload-field');
      expect(el.dataset.fieldId).toBe('chart-upload');
    });

    it('renders a label element with correct text and for attribute', () => {
      const el = createFileUploadField(fieldDef, null);
      const label = el.querySelector('label');
      expect(label).not.toBeNull();
      expect(label.textContent).toBe('Upload Chart Image');
      expect(label.getAttribute('for')).toBe('file-input-chart-upload');
    });

    it('renders help text with accepted formats', () => {
      const el = createFileUploadField(fieldDef, null);
      const help = el.querySelector('.file-upload-field__help');
      expect(help).not.toBeNull();
      expect(help.textContent).toContain('PNG');
      expect(help.textContent).toContain('JPG');
      expect(help.textContent).toContain('PDF');
      expect(help.textContent).toContain('10MB');
    });

    it('renders a file input with correct accept attribute', () => {
      const el = createFileUploadField(fieldDef, null);
      const input = el.querySelector('input[type="file"]');
      expect(input).not.toBeNull();
      expect(input.accept).toContain('image/png');
      expect(input.accept).toContain('image/jpeg');
      expect(input.accept).toContain('application/pdf');
      expect(input.accept).toContain('.png');
      expect(input.accept).toContain('.jpg');
      expect(input.accept).toContain('.pdf');
    });

    it('renders an error message area with alert role', () => {
      const el = createFileUploadField(fieldDef, null);
      const error = el.querySelector('.file-upload-field__error');
      expect(error).not.toBeNull();
      expect(error.getAttribute('role')).toBe('alert');
      expect(error.getAttribute('aria-live')).toBe('polite');
      expect(error.textContent).toBe('');
    });

    it('renders a preview area', () => {
      const el = createFileUploadField(fieldDef, null);
      const preview = el.querySelector('.file-upload-field__preview');
      expect(preview).not.toBeNull();
    });
  });

  describe('existing value display', () => {
    it('shows image thumbnail when current value is a PNG', () => {
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,iVBORw0KGgo='
      };
      const el = createFileUploadField(fieldDef, currentValue);
      const img = el.querySelector('.file-upload-field__thumbnail');
      expect(img).not.toBeNull();
      expect(img.src).toBe('data:image/png;base64,iVBORw0KGgo=');
      expect(img.alt).toBe('chart.png');
    });

    it('shows filename when current value is a PDF', () => {
      const currentValue = {
        filename: 'report.pdf',
        mimetype: 'application/pdf',
        data: 'data:application/pdf;base64,JVBERi0='
      };
      const el = createFileUploadField(fieldDef, currentValue);
      const fileInfo = el.querySelector('.file-upload-field__filename');
      expect(fileInfo).not.toBeNull();
      expect(fileInfo.textContent).toBe('report.pdf');
    });

    it('shows remove button when a file is present', () => {
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,iVBORw0KGgo='
      };
      const el = createFileUploadField(fieldDef, currentValue);
      const removeBtn = el.querySelector('.file-upload-field__remove-btn');
      expect(removeBtn).not.toBeNull();
      expect(removeBtn.textContent).toBe('Remove file');
    });

    it('does not show remove button when no file is present', () => {
      const el = createFileUploadField(fieldDef, null);
      const removeBtn = el.querySelector('.file-upload-field__remove-btn');
      expect(removeBtn).toBeNull();
    });
  });

  describe('read-only mode', () => {
    it('does not render file input in read-only mode', () => {
      const el = createFileUploadField(fieldDef, null, { readOnly: true });
      const input = el.querySelector('input[type="file"]');
      expect(input).toBeNull();
    });

    it('shows placeholder text when no value in read-only mode', () => {
      const el = createFileUploadField(fieldDef, null, { readOnly: true });
      const placeholder = el.querySelector('.file-upload-field__placeholder');
      expect(placeholder).not.toBeNull();
      expect(placeholder.textContent).toBe('No file uploaded');
    });

    it('shows image preview in read-only mode', () => {
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,iVBORw0KGgo='
      };
      const el = createFileUploadField(fieldDef, currentValue, { readOnly: true });
      const img = el.querySelector('.file-upload-field__thumbnail');
      expect(img).not.toBeNull();
    });

    it('does not render remove button in read-only mode', () => {
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,abc='
      };
      const el = createFileUploadField(fieldDef, currentValue, { readOnly: true });
      const removeBtn = el.querySelector('.file-upload-field__remove-btn');
      expect(removeBtn).toBeNull();
    });
  });

  describe('remove button interaction', () => {
    it('calls onFileChange with null when remove is clicked', () => {
      const onFileChange = vi.fn();
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,abc='
      };
      const el = createFileUploadField(fieldDef, currentValue, { onFileChange });
      document.body.appendChild(el);

      const removeBtn = el.querySelector('.file-upload-field__remove-btn');
      removeBtn.click();

      expect(onFileChange).toHaveBeenCalledWith(null);
    });

    it('clears the preview when remove is clicked', () => {
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,abc='
      };
      const el = createFileUploadField(fieldDef, currentValue);
      document.body.appendChild(el);

      const removeBtn = el.querySelector('.file-upload-field__remove-btn');
      removeBtn.click();

      const preview = el.querySelector('.file-upload-field__preview');
      expect(preview.innerHTML).toBe('');
    });
  });

  describe('accessibility', () => {
    it('has aria-describedby linking to help and error elements', () => {
      const el = createFileUploadField(fieldDef, null);
      const input = el.querySelector('input[type="file"]');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toContain('file-help-chart-upload');
      expect(describedBy).toContain('file-error-chart-upload');
    });

    it('remove button has aria-label', () => {
      const currentValue = {
        filename: 'chart.png',
        mimetype: 'image/png',
        data: 'data:image/png;base64,abc='
      };
      const el = createFileUploadField(fieldDef, currentValue);
      const removeBtn = el.querySelector('.file-upload-field__remove-btn');
      expect(removeBtn.getAttribute('aria-label')).toBe('Remove uploaded file');
    });
  });
});
