export interface DiffChunk {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface DiffAnalysis {
  chunks: DiffChunk[];
  originalWordCount: number;
  refinedWordCount: number;
  wordCountDifference: number;
  percentageChange: number; // e.g. -25%
}

/**
 * Tokenize string into words and delimiters (spaces, punctuation)
 */
function tokenize(text: string): string[] {
  // Matches words or sequences of whitespace / punctuation
  const tokens = text.match(/\S+|\s+/g);
  return tokens || [];
}

/**
 * Compute Myers / LCS diff between two arrays of string tokens
 */
export function computeWordDiff(original: string, refined: string): DiffAnalysis {
  const origTokens = tokenize(original.trim());
  const refTokens = tokenize(refined.trim());

  // Standard DP for LCS
  // Note: if text is very long (e.g. > 1000 tokens), cap to prevent quadratic memory spike
  const maxTokens = 600;
  const origSlice = origTokens.slice(0, maxTokens);
  const refSlice = refTokens.slice(0, maxTokens);
  const nLen = origSlice.length;
  const mLen = refSlice.length;

  const dp: number[][] = Array.from({ length: nLen + 1 }, () => new Array(mLen + 1).fill(0));

  for (let i = 0; i < nLen; i++) {
    for (let j = 0; j < mLen; j++) {
      if (origSlice[i] === refSlice[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to assemble diff chunks
  let i = nLen;
  let j = mLen;
  const rawChunks: DiffChunk[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origSlice[i - 1] === refSlice[j - 1]) {
      rawChunks.unshift({ type: 'unchanged', text: origSlice[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawChunks.unshift({ type: 'added', text: refSlice[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawChunks.unshift({ type: 'removed', text: origSlice[i - 1] });
      i--;
    }
  }

  // Group adjacent identical types for clean rendering
  const mergedChunks: DiffChunk[] = [];
  for (const chunk of rawChunks) {
    const prev = mergedChunks[mergedChunks.length - 1];
    if (prev && prev.type === chunk.type) {
      prev.text += chunk.text;
    } else {
      mergedChunks.push({ ...chunk });
    }
  }

  const origWords = countWords(original);
  const refWords = countWords(refined);
  const wordDiff = refWords - origWords;
  const percentage = origWords > 0 ? Math.round((wordDiff / origWords) * 100) : 0;

  return {
    chunks: mergedChunks,
    originalWordCount: origWords,
    refinedWordCount: refWords,
    wordCountDifference: wordDiff,
    percentageChange: percentage,
  };
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

