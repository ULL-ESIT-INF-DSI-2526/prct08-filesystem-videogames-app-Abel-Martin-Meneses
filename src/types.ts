export interface SearchMatch {
  file: string;
  absolutePath: string;
  lines: number[];
}

export interface SearchReport {
  totalFilesAnalyzed: number;
  filesWithMatches: number;
  totalOccurrences: number;
}