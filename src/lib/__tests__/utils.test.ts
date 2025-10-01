import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utils', () => {
  it('cn merges class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('cn handles undefined values', () => {
    const result = cn('text-red-500', undefined, 'bg-blue-500');
    expect(result).toBeTruthy();
  });
});
