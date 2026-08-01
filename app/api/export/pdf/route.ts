// ==========================================
// 🌟 NEXT.JS SERVER API ROUTE: /api/export/pdf
// ==========================================
import { NextRequest, NextResponse } from 'next/server';
import { renderToPDFBuffer } from '@/lib/publication/renderers/pdf/puppeteerRenderer';
import { PublicationDocument } from '@/lib/publication/types';

export async function POST(req: NextRequest) {
  try {
    const docModel: PublicationDocument = await req.json();

    if (!docModel || !docModel.chapters || docModel.chapters.length === 0) {
      return NextResponse.json(
        { error: 'Invalid Document Model provided.' },
        { status: 400 }
      );
    }

    // Puppeteer से PDF Buffer बनाएं
    const pdfBuffer = await renderToPDFBuffer(docModel);

    // सुरक्षित फ़ाइल नाम बनाएं
    const safeTitle = (docModel.metadata.title || 'Bhajan_Sangrah')
      .replace(/[^a-zA-Z0-9\u0900-\u097F-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    // 🌟 FIX: Buffer को Uint8Array में बदलें ताकि TypeScript (BodyInit) खुश रहे
    const webCompatibleBuffer = new Uint8Array(pdfBuffer);

    // PDF Stream रिस्पॉन्स
    return new NextResponse(webCompatibleBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(safeTitle)}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('❌ [API /export/pdf] Puppeteer Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF on server.' },
      { status: 500 }
    );
  }
}