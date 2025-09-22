import { supabase } from '../lib/supabase/supabaseClient';

describe('Supabase Connection', () => {
  afterEach(async () => {
    await supabase.from('test_table').delete().neq('id', 0);
  });

  it('should insert and fetch data from test_table', async () => {
    const { data, error } = await supabase
      .from('test_table')
      .insert([{ name: 'Primeiro Teste' }])
      .select();

    expect(error).toBeNull();
    expect(data?.[0]?.name).toBe('Primeiro Teste');
  });
});
