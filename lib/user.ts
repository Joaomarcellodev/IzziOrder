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

        this.validateCredentials()
    }

    static fromFormData(formData: FormData): User {
        return new User(formData.get("user_name") as string,
            formData.get("email") as string,
            formData.get('password') as string,
            formData.get('password_confirmation') as string)
    }

    validateCredentials() {
        this.validateEmail()
        this.validatePassword()
        this.verifyPasswordConfirmation()
    }

    verifyPasswordConfirmation() {
        if (this.password !== this.password_confirmation) {
            throw new Error("Senhas não batem")
        }
    }

    validateEmail() {
        if (!this.email || this.email.trim() === '') {
            throw new Error('Email é obrigatório')
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            throw new Error('Formato de email inválido')
        }
    }

    validatePassword() {
        if (!this.password || this.password.trim() === '') {
            throw new Error('Senha é obrigatória');
        }

        // Mínimo 8 caracteres
        if (this.password.length < 8) {
            throw new Error('Senha deve ter no mínimo 8 caracteres');
        }

        // Pelo menos uma letra maiúscula
        if (!/[A-Z]/.test(this.password)) {
            throw new Error('Senha deve ter pelo menos uma letra maiúscula');
        }

        // Pelo menos um número
        if (!/\d/.test(this.password)) {
            throw new Error('Senha deve ter pelo menos um número');
        }
    }
}