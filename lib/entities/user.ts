export class User {
    name: string
    email: string

    constructor(name: string, email: string) {
        User.validate(name, email)
        this.name = name
        this.email = email
    }

    static validate(name: string, email: string) {
        User.validateName(name)
        User.validateEmail(email)
    }

    static validateName(name: string) {
        if (!name || name.trim().length < 3) {
            throw new Error("O nome deve ter pelo menos 3 caracteres.");
        }
    }

    static validateEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error("O email é inválido.");
        }
    }

    toJSON() {
        return {
            name: this.name,
            email: this.email,
        };
    }
}
