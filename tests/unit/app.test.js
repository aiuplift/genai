import { describe, it, expect } from 'vitest';
import { firebaseConfig } from '../../public/js/app.js';

describe('App initialisation', () => {
  it('exports a Firebase configuration object with required keys', () => {
    expect(firebaseConfig).toBeDefined();
    expect(firebaseConfig).toHaveProperty('apiKey');
    expect(firebaseConfig).toHaveProperty('databaseURL');
    expect(firebaseConfig).toHaveProperty('projectId');
    expect(firebaseConfig).toHaveProperty('appId');
  });

  it('Firebase config has placeholder values indicating setup is needed', () => {
    expect(firebaseConfig.projectId).toBe('YOUR_PROJECT_ID');
  });
});
