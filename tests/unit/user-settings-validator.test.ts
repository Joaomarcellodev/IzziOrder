import { validatePasswordChange, validateProfileUpdate } from "@/lib/validators/user-settings";

describe("User Settings Validators", () => {
    describe("validatePasswordChange", () => {
        it("should return error if current password is empty", () => {
            const errors = validatePasswordChange("", "NovaSenha123A", "NovaSenha123A");
            expect(errors).toContain("A senha atual é obrigatória.");
        });

        it("should return error if new password is less than 8 characters", () => {
            const errors = validatePasswordChange("SenhaAntiga123", "123", "123");
            expect(errors).toContain("A senha deve ter no mínimo 8 caracteres.");
        });

        it("should return error if passwords do not match", () => {
            const errors = validatePasswordChange("SenhaAntiga123", "NovaSenha123A", "OutraSenha");
            expect(errors).toContain("As senhas não coincidem.");
        });

        it("should return no errors for valid password change", () => {
            const errors = validatePasswordChange("SenhaAntiga123", "NovaSenha123A", "NovaSenha123A");
            expect(errors).toHaveLength(0);
        });
    });

    describe("validateProfileUpdate", () => {
        it("should return error if name is too short", () => {
            const errors = validateProfileUpdate("Jo", "email@teste.com");
            expect(errors).toContain("O nome deve ter pelo menos 3 caracteres.");
        });

        it("should return error if email is invalid", () => {
            const errors = validateProfileUpdate("João Silva", "email-invalido");
            expect(errors).toContain("O email é inválido.");
        });

        it("should return no errors for valid profile data", () => {
            const errors = validateProfileUpdate("João Silva", "teste@teste.com");
            expect(errors).toHaveLength(0);
        });
    });
});
