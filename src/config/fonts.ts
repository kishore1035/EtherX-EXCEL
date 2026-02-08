/**
 * SINGLE SOURCE OF TRUTH - FONT REGISTRY
 * All font selections must reference this registry
 */

export interface FontDefinition {
  name: string;
  css: string;
  googleFont?: boolean;
  weights?: number[];
}

export const FONT_REGISTRY: FontDefinition[] = [
  // System Fonts
  {
    name: "Arial",
    css: "'Arial', sans-serif",
    googleFont: false
  },
  {
    name: "Helvetica",
    css: "'Helvetica', sans-serif",
    googleFont: false
  },
  {
    name: "Times New Roman",
    css: "'Times New Roman', serif",
    googleFont: false
  },
  {
    name: "Georgia",
    css: "'Georgia', serif",
    googleFont: false
  },
  {
    name: "Courier New",
    css: "'Courier New', monospace",
    googleFont: false
  },
  {
    name: "Verdana",
    css: "'Verdana', sans-serif",
    googleFont: false
  },
  
  // Google Fonts
  {
    name: "Roboto",
    css: "'Roboto', sans-serif",
    googleFont: true,
    weights: [300, 400, 500, 700]
  },
  {
    name: "Inter",
    css: "'Inter', sans-serif",
    googleFont: true,
    weights: [300, 400, 500, 600, 700]
  },
  {
    name: "Poppins",
    css: "'Poppins', sans-serif",
    googleFont: true,
    weights: [300, 400, 500, 600, 700]
  },
  {
    name: "Open Sans",
    css: "'Open Sans', sans-serif",
    googleFont: true,
    weights: [300, 400, 600, 700]
  },
  {
    name: "Montserrat",
    css: "'Montserrat', sans-serif",
    googleFont: true,
    weights: [300, 400, 500, 600, 700]
  },
  {
    name: "Lato",
    css: "'Lato', sans-serif",
    googleFont: true,
    weights: [300, 400, 700]
  },
  {
    name: "Nunito",
    css: "'Nunito', sans-serif",
    googleFont: true,
    weights: [300, 400, 600, 700]
  },
  {
    name: "Raleway",
    css: "'Raleway', sans-serif",
    googleFont: true,
    weights: [300, 400, 500, 600, 700]
  },
  {
    name: "Merriweather",
    css: "'Merriweather', serif",
    googleFont: true,
    weights: [300, 400, 700]
  },
  {
    name: "PT Sans",
    css: "'PT Sans', sans-serif",
    googleFont: true,
    weights: [400, 700]
  },
  {
    name: "Playfair Display",
    css: "'Playfair Display', serif",
    googleFont: true,
    weights: [400, 700]
  },
  {
    name: "Source Sans Pro",
    css: "'Source Sans Pro', sans-serif",
    googleFont: true,
    weights: [300, 400, 600, 700]
  }
];

/**
 * Get font CSS string by font name
 */
export function getFontCSS(fontName: string): string {
  const font = FONT_REGISTRY.find(f => f.name === fontName);
  return font ? font.css : "'Arial', sans-serif"; // Fallback
}

/**
 * Get font definition by name
 */
export function getFontDefinition(fontName: string): FontDefinition | undefined {
  return FONT_REGISTRY.find(f => f.name === fontName);
}

/**
 * Generate Google Fonts import URL
 */
export function generateGoogleFontsURL(): string {
  const googleFonts = FONT_REGISTRY.filter(f => f.googleFont);
  
  if (googleFonts.length === 0) return "";
  
  const fontParams = googleFonts.map(font => {
    const weights = font.weights || [400];
    const weightsStr = weights.join(';');
    const familyName = font.name.replace(/ /g, '+');
    return `family=${familyName}:wght@${weightsStr}`;
  }).join('&');
  
  return `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;
}

/**
 * Validate if font is loaded
 */
export async function isFontLoaded(fontFamily: string): Promise<boolean> {
  if (!document.fonts) return true; // Fallback for older browsers
  
  try {
    await document.fonts.load(`16px ${fontFamily}`);
    return document.fonts.check(`16px ${fontFamily}`);
  } catch (e) {
    console.warn(`Font validation failed for ${fontFamily}:`, e);
    return false;
  }
}

/**
 * Get computed font family from element
 */
export function getComputedFontFamily(element: HTMLElement): string {
  return window.getComputedStyle(element).fontFamily;
}

/**
 * Default font
 */
export const DEFAULT_FONT = FONT_REGISTRY[0]; // Arial
