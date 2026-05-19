/**
 * Responsive Image Utility
 * 
 * Ensures images never appear broken/pixelated on ANY device:
 * - Mobile phones (320px - 480px)
 * - Tablets (481px - 768px)
 * - Laptops (769px - 1024px)
 * - Desktops (1025px+)
 * - PWA installed apps (standalone mode)
 * 
 * Uses srcSet-like approach with proper sizing and fallback to placeholder
 */

export type PlaceholderType = 'kegiatan' | 'profile' | 'document' | 'banner' | 'default';

// Placeholder paths mapped to types
const PLACEHOLDER_MAP: Record<PlaceholderType, string> = {
    kegiatan: '/images/placeholders/kegiatan.png',
    profile: '/images/placeholders/profile.png',
    document: '/images/placeholders/document.png',
    banner: '/images/placeholders/banner.png',
    default: '/images/placeholders/kegiatan.png',
};

/**
 * Get the appropriate placeholder image path based on content type
 */
export function getPlaceholder(type: PlaceholderType = 'default'): string {
    return PLACEHOLDER_MAP[type] || PLACEHOLDER_MAP.default;
}

/**
 * Generate responsive sizes attribute for Next.js Image component
 * Based on the layout context where the image is used
 */
export type ImageLayout = 'full-width' | 'half-width' | 'third-width' | 'quarter-width' | 'card' | 'thumbnail' | 'hero';

export function getResponsiveSizes(layout: ImageLayout): string {
    switch (layout) {
        case 'hero':
            return '100vw';
        case 'full-width':
            return '(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw';
        case 'half-width':
            return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw';
        case 'third-width':
            return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw';
        case 'quarter-width':
            return '(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw';
        case 'card':
            return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
        case 'thumbnail':
            return '(max-width: 640px) 25vw, 128px';
        default:
            return '(max-width: 640px) 100vw, 50vw';
    }
}

/**
 * Device pixel ratio aware quality settings
 * Returns optimal quality based on expected viewing conditions
 */
export function getImageQuality(layout: ImageLayout): number {
    switch (layout) {
        case 'hero':
        case 'full-width':
            return 85;
        case 'half-width':
        case 'card':
            return 80;
        case 'third-width':
        case 'quarter-width':
            return 75;
        case 'thumbnail':
            return 70;
        default:
            return 80;
    }
}

/**
 * CSS object-fit strategy based on aspect ratio expectations
 */
export type AspectRatio = '16:10' | '16:9' | '4:3' | '1:1' | '21:9' | 'auto';

export function getAspectRatioClass(ratio: AspectRatio): string {
    switch (ratio) {
        case '16:10':
            return 'aspect-[16/10]';
        case '16:9':
            return 'aspect-video';
        case '4:3':
            return 'aspect-[4/3]';
        case '1:1':
            return 'aspect-square';
        case '21:9':
            return 'aspect-[21/9]';
        case 'auto':
            return '';
        default:
            return 'aspect-video';
    }
}

/**
 * Build a blur data URL for placeholder while loading
 * Uses a tiny colored SVG as low-quality image placeholder (LQIP)
 */
export function generateBlurPlaceholder(color: string = '#e2e8f0'): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="25" viewBox="0 0 40 25">
        <rect width="40" height="25" fill="${color}" rx="4"/>
        <circle cx="20" cy="12" r="4" fill="${adjustColor(color, -20)}" opacity="0.3"/>
    </svg>`;
    return `data:image/svg+xml;base64,${typeof window !== 'undefined' ? window.btoa(svg) : Buffer.from(svg).toString('base64')}`;
}

function adjustColor(hex: string, amount: number): string {
    const clamp = (n: number) => Math.min(255, Math.max(0, n));
    const num = parseInt(hex.replace('#', ''), 16);
    const r = clamp(((num >> 16) & 0xFF) + amount);
    const g = clamp(((num >> 8) & 0xFF) + amount);
    const b = clamp((num & 0xFF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
