"use server";

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// 🌟 एडमिन क्लाइंट (Service Role Key)
// यह कोड सिर्फ सर्वर पर चलेगा, इसलिए यहाँ Service Role Key का इस्तेमाल 100% सुरक्षित है।
// यह RLS को बायपास करके मास्टर राइट्स के साथ डेटा सेव करेगा।
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// स्लग जनरेट करने का हेल्पर फंक्शन (सर्वर साइड)
const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export async function publishBhajanAction(payload: any) {
  const { formData, faqs, selectedArtists, categories, pendingId } = payload;
  
  let newBhajanId: string | null = null;

  try {
    let finalDeityId = formData.deity_id;
    let finalCategories = [...categories];

    // ==========================================
    // STEP 1: Create New Deity (If requested)
    // ==========================================
    if (formData.deity_id === 'new' && formData.new_deity_hinglish) {
      const deitySlug = generateSlug(formData.new_deity_hinglish);
      const { data: newDeity, error: deityError } = await supabaseAdmin
        .from('deities')
        .insert([{ 
          name_hinglish: formData.new_deity_hinglish, 
          name_hindi: formData.new_deity_hindi, 
          slug: deitySlug 
        }])
        .select('id').single();
        
      if (deityError) throw new Error(`Deity Error: ${deityError.message}`);
      finalDeityId = newDeity.id;
    }

    // ==========================================
    // STEP 2: Create New Category (If requested)
    // ==========================================
    if (formData.new_category_hinglish) {
      const catSlug = generateSlug(formData.new_category_hinglish);
      const { data: newCat, error: catError } = await supabaseAdmin
        .from('categories')
        .insert([{ 
          name_hinglish: formData.new_category_hinglish, 
          name_hindi: formData.new_category_hindi, 
          slug: catSlug 
        }])
        .select('id').single();
        
      if (catError) throw new Error(`Category Error: ${catError.message}`);
      finalCategories.push(newCat.id);
    }

    // ==========================================
    // STEP 3: Clean FAQs & Insert Main Bhajan
    // ==========================================
    const cleanFaqs = faqs.filter((f: any) => f.question.trim() !== '' && f.answer.trim() !== '');

    const { data: bhajanData, error: bhajanError } = await supabaseAdmin
      .from('bhajans')
      .insert([{
        title_hindi: formData.title_hindi,
        title_hinglish: formData.title_hinglish,
        slug: formData.slug,
        lyrics_hindi: formData.lyrics_hindi,
        lyrics_hinglish: formData.lyrics_hinglish,
        video_embed_url: formData.video_embed_url,
        tarj_parody: formData.tarz,
        singer_details: null,
        deity_id: finalDeityId === 'new' ? null : finalDeityId || null,
        explanation: formData.explanation || null,
        faqs: cleanFaqs.length > 0 ? cleanFaqs : null,
        seo_title: formData.seo_title || null,
        meta_description: formData.meta_description || null,
        alt_queries: formData.alt_queries || null
      }])
      .select('id').single();

    if (bhajanError) throw new Error(bhajanError.message);
    newBhajanId = bhajanData.id;

    // ==========================================
    // STEP 4: Map Categories
    // ==========================================
    if (finalCategories.length > 0 && newBhajanId) {
      const categoryMapData = finalCategories.map(catId => ({
        bhajan_id: newBhajanId,
        category_id: catId
      }));
      const { error: catMapError } = await supabaseAdmin.from('bhajan_category_map').insert(categoryMapData);
      if (catMapError) throw new Error(`Category Map Error: ${catMapError.message}`);
    }

    // ==========================================
    // STEP 5: Map Artists
    // ==========================================
    if (selectedArtists.length > 0 && newBhajanId) {
      const artistMapData = selectedArtists.map((artist: any) => ({
        bhajan_id: newBhajanId,
        artist_id: artist.artist_id,
        role: artist.role
      }));
      const { error: artistError } = await supabaseAdmin.from('bhajan_artist_map').insert(artistMapData);
      if (artistError) throw new Error(`Artist Mapping Error: ${artistError.message}`);
    }

    // ==========================================
    // STEP 6: Process & Insert Tags
    // ==========================================
    if (formData.tags.trim() && newBhajanId) {
      const tagNames = formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      const tagsToUpsert = tagNames.map((name: string) => ({
        name: name,
        slug: generateSlug(name)
      }));

      // Upsert tags to avoid duplicate errors
      const { data: upsertedTags, error: tagError } = await supabaseAdmin
        .from('tags')
        .upsert(tagsToUpsert, { onConflict: 'slug' })
        .select('id');
        
      if (!tagError && upsertedTags) {
        const tagMapData = upsertedTags.map(tag => ({
          bhajan_id: newBhajanId,
          tag_id: tag.id
        }));
        await supabaseAdmin.from('bhajan_tag_map').insert(tagMapData);
      }
    }

    // ==========================================
    // STEP 7: Auto-clear approved pending submission (if published from /admin/pending)
    // ==========================================
    if (pendingId) {
      const { error: pendingDeleteError } = await supabaseAdmin
        .from('pending_bhajans')
        .delete()
        .eq('id', String(pendingId).trim());
      if (pendingDeleteError) {
        console.error('Published bhajan, but failed to delete pending_bhajans row:', pendingDeleteError);
      }
      revalidatePath('/admin/pending');
    }

    revalidatePath('/admin');

    // चूँकि आपने डेटाबेस ट्रिगर पहले ही बना दिया है, 
    // Materialized View (mv_bhajan_details) अपने आप रिफ्रेश हो जाएगा!
    
    return { success: true, message: "Bhajan published successfully!" };

  } catch (err: any) {
    // 🚨 MANUAL ROLLBACK (Data Protection)
    // अगर केटेगरी या आर्टिस्ट सेव करते वक़्त कोई एरर आता है, तो हम आधा सेव हुआ भजन डिलीट कर देंगे 
    // ताकि डेटाबेस में कोई कचरा न बचे।
    if (newBhajanId) {
      await supabaseAdmin.from('bhajans').delete().eq('id', newBhajanId);
    }
    
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}