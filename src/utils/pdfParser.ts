import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function extractTextFromPDF(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items = content.items.filter((item): item is TextItem => 'str' in item);

    let pageText = '';
    let lastX = 0;
    let lastWidth = 0;
    let lastY = 0;

    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      const str = item.str;

      if (str.length === 0) continue;

      // Get position from transform matrix [scaleX, skewX, skewY, scaleY, x, y]
      const x = item.transform[4];
      const y = item.transform[5];
      const charWidth = item.width / Math.max(str.length, 1);

      if (j === 0) {
        pageText = str;
      } else {
        // Check if this is a new line (significant Y change)
        const isNewLine = Math.abs(y - lastY) > 5;

        // Check horizontal gap between items
        const gap = x - (lastX + lastWidth);
        const isLargeGap = gap > charWidth * 0.3;

        // Determine if we need a space
        const lastChar = pageText.slice(-1);
        const firstChar = str.charAt(0);
        const lastEndsWithSpace = /\s$/.test(pageText);
        const startsWithSpace = /^\s/.test(str);

        if (isNewLine) {
          // New line - add space if needed
          if (!lastEndsWithSpace && !startsWithSpace) {
            pageText += ' ';
          }
          pageText += str;
        } else if (isLargeGap) {
          // Large horizontal gap - likely separate words
          if (!lastEndsWithSpace && !startsWithSpace) {
            pageText += ' ';
          }
          pageText += str;
        } else {
          // Small or no gap - likely same word or adjacent words
          // Check if the last item ended with punctuation followed by letter
          if (/[.!?,:;]$/.test(lastChar) && /^[A-Za-z]/.test(firstChar)) {
            pageText += ' ' + str;
          } else if (lastEndsWithSpace || startsWithSpace) {
            pageText += str;
          } else {
            // No gap and no spaces - join directly (same word)
            pageText += str;
          }
        }
      }

      lastX = x;
      lastWidth = item.width;
      lastY = y;
    }

    allText.push(pageText);
  }

  // Join all pages and clean up
  const fullText = allText.join(' ');

  // Normalize whitespace and split into words
  const words = fullText
    .replace(/\s+/g, ' ')  // Normalize multiple spaces
    .trim()
    .split(' ')
    .filter((word) => word.length > 0);

  return words;
}
