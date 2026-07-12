import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  canSendPrompt,
  sendPrompt,
  sendComparisonPrompt,
  getErrorMessage,
  _resetRateLimit,
  _getLastRequestTimestamp
} from '../../public/js/chat/chat-service.js';

// Mock the global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('ChatService', () => {
  beforeEach(() => {
    _resetRateLimit();
    mockFetch.mockReset();
  });

  describe('canSendPrompt', () => {
    it('returns true when no request has been sent', () => {
      expect(canSendPrompt()).toBe(true);
    });

    it('returns false immediately after a request is sent', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'hi', tokens: { input: 5, output: 3 }, model: 'gpt-4o' })
      });

      await sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(canSendPrompt()).toBe(false);
    });

    it('returns true after 2 seconds have elapsed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'hi', tokens: { input: 5, output: 3 }, model: 'gpt-4o' })
      });

      await sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      // Simulate time passing by manipulating Date.now
      const originalDateNow = Date.now;
      Date.now = () => originalDateNow() + 2001;

      expect(canSendPrompt()).toBe(true);

      // Restore
      Date.now = originalDateNow;
    });
  });

  describe('sendPrompt', () => {
    it('sends a POST request to /api/chat with correct body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'Hello! How can I help?',
          tokens: { input: 10, output: 8 },
          model: 'gpt-4o'
        })
      });

      await sendPrompt({
        prompt: 'Hello',
        model: 'gpt-4o',
        context: 'Some context',
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Hello',
          model: 'gpt-4o',
          context: 'Some context',
          participantId: 'p1',
          passcode: 'ABC123',
          isComparison: false,
          comparisonModel: null
        })
      });
    });

    it('returns parsed response with content, tokens, and model', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'The answer is 42.',
          tokens: { input: 15, output: 6 },
          model: 'claude-sonnet'
        })
      });

      const result = await sendPrompt({
        prompt: 'What is the meaning of life?',
        model: 'claude-sonnet',
        context: null,
        participantId: 'p1',
        passcode: 'XYZ789'
      });

      expect(result).toEqual({
        content: 'The answer is 42.',
        tokens: { input: 15, output: 6 },
        model: 'claude-sonnet'
      });
    });

    it('sets context to null when not provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'ok', tokens: { input: 1, output: 1 }, model: 'gpt-4o' })
      });

      await sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: undefined,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.context).toBeNull();
    });

    it('throws with rate limit message when called too quickly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'hi', tokens: { input: 1, output: 1 }, model: 'gpt-4o' })
      });

      await sendPrompt({
        prompt: 'first',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      await expect(sendPrompt({
        prompt: 'second',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('Please wait a moment before sending another message.');
    });

    it('throws with network error message on fetch failure', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('Unable to reach the server. Please check your connection and try again.');
    });

    it('throws with mapped error message for RATE_LIMITED response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'RATE_LIMITED',
          message: 'Too many requests'
        })
      });

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('Please wait a moment before sending another message.');
    });

    it('throws with mapped error message for TOKEN_BUDGET_EXCEEDED', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'TOKEN_BUDGET_EXCEEDED',
          message: 'Budget exceeded'
        })
      });

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('The token budget for this session has been reached.');
    });

    it('throws with mapped error message for MODEL_UNAVAILABLE', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'MODEL_UNAVAILABLE',
          message: 'Model not available'
        })
      });

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('The selected model is currently unavailable.');
    });

    it('throws with mapped error message for PROVIDER_ERROR', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'PROVIDER_ERROR',
          message: 'Provider failed'
        })
      });

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('The AI provider encountered an error. Please try again.');
    });

    it('throws with unknown error message for unrecognised error code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'SOME_NEW_ERROR',
          message: 'Something new'
        })
      });

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('An unexpected error occurred. Please try again.');
    });

    it('throws with unknown error message when response body is not JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => { throw new Error('Invalid JSON'); }
      });

      await expect(sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('An unexpected error occurred. Please try again.');
    });

    it('defaults token values to 0 when not present in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'response text',
          tokens: {},
          model: 'gpt-4o'
        })
      });

      const result = await sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(result.tokens).toEqual({ input: 0, output: 0 });
    });

    it('handles missing tokens object in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'response text',
          model: 'gpt-4o'
        })
      });

      const result = await sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(result.tokens).toEqual({ input: 0, output: 0 });
    });
  });

  describe('sendComparisonPrompt', () => {
    it('sends a POST request with isComparison flag and comparisonModel', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'Response from model 1',
          tokens: { input: 10, output: 8 },
          model: 'gpt-4o',
          comparison: {
            content: 'Response from model 2',
            tokens: { input: 10, output: 12 },
            model: 'claude-sonnet'
          }
        })
      });

      await sendComparisonPrompt({
        prompt: 'Compare this',
        models: ['gpt-4o', 'claude-sonnet'],
        context: 'My context',
        participantId: 'p1',
        passcode: 'ABC123'
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.isComparison).toBe(true);
      expect(callBody.model).toBe('gpt-4o');
      expect(callBody.comparisonModel).toBe('claude-sonnet');
      expect(callBody.context).toBe('My context');
    });

    it('returns both responses on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'GPT says hello',
          tokens: { input: 5, output: 4 },
          model: 'gpt-4o',
          comparison: {
            content: 'Claude says hi',
            tokens: { input: 5, output: 3 },
            model: 'claude-sonnet'
          }
        })
      });

      const result = await sendComparisonPrompt({
        prompt: 'Hello',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(result.responses).toHaveLength(2);
      expect(result.responses[0]).toEqual({
        content: 'GPT says hello',
        tokens: { input: 5, output: 4 },
        model: 'gpt-4o'
      });
      expect(result.responses[1]).toEqual({
        content: 'Claude says hi',
        tokens: { input: 5, output: 3 },
        model: 'claude-sonnet'
      });
    });

    it('handles partial failure (one model errors)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'GPT response',
          tokens: { input: 10, output: 8 },
          model: 'gpt-4o',
          comparison: {
            error: 'Model timeout',
            model: 'claude-sonnet'
          }
        })
      });

      const result = await sendComparisonPrompt({
        prompt: 'test',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(result.responses).toHaveLength(2);
      expect(result.responses[0].content).toBe('GPT response');
      expect(result.responses[1]).toEqual({
        error: 'Model timeout',
        model: 'claude-sonnet'
      });
    });

    it('throws rate limit error when called too quickly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'ok',
          tokens: { input: 1, output: 1 },
          model: 'gpt-4o',
          comparison: { content: 'ok', tokens: { input: 1, output: 1 }, model: 'claude-sonnet' }
        })
      });

      await sendComparisonPrompt({
        prompt: 'first',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      await expect(sendComparisonPrompt({
        prompt: 'second',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('Please wait a moment before sending another message.');
    });

    it('handles response without comparison field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: 'Only one response',
          tokens: { input: 5, output: 3 },
          model: 'gpt-4o'
        })
      });

      const result = await sendComparisonPrompt({
        prompt: 'test',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      expect(result.responses).toHaveLength(1);
      expect(result.responses[0].content).toBe('Only one response');
    });

    it('throws on server error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'TOKEN_BUDGET_EXCEEDED',
          message: 'Budget exceeded'
        })
      });

      await expect(sendComparisonPrompt({
        prompt: 'test',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('The token budget for this session has been reached.');
    });
  });

  describe('getErrorMessage', () => {
    it('returns correct message for RATE_LIMITED', () => {
      expect(getErrorMessage('RATE_LIMITED')).toBe('Please wait a moment before sending another message.');
    });

    it('returns correct message for TOKEN_BUDGET_EXCEEDED', () => {
      expect(getErrorMessage('TOKEN_BUDGET_EXCEEDED')).toBe('The token budget for this session has been reached. No more prompts can be sent.');
    });

    it('returns correct message for MODEL_UNAVAILABLE', () => {
      expect(getErrorMessage('MODEL_UNAVAILABLE')).toBe('The selected model is currently unavailable. Please try a different model.');
    });

    it('returns correct message for PROVIDER_ERROR', () => {
      expect(getErrorMessage('PROVIDER_ERROR')).toBe('The AI provider encountered an error. Please try again.');
    });

    it('returns correct message for INVALID_REQUEST', () => {
      expect(getErrorMessage('INVALID_REQUEST')).toBe('Invalid request. Please check your input and try again.');
    });

    it('returns unknown error message for unrecognised code', () => {
      expect(getErrorMessage('SOMETHING_ELSE')).toBe('An unexpected error occurred. Please try again.');
    });

    it('returns unknown error message for undefined', () => {
      expect(getErrorMessage(undefined)).toBe('An unexpected error occurred. Please try again.');
    });

    it('returns unknown error message for null', () => {
      expect(getErrorMessage(null)).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('rate limiting integration', () => {
    it('sendPrompt and sendComparisonPrompt share the same cooldown', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ content: 'ok', tokens: { input: 1, output: 1 }, model: 'gpt-4o' })
      });

      await sendPrompt({
        prompt: 'test',
        model: 'gpt-4o',
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      });

      // Comparison should also be rate limited
      await expect(sendComparisonPrompt({
        prompt: 'test',
        models: ['gpt-4o', 'claude-sonnet'],
        context: null,
        participantId: 'p1',
        passcode: 'ABC123'
      })).rejects.toThrow('Please wait a moment before sending another message.');
    });
  });
});
