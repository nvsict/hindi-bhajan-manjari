// ==========================================
// 🌟 PUPPETEER PDF RENDERER (Production Chunking Engine)
// ==========================================
import { PDFDocument } from 'pdf-lib';
import { getBrowserInstance } from './browserPool';
import { generatePrintHTML } from './htmlTemplate';
import { PublicationDocument } from '../../types';

// 🌟 CONFIG: Maximum chapters to render in a single Chromium pass.
// 50 is a very safe limit to prevent memory/timeout crashes on small servers.
const CHUNK_SIZE = 50; 

/**
 * Helper: Puppeteer के जरिए HTML स्ट्रिंग को PDF Buffer में बदलता है।
 * यह आपके उसी Adaptive Engine का इस्तेमाल करता है।
 */
async function renderHtmlChunkToPDF(htmlContent: string, format: 'A4' | 'A5'): Promise<Buffer> {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    // 1. HTML सेट करें
    await page.setContent(htmlContent, {
      waitUntil: 'load',
      timeout: 60000 // 60 seconds per chunk is plenty
    });

    // 2. Race Condition Fix: सुनिश्चित करें कि Google Font लोड हो चुका है
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // 3. 🌟 SMART PER-CHAPTER MEASUREMENT ENGINE 🌟
    await page.emulateMediaType('print');
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.evaluate(() => {
      const chapters = document.querySelectorAll('.dynamic-chapter');
      if (chapters.length === 0) return;

      const profiles = [
        'layout-single-standard',
        'layout-single-compact',
        'layout-two-column',
        'layout-two-column-compact'
      ];

      const MAX_SAFE_HEIGHT = 960;

      chapters.forEach((chapter) => {
        let bestProfile = profiles[profiles.length - 1];

        for (const profile of profiles) {
          chapter.className = `chapter dynamic-chapter ${profile}`;
          const currentHeight = chapter.getBoundingClientRect().height;

          if (currentHeight <= MAX_SAFE_HEIGHT) {
            bestProfile = profile;
            break; 
          }
        }
        chapter.className = `chapter dynamic-chapter ${bestProfile}`;
      });
    });

    // 4. Puppeteer से Raw Print-Ready PDF Buffer जनरेट करें
    const rawPdfBuffer = await page.pdf({
      format: format,
      printBackground: true,
      preferCSSPageSize: true, 
      timeout: 90000, // 90 Seconds timeout strictly for this 50-page chunk
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    return Buffer.from(rawPdfBuffer);
  } finally {
    // हर चंक रेंडर होने के बाद पेज को बंद करना बहुत ज़रूरी है (Memory Leak से बचने के लिए)
    await page.close();
  }
}

/**
 * 🌟 MAIN FUNCTION: Chunking & Merging Engine
 */
export async function renderToPDFBuffer(doc: PublicationDocument): Promise<Buffer> {
  const totalChapters = doc.chapters.length;

  // 🌟 FAST PATH: अगर ई-बुक छोटी है (<= CHUNK_SIZE), तो पुराने तरीके से सिंगल पास में रेंडर करें
  if (totalChapters <= CHUNK_SIZE) {
    // यहाँ doc.chapters में सारे भजन हैं, तो अलग से allChapters पास करने की ज़रूरत नहीं है।
    const htmlContent = generatePrintHTML(doc);
    const pdfFormat = doc.config.pageSize?.toLowerCase() === 'a5' ? 'A5' : 'A4';
    const singlePdfBuffer = await renderHtmlChunkToPDF(htmlContent, pdfFormat);
    
    // Optimize & Return
    const pdfDoc = await PDFDocument.load(singlePdfBuffer);
    pdfDoc.setTitle(doc.metadata.title || 'Hindi Bhajan Manjari Book');
    pdfDoc.setAuthor('Hindi Bhajan Manjari');
    pdfDoc.setProducer('Hindi Bhajan Manjari Publication Engine');
    
    const optimizedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
    return Buffer.from(optimizedPdfBytes);
  }

  // ==========================================
  // 🌟 HEAVY DUTY PATH: Chunking for Large Books
  // ==========================================
  console.log(`[PDF BUILDER] Large book detected (${totalChapters} chapters). Starting Chunking Engine...`);
  
  const mergedPdf = await PDFDocument.create();
  const pdfFormat = doc.config.pageSize?.toLowerCase() === 'a5' ? 'A5' : 'A4';
  
  // Chunking Loop
  for (let i = 0; i < totalChapters; i += CHUNK_SIZE) {
    const chunkChapters = doc.chapters.slice(i, i + CHUNK_SIZE);
    console.log(`[PDF BUILDER] Processing chunk ${i + 1} to ${Math.min(i + CHUNK_SIZE, totalChapters)}...`);

    // Create a temporary document just for this chunk.
    const isFirstChunk = i === 0;
    
    const chunkDoc: any = {
      ...doc,
      chapters: chunkChapters,
      // 🌟 FIX: We pass ALL chapters here so the HTML Template can build a full 100% Index
      allChapters: doc.chapters, 
      _isFirstChunk: isFirstChunk 
    }; 

    // Generate HTML just for this subset
    const chunkHtml = generatePrintHTML(chunkDoc);
    
    // Render this specific HTML chunk via Puppeteer
    const chunkPdfBuffer = await renderHtmlChunkToPDF(chunkHtml, pdfFormat);

    // Merge this chunk's PDF pages into our master PDF document
    const chunkPdfDoc = await PDFDocument.load(chunkPdfBuffer);
    const copiedPages = await mergedPdf.copyPages(chunkPdfDoc, chunkPdfDoc.getPageIndices());
    
    copiedPages.forEach((page) => {
      mergedPdf.addPage(page);
    });
  }

  console.log(`[PDF BUILDER] All chunks processed and merged successfully.`);

  // 🌟 Set Metadata on Final Merged Document
  mergedPdf.setTitle(doc.metadata.title || 'Hindi Bhajan Manjari Book');
  mergedPdf.setAuthor('Hindi Bhajan Manjari');
  mergedPdf.setProducer('Hindi Bhajan Manjari Publication Engine');

  const optimizedMergedBytes = await mergedPdf.save({
    useObjectStreams: false,
  });

  return Buffer.from(optimizedMergedBytes);
}