export class User {
    name: string
    email: string
    password: string
    password_confirmation: string

    constructor(name: string, email: string, password: string, password_confirmation: string) {
        this.name = name
        this.email = email
        this.password = password
        this.password_confirmation = password_confirmation

        User.validateCredentials(this.email, this.password, this.password_confirmation)
    }

    static fromFormData(formData: FormData): User {
        return new User(formData.get("user_name") as string,
            formData.get("email") as string,
            formData.get('password') as string,
            formData.get('password_confirmation') as string)
    }

    static validateCredentials(email: string, password: string, password_confirmation: string) {
        User.validateEmail(email)
        User.validatePassword(password)
        User.verifyPasswordConfirmation(password, password_confirmation)
    }

    static verifyPasswordConfirmation(password: string, password_confirmation: string) {
        if (password !== password_confirmation) {
            throw new Error("As senhas não batem")
        }
    }

    static validateEmail(email: string) {
        if (!email || email.trim() === '') {
            throw new Error('Email é obrigatório')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Formato de email inválido')
        }
    }

    static validatePassword(password: string) {
        if (!password || password.trim() === '') {
            throw new Error('Senha é obrigatória');
        }

        // Mínimo 8 caracteres
        if (password.length < 8) {
            throw new Error('Senha deve ter no mínimo 8 caracteres');
        }

        // Pelo menos uma letra maiúscula
        if (!/[A-Z]/.test(password)) {
            throw new Error('Senha deve ter pelo menos uma letra maiúscula');
        }

        // Pelo menos um número
        if (!/\d/.test(password)) {
            throw new Error('Senha deve ter pelo menos um número');
        }
    }
}