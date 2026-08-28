// ==========================================
// 🌟 PUPPETEER PDF RENDERER (Smart Adaptive Engine - Per Chapter)
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

    // 1. HTML सेट करें
    await page.setContent(htmlContent, {
      waitUntil: 'load',
    });

    // 2. Race Condition Fix: सुनिश्चित करें कि Google Font लोड हो चुका है
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    // 3. 🌟 SMART PER-CHAPTER MEASUREMENT ENGINE 🌟
    await page.emulateMediaType('print');
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });

    await page.evaluate(() => {
      // पेज पर मौजूद सभी भजनों (Chapters) को सिलेक्ट करें
      const chapters = document.querySelectorAll('.dynamic-chapter');
      if (chapters.length === 0) return;

      const profiles = [
        'layout-single-standard',
        'layout-single-compact',
        'layout-two-column',
        'layout-two-column-compact'
      ];

      // A4 सेफ हाइट (Top 22mm + Bottom 22mm margin घटाकर)
      const MAX_SAFE_HEIGHT = 960;

      // हर भजन के लिए अलग-अलग बेस्ट लेआउट तय करें
      chapters.forEach((chapter) => {
        let bestProfile = profiles[profiles.length - 1]; // Default to compact

        for (const profile of profiles) {
          // पिछले प्रोफाइल्स को हटाकर नया टेस्ट प्रोफाइल लगाएँ 
          // (नोट: 'chapter' और 'dynamic-chapter' क्लासेज़ हमेशा बनी रहनी चाहिए)
          chapter.className = `chapter dynamic-chapter ${profile}`;
          
          // इस अकेले भजन (Chapter) की हाइट नापें
          const currentHeight = chapter.getBoundingClientRect().height;

          // अगर यह भजन इस लेआउट में 1 पेज के अंदर आ रहा है, तो यही परफेक्ट है
          if (currentHeight <= MAX_SAFE_HEIGHT) {
            bestProfile = profile;
            break; 
          }
        }

        // लूप खत्म होने के बाद, इस भजन को इसका अपना बेस्ट लेआउट दे दें
        chapter.className = `chapter dynamic-chapter ${bestProfile}`;
      });
    });

    // 4. Puppeteer से Raw Print-Ready PDF Buffer जनरेट करें
    const rawPdfBuffer = await page.pdf({
      format: doc.config.pageSize?.toLowerCase() === 'a5' ? 'A5' : 'A4',
      printBackground: true,
      preferCSSPageSize: true, 
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm',
      },
    });

    // 5. pdf-lib के ज़रिए मेटाडेटा ऑप्टिमाइज़ेशन
    const pdfDoc = await PDFDocument.load(rawPdfBuffer);
    pdfDoc.setTitle(doc.metadata.title || 'Hindi Bhajan Manjari Book');
    pdfDoc.setAuthor('Hindi Bhajan Manjari');
    pdfDoc.setProducer('Hindi Bhajan Manjari Publication Engine');

    const optimizedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
    });

    return Buffer.from(optimizedPdfBytes);
  } finally {
    // हर PDF जनरेशन के बाद पेज बंद करें
    await page.close();
  }
}