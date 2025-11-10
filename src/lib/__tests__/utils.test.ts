import { 
  formatDuration, 
  formatNumber, 
  truncateText, 
  getInitials,
  cn,
} from '../utils';

describe('Utils', () => {
  describe('formatDuration', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatDuration(65)).toBe('1:05');
      expect(formatDuration(300)).toBe('5:00');
    });

    it('formats long duration to HH:MM:SS', () => {
      expect(formatDuration(3661)).toBe('1:01:01');
      expect(formatDuration(7200)).toBe('2:00:00');
    });

    it('handles zero', () => {
      expect(formatDuration(0)).toBe('0:00');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1.000');
      expect(formatNumber(1000000)).toBe('1.000.000');
    });

    it('handles small numbers', () => {
      expect(formatNumber(5)).toBe('5');
      expect(formatNumber(99)).toBe('99');
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      const longText = 'This is a very long text that needs to be truncated';
      expect(truncateText(longText, 20)).toBe('This is a very long ...');
    });

    it('keeps short text unchanged', () => {
      const shortText = 'Short';
      expect(truncateText(shortText, 20)).toBe('Short');
    });
  });

  describe('getInitials', () => {
    it('extracts initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
    });

    it('handles single name', () => {
      expect(getInitials('Alice')).toBe('A');
    });

    it('handles null/undefined', () => {
      expect(getInitials(null)).toBe('?');
      expect(getInitials(undefined)).toBe('?');
    });

    it('handles empty string', () => {
      expect(getInitials('')).toBe('?');
    });
  });

  describe('cn (className merge)', () => {
    it('merges className strings', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', false && 'not-included', true && 'included');
      expect(result).toContain('base');
      expect(result).toContain('included');
      expect(result).not.toContain('not-included');
    });
  });
});

