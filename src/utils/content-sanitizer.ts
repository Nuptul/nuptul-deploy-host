// Content sanitization utility for safe HTML rendering

import DOMPurify from 'dompurify';

interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripTags?: boolean;
  allowLinks?: boolean;
  allowImages?: boolean;
}

class ContentSanitizer {
  private defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'span', 'div'
    ],
    ALLOWED_ATTR: [
      'class', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      'script', 'object', 'embed', 'form', 'input', 'button', 'iframe'
    ],
    FORBID_ATTR: [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
      'onfocus', 'onblur', 'onchange', 'onsubmit'
    ]
  };

  private richTextConfig: DOMPurify.Config = {
    ...this.defaultConfig,
    ALLOWED_TAGS: [
      ...this.defaultConfig.ALLOWED_TAGS!,
      'a', 'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: [
      ...this.defaultConfig.ALLOWED_ATTR!,
      'href', 'src', 'alt', 'title', 'target'
    ]
  };

  // Basic text sanitization (strip all HTML)
  sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true
    });
  }

  // Safe HTML sanitization for user content
  sanitizeHTML(input: string, options: SanitizeOptions = {}): string {
    if (!input || typeof input !== 'string') return '';

    const config: DOMPurify.Config = { ...this.defaultConfig };

    // Apply custom options
    if (options.allowedTags) {
      config.ALLOWED_TAGS = options.allowedTags;
    }

    if (options.allowedAttributes) {
      config.ALLOWED_ATTR = Object.values(options.allowedAttributes).flat();
    }

    if (options.stripTags) {
      config.ALLOWED_TAGS = [];
      config.KEEP_CONTENT = true;
    }

    if (options.allowLinks) {
      config.ALLOWED_TAGS = [...(config.ALLOWED_TAGS || []), 'a'];
      config.ALLOWED_ATTR = [...(config.ALLOWED_ATTR || []), 'href', 'target', 'rel'];
    }

    if (options.allowImages) {
      config.ALLOWED_TAGS = [...(config.ALLOWED_TAGS || []), 'img'];
      config.ALLOWED_ATTR = [...(config.ALLOWED_ATTR || []), 'src', 'alt', 'width', 'height'];
    }

    // Add additional security hooks
    DOMPurify.addHook('beforeSanitizeElements', (node) => {
      // Ensure all links are safe
      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && !this.isValidUrl(href)) {
          node.removeAttribute('href');
        } else if (href && !href.startsWith(window.location.origin)) {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      }

      // Ensure all images are from safe sources
      if (node.tagName === 'IMG') {
        const src = node.getAttribute('src');
        if (src && !this.isValidImageUrl(src)) {
          node.remove();
        }
      }
    });

    return DOMPurify.sanitize(input, config);
  }

  // Rich text editor content sanitization
  sanitizeRichText(input: string): string {
    if (!input || typeof input !== 'string') return '';

    return DOMPurify.sanitize(input, this.richTextConfig);
  }

  // URL validation
  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      
      // Allow relative URLs and HTTPS URLs
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:' || url.startsWith('/')) {
        return true;
      }
      
      // Block dangerous protocols
      const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:'];
      return !dangerousProtocols.some(protocol => url.toLowerCase().startsWith(protocol));
    } catch {
      return false;
    }
  }

  // Image URL validation
  private isValidImageUrl(url: string): boolean {
    try {
      const parsed = new URL(url, window.location.origin);
      
      // Allow relative URLs and HTTPS URLs from trusted domains
      if (url.startsWith('/') || url.startsWith('./')) {
        return true;
      }

      // Whitelist trusted image domains
      const trustedDomains = [
        'images.unsplash.com',
        'via.placeholder.com',
        'i.ibb.co',
        window.location.hostname,
        // Add your Supabase storage domain
        'supabase.co'
      ];

      return parsed.protocol === 'https:' && 
             trustedDomains.some(domain => parsed.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  // Create safe dangerouslySetInnerHTML object
  createSafeHTML(content: string, options: SanitizeOptions = {}): { __html: string } {
    return {
      __html: this.sanitizeHTML(content, options)
    };
  }

  // Create safe rich text HTML
  createSafeRichTextHTML(content: string): { __html: string } {
    return {
      __html: this.sanitizeRichText(content)
    };
  }

  // Validate and sanitize user input before storage
  sanitizeForStorage(input: string, type: 'text' | 'html' | 'richtext' = 'text'): string {
    switch (type) {
      case 'html':
        return this.sanitizeHTML(input);
      case 'richtext':
        return this.sanitizeRichText(input);
      default:
        return this.sanitizeText(input);
    }
  }
}

// Create singleton instance
export const contentSanitizer = new ContentSanitizer();

// Convenient helper functions
export const sanitizeText = (text: string) => contentSanitizer.sanitizeText(text);
export const sanitizeHTML = (html: string, options?: SanitizeOptions) => 
  contentSanitizer.sanitizeHTML(html, options);
export const sanitizeRichText = (html: string) => contentSanitizer.sanitizeRichText(html);
export const createSafeHTML = (content: string, options?: SanitizeOptions) =>
  contentSanitizer.createSafeHTML(content, options);
export const createSafeRichTextHTML = (content: string) =>
  contentSanitizer.createSafeRichTextHTML(content);

export default contentSanitizer;