// ==========================================
// 🌟 PUPPETEER PDF RENDERER (TypeScript Build Safe)
// ==========================================
import { PDFDocument } from 'pdf-lib';
import { getBrowserInstance } from './browserPool';
import { generatePrintHTML } from './htmlTemplate';
import { PublicationDocument } from '../../types';

export async function renderToPDFBuffer(doc: PublicationDocument): Promise<Buffer> {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    const htmlContent = generatePrintHTML(doc);

    // 1. HTML सेट करें ('load' वैलिड इवेंट है)
    await page.setContent(htmlContent, {
      waitUntil: 'load',
    });

    // 2. Race Condition Fix: सुनिश्चित करें कि Google Devanagari Font पूरी तरह लोड हो चुका है
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // 3. Puppeteer से Raw Print-Ready PDF Buffer जनरेट करें
    const rawPdfBuffer = await page.pdf({
      format: doc.config.pageSize.toLowerCase() === 'a5' ? 'A5' : 'A4',
      printBackground: true,
      preferCSSPageSize: true, // @page CSS नियमों का पालन करें
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    // 4. pdf-lib के ज़रिए डॉक्यूमेंट मेटाडेटा और स्ट्रीम ऑप्टिमाइज़ेशन (बिना अमान्य permissions प्रॉपर्टी के)
    const pdfDoc = await PDFDocument.load(rawPdfBuffer);
    pdfDoc.setTitle(doc.metadata.title || 'Hindi Bhajan Manjari Book');
    pdfDoc.setAuthor('Hindi Bhajan Manjari');
    pdfDoc.setProducer('Hindi Bhajan Manjari Publication Engine');

    const optimizedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    return Buffer.from(optimizedPdfBytes);
  } finally {
    // Memory Leak Protection: हर PDF जनरेशन के बाद पेज बंद करें, ब्राउज़र नहीं
    await page.close();
  }
}