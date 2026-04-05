export function validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (!password || password.trim() === '') {
        errors.push("A senha é obrigatória.");
        return errors;
    }

    if (password.length < 8) {
        errors.push("A senha deve ter no mínimo 8 caracteres.");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("A senha deve ter pelo menos uma letra maiúscula.");
    }

    if (!/\d/.test(password)) {
        errors.push("A senha deve ter pelo menos um número.");
    }

    return errors;
}

export function verifyPasswordConfirmation(password: string, confirmation: string): string[] {
    if (password !== confirmation) {
        return ["As senhas não coincidem."];
    }
    return [];
}
