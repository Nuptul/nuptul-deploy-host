/**
 * Adobe Fonts API Integration Service
 * Provides access to Adobe Fonts library for enhanced typography
 */

const ADOBE_FONTS_API_KEY = 'e7315ac3df6e576b0d6010dbd49b3b4b8d6ce903';
const ADOBE_FONTS_BASE_URL = 'https://typekit.com/api/v1/json';

export interface AdobeFont {
  id: string;
  name: string;
  family: string;
  slug: string;
  css_names: string[];
  variations: FontVariation[];
  foundry: {
    name: string;
    slug: string;
  };
  classification: string;
  web_link: string;
}

export interface FontVariation {
  fvs: string;
  name: string;
}

export interface AdobeFontKit {
  id: string;
  name: string;
  analytics: boolean;
  badge: boolean;
  domains: string[];
  families: FontFamily[];
}

export interface FontFamily {
  id: string;
  name: string;
  slug: string;
  css_names: string[];
  variations: string[];
}

class AdobeFontsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ADOBE_FONTS_API_KEY;
    this.baseUrl = ADOBE_FONTS_BASE_URL;
  }

  /**
   * Search Adobe Fonts library
   */
  async searchFonts(query: string, limit: number = 20): Promise<AdobeFont[]> {
    try {
      const url = `${this.baseUrl}/families?q=${encodeURIComponent(query)}&limit=${limit}&format=json`;
      const response = await fetch(url, {
        headers: {
          'X-Typekit-Token': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Adobe Fonts API error: ${response.status}`);
      }

      const data = await response.json();
      return data.families || [];
    } catch (error) {
      console.error('Error searching Adobe Fonts:', error);
      return [];
    }
  }

  /**
   * Get wedding-appropriate font collections
   */
  async getWeddingFonts(): Promise<AdobeFont[]> {
    const weddingQueries = [
      'elegant',
      'script',
      'serif',
      'calligraphy',
      'wedding',
      'formal',
      'romantic'
    ];

    try {
      const fontPromises = weddingQueries.map(query => this.searchFonts(query, 10));
      const fontResults = await Promise.all(fontPromises);
      
      // Combine and deduplicate fonts
      const allFonts = fontResults.flat();
      const uniqueFonts = allFonts.filter((font, index, self) => 
        index === self.findIndex(f => f.id === font.id)
      );

      return uniqueFonts.slice(0, 50); // Limit to 50 fonts
    } catch (error) {
      console.error('Error getting wedding fonts:', error);
      return [];
    }
  }

  /**
   * Create or get font kit for the website
   */
  async createFontKit(name: string, domains: string[], fontIds: string[]): Promise<AdobeFontKit | null> {
    try {
      const url = `${this.baseUrl}/kits`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Typekit-Token': this.apiKey,
        },
        body: JSON.stringify({
          name,
          domains,
          families: fontIds.map(id => ({ id }))
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating font kit: ${response.status}`);
      }

      const data = await response.json();
      return data.kit;
    } catch (error) {
      console.error('Error creating font kit:', error);
      return null;
    }
  }

  /**
   * Load Adobe Font CSS dynamically
   */
  loadFontCSS(kitId: string): void {
    if (document.getElementById(`adobe-fonts-${kitId}`)) {
      return; // Already loaded
    }

    const link = document.createElement('link');
    link.id = `adobe-fonts-${kitId}`;
    link.rel = 'stylesheet';
    link.href = `https://use.typekit.net/${kitId}.css`;
    document.head.appendChild(link);
  }

  /**
   * Get curated wedding font collection with local fallbacks
   */
  getCuratedWeddingFonts(): Array<{name: string, family: string, category: 'serif' | 'script' | 'sans-serif'}> {
    return [
      // Elegant Serifs
      { name: 'Playfair Display', family: '"Playfair Display", serif', category: 'serif' },
      { name: 'Crimson Text', family: '"Crimson Text", serif', category: 'serif' },
      { name: 'Lora', family: 'Lora, serif', category: 'serif' },
      { name: 'Merriweather', family: 'Merriweather, serif', category: 'serif' },
      { name: 'EB Garamond', family: '"EB Garamond", serif', category: 'serif' },
      
      // Script & Calligraphy
      { name: 'Dancing Script', family: '"Dancing Script", cursive', category: 'script' },
      { name: 'Great Vibes', family: '"Great Vibes", cursive', category: 'script' },
      { name: 'Pinyon Script', family: '"Pinyon Script", cursive', category: 'script' },
      { name: 'Alex Brush', family: '"Alex Brush", cursive', category: 'script' },
      { name: 'Allura', family: 'Allura, cursive', category: 'script' },
      
      // Clean Sans-Serif
      { name: 'Inter', family: 'Inter, sans-serif', category: 'sans-serif' },
      { name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans-serif' },
      { name: 'Lato', family: 'Lato, sans-serif', category: 'sans-serif' },
      { name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'sans-serif' },
      { name: 'Poppins', family: 'Poppins, sans-serif', category: 'sans-serif' },
    ];
  }
}

export const adobeFontsService = new AdobeFontsService();