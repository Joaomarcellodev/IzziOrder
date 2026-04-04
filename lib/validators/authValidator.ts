export class AuthValidator {
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim() === '') {
      return { isValid: false, error: 'Email é obrigatório' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Formato de email inválido' };
    }
    
    return { isValid: true };
  }

  static validatePassword(password: string): { isValid: boolean; errors?: string[] } {
    const errors: string[] = [];
    
    if (!password || password.trim() === '') {
      return { isValid: false, errors: ['Senha é obrigatória'] };
    }
    
    // Mínimo 8 caracteres
    if (password.length < 8) {
      errors.push('Senha deve ter no mínimo 8 caracteres');
    }
    
    // Pelo menos uma letra maiúscula
    if (!/[A-Z]/.test(password)) {
      errors.push('Senha deve ter pelo menos uma letra maiúscula');
    }
    
    // Pelo menos um número
    if (!/\d/.test(password)) {
      errors.push('Senha deve ter pelo menos um número');
    }
    
    // Verificar sequências numéricas
    const sequenciasNumericas = [/012/, /123/, /234/, /345/, /456/, /567/, /678/, /789/];
    const temSequenciaNumerica = sequenciasNumericas.some(seq => seq.test(password));
    if (temSequenciaNumerica) {
      errors.push('Senha não pode conter sequências numéricas (ex: 123, 456)');
    }
    
    // Verificar sequências alfabéticas
    const sequenciasAlfabeticas = [/abc/i, /bcd/i, /cde/i, /def/i, /efg/i, /fgh/i, /ghi/i, 
                                  /hij/i, /ijk/i, /jkl/i, /klm/i, /lmn/i, /mno/i, /nop/i,
                                  /opq/i, /pqr/i, /qrs/i, /rst/i, /stu/i, /tuv/i, /uvw/i, 
                                  /vwx/i, /wxy/i, /xyz/i];
    const temSequenciaAlfabetica = sequenciasAlfabeticas.some(seq => seq.test(password));
    if (temSequenciaAlfabetica) {
      errors.push('Senha não pode conter sequências alfabéticas (ex: abc, xyz)');
    }
    
    // Verificar caracteres repetidos
    if (/(.)\1\1/.test(password)) {
      errors.push('Senha não pode ter mais de 2 caracteres repetidos em sequência');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  static validateCredentials(email: string, password: string): { 
    isValid: boolean; 
    errors?: string[] 
  } {
    const errors: string[] = [];
    
    // Valida email
    const emailValidation = this.validateEmail(email);
    if (!emailValidation.isValid && emailValidation.error) {
      errors.push(emailValidation.error);
    }
    
    // Valida senha
    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.isValid && passwordValidation.errors) {
      errors.push(...passwordValidation.errors);
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}