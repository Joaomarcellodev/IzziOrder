const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(url, serviceKey);

async function checkEstablishments() {
  const { data, error } = await supabase.from('establishments').select('id, name, slug');
  console.log("Establishments:", data);
  if (error) console.error("Error:", error);
}

checkEstablishments();
