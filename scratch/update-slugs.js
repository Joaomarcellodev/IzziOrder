const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey);

async function setSlugs() {
  const { data, error } = await supabase.from('establishments').select('id, name').is('slug', null);
  
  if (error) {
    console.error("Error fetching:", error);
    return;
  }

  for (const est of data) {
    let slug = est.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (slug === 'teste-kioda') slug = 'meu-restaurante'; // Para coincidir com a URL que você testou
    if (!slug) slug = `est-${est.id.split('-')[0]}`;

    console.log(`Setting slug ${slug} for ${est.name}`);
    const { error: updateError } = await supabase.from('establishments').update({ slug }).eq('id', est.id);
    if (updateError) {
      console.error(`Failed to update ${est.name}:`, updateError);
    }
  }
  
  console.log("Done updating slugs!");
}

setSlugs();
