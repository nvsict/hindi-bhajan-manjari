"use server";

import { createClient } from '@supabase/supabase-js';

// 🌟 Helper: Slug Generator
const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// ============================================================================
// 1. PUBLISH VICHAR (ADD)
// ============================================================================
export async function publishVicharAction(payload: any) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "CRITICAL: Service Role Key is missing in .env file!" };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { formData } = payload;
    let finalDeityId = formData.deity_id;
    let finalCategories = [...formData.selected_categories];

    // Create New Deity if requested
    if (formData.deity_id === 'new') {
      const deitySlug = generateSlug(formData.new_deity_hinglish);
      const { data: newDeity, error: deityError } = await supabaseAdmin
        .from('deities')
        .insert([{ name_hinglish: formData.new_deity_hinglish, name_hindi: formData.new_deity_hindi, slug: deitySlug }])
        .select('id').single();
      
      if (deityError) throw new Error(`Deity Error: ${deityError.message}`);
      finalDeityId = newDeity.id;
    }

    // Create New Category if requested
    if (formData.new_category_hinglish) {
      const catSlug = generateSlug(formData.new_category_hinglish);
      const { data: newCat, error: catError } = await supabaseAdmin
        .from('categories')
        .insert([{ name_hinglish: formData.new_category_hinglish, name_hindi: formData.new_category_hindi, slug: catSlug }])
        .select('id').single();
      
      if (catError) throw new Error(`Category Error: ${catError.message}`);
      finalCategories.push(newCat.id);
    }

    // Insert into mere_vichar table
    const { error: vicharError } = await supabaseAdmin.from('mere_vichar').insert([
      {
        title_hindi: formData.title_hindi,
        title_hinglish: formData.title_hinglish,
        slug: formData.slug,
        quote_text: formData.quote_text,
        explanation: formData.explanation || null,
        deity_id: finalDeityId === 'new' ? null : finalDeityId || null,
        category_id: finalCategories[0] || null,
        seo_title: formData.seo_title || null,
        meta_description: formData.meta_description || null,
        is_published: formData.is_published,
      }
    ]);

    if (vicharError) throw new Error(vicharError.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. UPDATE VICHAR (EDIT)
// ============================================================================
export async function updateVicharAction(id: string, payload: any) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "CRITICAL: Service Role Key is missing in .env file!" };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { formData } = payload;
    let finalDeityId = formData.deity_id;
    let finalCategories = [...formData.selected_categories];

    // Create New Deity if requested
    if (formData.deity_id === 'new') {
      const deitySlug = generateSlug(formData.new_deity_hinglish);
      const { data: newDeity, error: deityError } = await supabaseAdmin
        .from('deities')
        .insert([{ name_hinglish: formData.new_deity_hinglish, name_hindi: formData.new_deity_hindi, slug: deitySlug }])
        .select('id').single();
      
      if (deityError) throw new Error(`Deity Error: ${deityError.message}`);
      finalDeityId = newDeity.id;
    }

    // Create New Category if requested
    if (formData.new_category_hinglish) {
      const catSlug = generateSlug(formData.new_category_hinglish);
      const { data: newCat, error: catError } = await supabaseAdmin
        .from('categories')
        .insert([{ name_hinglish: formData.new_category_hinglish, name_hindi: formData.new_category_hindi, slug: catSlug }])
        .select('id').single();
      
      if (catError) throw new Error(`Category Error: ${catError.message}`);
      finalCategories.push(newCat.id);
    }

    // Update mere_vichar table
    const { error: vicharError } = await supabaseAdmin.from('mere_vichar')
      .update({
        title_hindi: formData.title_hindi,
        title_hinglish: formData.title_hinglish,
        slug: formData.slug,
        quote_text: formData.quote_text,
        explanation: formData.explanation || null,
        deity_id: finalDeityId === 'new' ? null : finalDeityId || null,
        category_id: finalCategories[0] || null,
        seo_title: formData.seo_title || null,
        meta_description: formData.meta_description || null,
        is_published: formData.is_published,
      })
      .eq('id', id);

    if (vicharError) throw new Error(vicharError.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 3. TOGGLE VICHAR STATUS (LIVE / DRAFT)
// ============================================================================
export async function toggleVicharStatusAction(id: string, currentStatus: boolean) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Missing Service Key" };
  }
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  try {
    const { error } = await supabaseAdmin
      .from('mere_vichar')
      .update({ is_published: !currentStatus })
      .eq('id', id);
      
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 4. DELETE VICHAR
// ============================================================================
export async function deleteVicharAction(id: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: "Missing Service Key" };
  }
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  try {
    const { error } = await supabaseAdmin
      .from('mere_vichar')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}