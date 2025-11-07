import { supabase } from '@/lib/supabase/supabaseClient';

describe('Supabase Connection ', () => {
  it('should fetch tables without errors', async () => {
    const { data, error } = await supabase
      .from('tables')
      .select()
      .limit(1);

    expect(error).toBeNull(); 
    expect(data).toBeDefined(); 
  });
});
