import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // 🌟 import change
import { createMultiBhajanDocument } from '@/lib/publication/content/selector';
import { renderToPDFBuffer } from '@/lib/publication/renderers/pdf/puppeteerRenderer';
import { ScriptLanguage } from '@/lib/publication/types';

// 🌟 FIX: Use Service Role Key to bypass RLS for Admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // यह RLS को बायपास कर देगा
);

export async function POST(req: Request) {
  try {
    const { slug } = await req.json();
    if (!slug) return NextResponse.json({ error: 'Slug is required' }, { status: 400 });

    // 1. Fetch E-Book metadata from DB
    const { data: ebook, error: ebookErr } = await supabaseAdmin
      .from('ebook_templates')
      .select('*')
      .eq('slug', slug)
      .single();

    // 🌟 FIX: Show exact database error if something is wrong
    if (ebookErr) {
      console.error("Supabase Error:", ebookErr);
      throw new Error(`डेटाबेस एरर: ${ebookErr.message}`);
    }
    if (!ebook) throw new Error(`ई-बुक (${slug}) डेटाबेस में नहीं मिली!`);

    // 2. Fetch required Bhajans
    let query = supabaseAdmin.from('mv_bhajan_details').select('slug');
    if (ebook.filter_deity_name) {
      query = query.eq('deity->>name_hindi', ebook.filter_deity_name);
    }
    if (ebook.filter_category_name) {
      query = query.contains('categories', JSON.stringify([{ name_hindi: ebook.filter_category_name }]));
    }
    
    const { data: bhajanList, error: bhajanErr } = await query.limit(ebook.target_count);
    if (bhajanErr) throw new Error("भजन फेच करने में समस्या!");

    const slugs = bhajanList?.map(b => b.slug) || [];
    if (slugs.length === 0) throw new Error("PDF बनाने के लिए कोई भजन नहीं मिला!");

    // 3. Prepare standard Document Model for Pre-built Book
    const opts = {
      script: 'devanagari' as ScriptLanguage,
      theme: 'default',
      themeName: 'default',
      pageSize: 'A4',
      includeMeaning: true,
      fontSizeScale: 1.0,
      customTitle: ebook.title
    };

    const model = await createMultiBhajanDocument(ebook.title, slugs, opts as any);
    if (!model) throw new Error("डॉक्यूमेंट मॉडल तैयार नहीं हो सका!");

    // 4. 🔥 Trigger Puppeteer rendering
    console.log(`[Admin] Generating PDF for ${slug}...`);
    const pdfBuffer = await renderToPDFBuffer(model);

    // 5. Upload PDF to Supabase Storage (ebook_pdfs bucket)
    const fileName = `${slug}.pdf`;
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('ebook_pdfs')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true, 
      });

    // 🌟 Throw exact storage error if it fails
    if (uploadErr) {
        console.error("Storage Upload Error Details:", uploadErr);
        throw new Error(`स्टोरेज में सेव नहीं हो सका: ${uploadErr.message}`);
    }

    // 6. Get Public URL and update the database
    const { data: publicUrlData } = supabaseAdmin.storage.from('ebook_pdfs').getPublicUrl(fileName);
    const pdfUrl = publicUrlData.publicUrl;

    const { error: updateErr } = await supabaseAdmin.from('ebook_templates').update({ pdf_url: pdfUrl }).eq('slug', slug);
    
    if (updateErr) {
        console.error("Database Update Error Details:", updateErr);
        throw new Error(`डेटाबेस अपडेट नहीं हो सका: ${updateErr.message}`);
    }

    return NextResponse.json({ success: true, url: pdfUrl });

  } catch (error: any) {
    console.error("❌ PDF Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}