import { User } from "@/lib/entities/sign-up-user";

describe("User unit tests", () => {
    describe("Valid cases", () => {
        describe("Validation", () => {
            it("should validate credentials before sending to Supabase", () => {
                const testUser = new User("User Name", "test.login@exemple.com", "Password859", "Password859")

                expect(() => User.validateCredentials(
                    testUser.email,
                    testUser.password,
                    testUser.password_confirmation
                )).not.toThrow()
            });

            it("should accept valid email format", () => {
                const validEmails = [
                    "usuario@exemplo.com",
                    "test.email@domain.com.br",
                    "name123@company.org"
                ];

                validEmails.forEach(email => {
                    expect(() => User.validateEmail(email)).not.toThrow()
                });
            });

            it("should accept passwords meeting all security rules", () => {
                const senhasValidas = [
                    "Senha859",
                    "M1nhaS3nh@",
                    "P@ssw0rdV4l1d"
                ];

                senhasValidas.forEach(senha => {
                    expect(() => User.validatePassword(senha)).not.toThrow()
                });
            });
        })
    })

    describe("Invalid cases", () => {
        describe("Validation", () => {
            it("should reject invalid email format", () => {
                const emailsInvalidos = [
                    "email-invalido",
                    "semarroba.com",
                    "email@semdominio",
                    ""
                ];

                emailsInvalidos.forEach(email => {
                    expect(() => User.validateEmail(email)).toThrow()
                });
            });

            it("should reject passwords shorter than 8 characters", () => {
                expect(() => User.validatePassword("Abc123")).toThrow("Senha deve ter no mínimo 8 caracteres");
            });

            it("should reject passwords without uppercase letters", () => {
                expect(() => User.validatePassword("senha1234")).toThrow("Senha deve ter pelo menos uma letra maiúscula");
            });

            it("should reject passwords without numbers", () => {
                expect(() => User.validatePassword("SenhaFraca")).toThrow("Senha deve ter pelo menos um número");
            });
        });

        describe("Empty Fields", () => {
            it("should reject empty email", () => {
                expect(() => User.validateCredentials("", "Senha123", "Senha123")).toThrow()
            });

            it("should reject empty password", () => {
                expect(() => User.validateCredentials("teste@exemplo.com", "", "")).toThrow()
            });

            it("should reject both empty fields", () => {
                expect(() => User.validateCredentials("", "", "")).toThrow()
            });
        });
    })
})