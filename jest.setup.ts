import '@testing-library/jest-dom';
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test-integration' })

// Mock Next.js cache/navigation
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const originalError = console.error;

console.error = (...args) => {
  const message = args.join(" ");

  // silencia todos os logs de erro simulados dos testes
  if (message.includes("Erro ao")) {
    return;
  }

  // mostra erros inesperados normalmente
  originalError(...args);
};