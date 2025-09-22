import { 
  createMenuItem, 
  updateMenuItem, 
  updateMenuItemAvailability, 
  deleteMenuItem 
} from '../app/actions/menu';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const supabaseMock = {
  insert: jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'Teste' }], error: null }),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  select: jest.fn().mockResolvedValue({ data: [{ id: '1', name: 'Teste Atualizado' }], error: null }),
};

const mockFrom = jest.fn(() => supabaseMock);

(createClient as jest.Mock).mockReturnValue(Promise.resolve({ from: mockFrom }));

describe('Menu Item Functions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('HU29 - Adicionar item', () => {
    it('deve adicionar um item no menu', async () => {
      const item = { name: 'Pizza', description: 'Deliciosa', price: 25, category: 'Comida', image: '', available: true };
      const result = await createMenuItem(item);

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('menu_items');
      expect(mockFrom().insert).toHaveBeenCalledWith([item]);
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });
  });

  describe('HU30 - Editar item', () => {
    it('deve atualizar um item do menu', async () => {
      const updates = { name: 'Pizza Atualizada' };
      const result = await updateMenuItem('1', updates);

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('menu_items');
      expect(mockFrom().update).toHaveBeenCalledWith(updates);
      expect(mockFrom().eq).toHaveBeenCalledWith('id', '1');
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });

    it('deve atualizar a disponibilidade de um item', async () => {
      const result = await updateMenuItemAvailability('1', false);

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('menu_items');
      expect(mockFrom().update).toHaveBeenCalledWith({ available: false });
      expect(mockFrom().eq).toHaveBeenCalledWith('id', '1');
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });
  });

  describe('HU31 - Excluir item', () => {
    it('deve excluir um item do menu', async () => {
      const result = await deleteMenuItem('1');

      expect(result.success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('menu_items');
      expect(mockFrom().delete).toHaveBeenCalled();
      expect(mockFrom().eq).toHaveBeenCalledWith('id', '1');
      expect(revalidatePath).toHaveBeenCalledWith('/menu');
    });
  });
});
