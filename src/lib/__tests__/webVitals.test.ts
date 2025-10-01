import { describe, it, expect } from 'vitest';
import { getVitalsThresholds } from '../webVitals';

describe('Web Vitals', () => {
  it('returns correct thresholds', () => {
    const thresholds = getVitalsThresholds();

    expect(thresholds.LCP.good).toBe(2500);
    expect(thresholds.INP.good).toBe(200);
    expect(thresholds.CLS.good).toBe(0.1);
  });

  it('has thresholds for all core metrics', () => {
    const thresholds = getVitalsThresholds();

    expect(thresholds).toHaveProperty('CLS');
    expect(thresholds).toHaveProperty('LCP');
    expect(thresholds).toHaveProperty('FCP');
    expect(thresholds).toHaveProperty('TTFB');
    expect(thresholds).toHaveProperty('INP');
    expect(thresholds).toHaveProperty('FID');
  });
});