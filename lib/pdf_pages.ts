/**
 * Karez 2.0 - PDF page renderer
 * Renders each page of a PDF to JPEG images so the AI can
 * analyse the full document, not just page 1.
 */

const PDFJS_BASE =
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build';

let pdfjsPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('PDF rendering is only available in the browser.');
  }
  if (!pdfjsPromise) {
    pdfjsPromise = import(
      /* webpackIgnore: true */ `${PDFJS_BASE}/pdf.min.mjs`
    ).then((mod: any) => {
      const pdfjs = mod?.default || mod;
      pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
      return pdfjs;
    });
    pdfjsPromise.catch(() => {
      pdfjsPromise = null;
    });
  }
  return pdfjsPromise;
}

export interface RenderedPdf {
  pageImages: string[];
  numPages: number;
}

export async function renderPdfToImages(
  file: File | Blob,
  maxPages: number = 12,
  scale: number = 1.5,
  jpegQuality: number = 0.8
): Promise<RenderedPdf> {
  const pdfjs = await loadPdfJs();
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;

  const numPages: number = doc.numPages;
  const pagesToRender = Math.min(numPages, Math.max(1, maxPages));
  const pageImages: string[] = [];

  for (let i = 1; i <= pagesToRender; i++) {
    const page = await doc.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create canvas context.');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    pageImages.push(canvas.toDataURL('image/jpeg', jpegQuality));
    page.cleanup?.();
  }

  doc.destroy?.();
  return { pageImages, numPages };
}
