import { 
  moderateContent, 
  sanitizeText, 
  isSafeURL,
  validateVideoSubmission,
} from '../content-moderation';

describe('Content Moderation', () => {
  describe('moderateContent', () => {
    it('detects clean content', () => {
      const result = moderateContent('This is a clean educational video');
      expect(result.isClean).toBe(true);
      expect(result.flaggedWords).toHaveLength(0);
    });

    it('detects suspicious patterns', () => {
      const result = moderateContent('This video contains gambling content');
      expect(result.isClean).toBe(false);
      expect(result.severity).toBe('medium');
    });

    it('assigns correct severity levels', () => {
      const highSeverity = moderateContent('spam scam hate');
      expect(highSeverity.severity).toBe('high');
      
      const mediumSeverity = moderateContent('spam content');
      expect(mediumSeverity.severity).toBe('medium');
    });
  });

  describe('sanitizeText', () => {
    it('replaces inappropriate words with asterisks', () => {
      const result = sanitizeText('This is spam content');
      expect(result).toContain('***');
      expect(result).not.toContain('spam');
    });

    it('leaves clean text unchanged', () => {
      const cleanText = 'Clean educational content';
      expect(sanitizeText(cleanText)).toBe(cleanText);
    });
  });

  describe('isSafeURL', () => {
    it('allows YouTube URLs', () => {
      expect(isSafeURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
      expect(isSafeURL('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    });

    it('allows HTTPS MP4 URLs', () => {
      expect(isSafeURL('https://example.com/video.mp4')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isSafeURL('not-a-url')).toBe(false);
    });

    it('allows Vimeo URLs', () => {
      expect(isSafeURL('https://vimeo.com/123456789')).toBe(true);
    });
  });

  describe('validateVideoSubmission', () => {
    it('validates clean submission', () => {
      const result = validateVideoSubmission(
        'Math Tutorial',
        'Learn basic algebra',
        'https://www.youtube.com/watch?v=abc123'
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects inappropriate title', () => {
      const result = validateVideoSubmission(
        'spam spam spam',
        'Clean description',
        'https://www.youtube.com/watch?v=abc123'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects unsafe URLs', () => {
      const result = validateVideoSubmission(
        'Clean Title',
        'Clean description',
        'not-a-valid-url'
      );
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('URL video tidak valid atau tidak aman');
    });
  });
});

