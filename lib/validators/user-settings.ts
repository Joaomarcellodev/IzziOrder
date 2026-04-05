import { validatePassword, verifyPasswordConfirmation } from "./password";

export function validatePasswordChange(currentPassword: string, newPassword: string, confirmPassword: string): string[] {
    const errors: string[] = [];
    
    if (!currentPassword) {
        errors.push("A senha atual é obrigatória.");
    }
    
    const newPasswordErrors = validatePassword(newPassword);
    errors.push(...newPasswordErrors);

    const confirmationErrors = verifyPasswordConfirmation(newPassword, confirmPassword);
    errors.push(...confirmationErrors);
    
    return errors;
}

export function validateProfileUpdate(name: string, email: string): string[] {
    const errors: string[] = [];
    
    if (!name || name.trim().length < 3) {
        errors.push("O nome deve ter pelo menos 3 caracteres.");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push("O email é inválido.");
    }
    
    return errors;
}
