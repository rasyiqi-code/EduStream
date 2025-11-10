/**
 * Content Moderation System
 * Simple profanity filter and inappropriate content detection
 */

// Daftar kata-kata yang tidak pantas (contoh sederhana)
// Untuk production, gunakan library seperti 'bad-words' atau API seperti Perspective API
const BLACKLIST_WORDS = [
  // Add inappropriate words here
  'spam',
  'scam',
  'hate',
  // Add more as needed
];

const SUSPICIOUS_PATTERNS = [
  /\b(judi|gambling)\b/i,
  /\b(porn|porno|xxx)\b/i,
  /\b(scam|penipuan)\b/i,
  /\b(clickbait)\b/i,
  /\b(virus|malware)\b/i,
];

export interface ModerationResult {
  isClean: boolean;
  flaggedWords: string[];
  suspiciousPatterns: string[];
  severity: 'low' | 'medium' | 'high';
  reason?: string;
}

/**
 * Check if text contains inappropriate content
 */
export function moderateContent(text: string): ModerationResult {
  const lowerText = text.toLowerCase();
  const flaggedWords: string[] = [];
  const suspiciousPatterns: string[] = [];

  // Check blacklist words
  BLACKLIST_WORDS.forEach((word) => {
    if (lowerText.includes(word.toLowerCase())) {
      flaggedWords.push(word);
    }
  });

  // Check suspicious patterns
  SUSPICIOUS_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(text)) {
      suspiciousPatterns.push(`Pattern ${index + 1}`);
    }
  });

  const totalFlags = flaggedWords.length + suspiciousPatterns.length;
  
  let severity: 'low' | 'medium' | 'high' = 'low';
  if (totalFlags >= 3) severity = 'high';
  else if (totalFlags >= 1) severity = 'medium';

  const isClean = totalFlags === 0;

  return {
    isClean,
    flaggedWords,
    suspiciousPatterns,
    severity,
    reason: !isClean 
      ? `Konten terdeteksi mengandung kata/pola yang tidak pantas` 
      : undefined,
  };
}

/**
 * Sanitize text by removing inappropriate content
 */
export function sanitizeText(text: string): string {
  let sanitized = text;
  
  BLACKLIST_WORDS.forEach((word) => {
    const regex = new RegExp(word, 'gi');
    sanitized = sanitized.replace(regex, '***');
  });

  return sanitized;
}

/**
 * Check if URL is safe (not leading to suspicious domains)
 */
export function isSafeURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Whitelist of allowed video domains
    const allowedDomains = [
      'youtube.com',
      'youtu.be',
      'youtube-nocookie.com',
      'vimeo.com',
      // Add more trusted domains
    ];

    // Check if domain is in whitelist for YouTube/Vimeo
    if (urlObj.hostname.includes('youtube') || urlObj.hostname.includes('vimeo')) {
      return true;
    }

    // For MP4 URLs, allow any HTTPS
    if (urlObj.protocol === 'https:' && url.endsWith('.mp4')) {
      return true;
    }

    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

/**
 * Validate video submission
 */
export interface VideoValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateVideoSubmission(
  title: string,
  description: string,
  url: string
): VideoValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check title
  const titleModeration = moderateContent(title);
  if (!titleModeration.isClean) {
    if (titleModeration.severity === 'high') {
      errors.push('Judul mengandung konten yang tidak pantas');
    } else {
      warnings.push('Judul mungkin mengandung konten yang tidak pantas');
    }
  }

  // Check description
  if (description) {
    const descModeration = moderateContent(description);
    if (!descModeration.isClean) {
      if (descModeration.severity === 'high') {
        errors.push('Deskripsi mengandung konten yang tidak pantas');
      } else {
        warnings.push('Deskripsi mungkin mengandung konten yang tidak pantas');
      }
    }
  }

  // Check URL safety
  if (!isSafeURL(url)) {
    errors.push('URL video tidak valid atau tidak aman');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

