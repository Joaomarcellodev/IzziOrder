import '@testing-library/jest-dom';
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test-integration' })

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
