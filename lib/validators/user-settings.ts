import { validatePassword, verifyPasswordConfirmation } from "./password";

export function validatePasswordChange(currentPassword: string, newPassword: string, confirmPassword: string): void {
    if (!currentPassword) {
        throw new Error("A senha atual é obrigatória.");
    }
    
    const newPasswordErrors = validatePassword(newPassword);
    if (newPasswordErrors.length > 0) {
        throw new Error(newPasswordErrors[0]);
    }

    const confirmationErrors = verifyPasswordConfirmation(newPassword, confirmPassword);
    if (confirmationErrors.length > 0) {
        throw new Error(confirmationErrors[0]);
    }
}

export function validateProfileUpdate(name: string, email: string): void {
    if (!name || name.trim().length < 3) {
        throw new Error("O nome deve ter pelo menos 3 caracteres.");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new Error("O email é inválido.");
    }
}
