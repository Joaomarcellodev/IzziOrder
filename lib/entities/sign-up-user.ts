import { validatePassword, verifyPasswordConfirmation } from "../validators/password"
import { User } from "./user"

export class SignUpUser extends User {
    password: string
    password_confirmation: string

    constructor(name: string, email: string, password: string, password_confirmation: string) {
        super(name, email)
        this.password = password
        this.password_confirmation = password_confirmation

        SignUpUser.validateCredentials(this.email, this.password, this.password_confirmation)
    }

    static fromFormData(formData: FormData): SignUpUser {
        return new SignUpUser(formData.get("user_name") as string,
            formData.get("email") as string,
            formData.get('password') as string,
            formData.get('password_confirmation') as string)
    }

    static validateCredentials(email: string, password: string, password_confirmation: string) {
        SignUpUser.validateEmail(email)
        
        const passwordErrors = validatePassword(password)
        if (passwordErrors.length > 0) {
            throw new Error(passwordErrors[0])
        }

        const confirmationErrors = verifyPasswordConfirmation(password, password_confirmation)
        if (confirmationErrors.length > 0) {
            throw new Error(confirmationErrors[0])
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

}