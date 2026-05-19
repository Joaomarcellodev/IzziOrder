import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables. DB cleanup might fail.');
}

export const supabaseTest = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  }
});

/**
 * Exclui categorias do banco de dados de teste diretamente,
 * contornando a necessidade de usar a UI (o que evita flakiness).
 */
export async function deleteTestCategories(names: string[]) {
  if (!names || names.length === 0) return;
  
  const { error } = await supabaseTest
    .from('categories')
    .delete()
    .in('name', names);
    
  if (error) {
    console.error('❌ Erro ao limpar categorias do banco de testes:', error);
  } else {
    console.log(`✅ Categorias limpas do DB: ${names.join(', ')}`);
  }
}
