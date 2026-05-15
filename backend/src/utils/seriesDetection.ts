// Auto-detection utility for series info from book titles

// Patterns for detecting series info from book titles
const patterns = [
  // Chinese: "XXX 第N卷" or "XXX 第N部" or "XXX 第N册"
  /^(.+?)\s*第(\d+)[卷部册]/,

  // English: "XXX Vol.N" or "XXX Volume N"
  /^(.+?)\s*(?:Vol\.?|Volume)\s*(\d+)/i,

  // Number in parentheses: "XXX (N)" or "XXX（N）"
  /^(.+?)\s*[（(]\s*(\d+)\s*[）)]/,

  // Hash prefix: "XXX #N" or "XXX ＃N"
  /^(.+?)\s*[#＃]\s*(\d+)/,
];

// Exclusion patterns to avoid false positives
const exclusionPatterns = [
  /^\d{4}$/, // Years like "1984", "2001"
  /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/, // Dates
];

export function detectSeriesInfo(title: string): { seriesName: string; index: number } | null {
  // Check exclusions first
  for (const pattern of exclusionPatterns) {
    if (pattern.test(title)) {
      return null;
    }
  }

  // Try each detection pattern
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      const seriesName = match[1].trim();
      const index = parseInt(match[2], 10);

      // Sanity checks
      if (seriesName.length < 2 || seriesName.length > 100) continue;
      if (index < 1 || index > 999) continue;

      return { seriesName, index };
    }
  }

  return null;
}

// Batch detection for multiple books
export function batchDetectSeries(
  titles: string[]
): Array<{ title: string; detected: { seriesName: string; index: number } | null }> {
  return titles.map(title => ({
    title,
    detected: detectSeriesInfo(title)
  }));
}
