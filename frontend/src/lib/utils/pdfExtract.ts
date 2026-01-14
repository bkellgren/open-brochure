/**
 * PDF extraction utilities using pdf.js
 * Lazy-loaded to reduce initial bundle size
 */
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

let pdfjs: typeof import('pdfjs-dist') | null = null;

/**
 * Lazy load pdf.js library
 */
async function loadPdfJs() {
  if (!pdfjs) {
    pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  }
  return pdfjs;
}

/**
 * Extract pages from a PDF file as image data URLs
 */
export async function extractPdfPages(
  file: File,
  maxPages = 2
): Promise<string[]> {
  const pdfjsLib = await loadPdfJs();

  // Load PDF from file
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageCount = Math.min(pdf.numPages, maxPages);
  const pages: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 }); // Higher scale for quality

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render page to canvas
    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    // Convert to data URL
    pages.push(canvas.toDataURL('image/jpeg', 0.9));
  }

  return pages;
}

/**
 * Combine multiple PDF pages into a single image
 * Stacks pages vertically for panel detection
 */
export async function combinePdfPages(file: File): Promise<string> {
  const pages = await extractPdfPages(file, 2);

  if (pages.length === 0) {
    throw new Error('PDF has no pages');
  }

  if (pages.length === 1) {
    return pages[0];
  }

  // Load both page images
  const images = await Promise.all(
    pages.map(
      (dataUrl) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = dataUrl;
        })
    )
  );

  // Create combined canvas (stack vertically)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // Assume same width, stack heights
  canvas.width = images[0].width;
  canvas.height = images.reduce((sum, img) => sum + img.height, 0);

  // Draw pages
  let y = 0;
  for (const img of images) {
    ctx.drawImage(img, 0, y);
    y += img.height;
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}
