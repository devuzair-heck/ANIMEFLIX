import { DEMO_ANIME } from './animeData';

export interface ValidationReport {
  totalAnime: number;
  missingPosters: string[];
  missingBanners: string[];
  duplicatePosters: string[];
  invalidUrls: string[];
  isValid: boolean;
}

/**
 * Validates the image completeness and uniqueness across the entire anime dataset.
 */
export function validateAnimeImages(): ValidationReport {
  const report: ValidationReport = {
    totalAnime: DEMO_ANIME.length,
    missingPosters: [],
    missingBanners: [],
    duplicatePosters: [],
    invalidUrls: [],
    isValid: true,
  };

  const posterMap = new Map<string, string>(); // url -> anime title

  for (const anime of DEMO_ANIME) {
    // 1. Check poster presence
    if (!anime.poster || anime.poster.trim() === '') {
      report.missingPosters.push(anime.title);
      report.isValid = false;
    } else {
      // Check duplicate poster
      if (posterMap.has(anime.poster)) {
        report.duplicatePosters.push(
          `"${anime.title}" shares poster with "${posterMap.get(anime.poster)}"`
        );
        report.isValid = false;
      } else {
        posterMap.set(anime.poster, anime.title);
      }

      // Check valid URL pattern
      if (!anime.poster.startsWith('http://') && !anime.poster.startsWith('https://')) {
        report.invalidUrls.push(`Poster for "${anime.title}": ${anime.poster}`);
        report.isValid = false;
      }
    }

    // 2. Check banner presence
    if (!anime.banner || anime.banner.trim() === '') {
      report.missingBanners.push(anime.title);
      report.isValid = false;
    } else if (!anime.banner.startsWith('http://') && !anime.banner.startsWith('https://')) {
      report.invalidUrls.push(`Banner for "${anime.title}": ${anime.banner}`);
      report.isValid = false;
    }
  }

  // Console output log
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) {
    console.group('🎨 [AnimeFlix Image Audit Report]');
    console.log(`Total Anime Scanned: ${report.totalAnime}`);
    console.log(`Missing Posters: ${report.missingPosters.length}`);
    console.log(`Missing Banners: ${report.missingBanners.length}`);
    console.log(`Duplicate Posters: ${report.duplicatePosters.length}`);
    console.log(`Invalid URLs: ${report.invalidUrls.length}`);
    console.log(`Overall Health Status: ${report.isValid ? '✅ PERFECT' : '⚠️ ISSUES DETECTED'}`);
    if (report.duplicatePosters.length > 0) {
      console.warn('Duplicates:', report.duplicatePosters);
    }
    console.groupEnd();
  }

  return report;
}
