import { validatePasswordChange, validateProfileUpdate } from "@/lib/validators/user-settings";

describe("User Settings Validators", () => {
    describe("validatePasswordChange", () => {
        it("should throw error if current password is empty", () => {
            expect(() => validatePasswordChange("", "NovaSenha123A", "NovaSenha123A")).toThrow("A senha atual é obrigatória.");
        });

        it("should throw error if new password is less than 8 characters", () => {
            expect(() => validatePasswordChange("SenhaAntiga123", "123", "123")).toThrow("A senha deve ter no mínimo 8 caracteres.");
        });

        it("should throw error if passwords do not match", () => {
            expect(() => validatePasswordChange("SenhaAntiga123", "NovaSenha123A", "OutraSenha")).toThrow("As senhas não coincidem.");
        });

        it("should not throw error for valid password change", () => {
            expect(() => validatePasswordChange("SenhaAntiga123", "NovaSenha123A", "NovaSenha123A")).not.toThrow();
        });
    });

    describe("validateProfileUpdate", () => {
        it("should throw error if name is too short", () => {
            expect(() => validateProfileUpdate("Jo", "email@teste.com")).toThrow("O nome deve ter pelo menos 3 caracteres.");
        });

        it("should throw error if email is invalid", () => {
            expect(() => validateProfileUpdate("João Silva", "email-invalido")).toThrow("O email é inválido.");
        });

        it("should not throw error for valid profile data", () => {
            expect(() => validateProfileUpdate("João Silva", "teste@teste.com")).not.toThrow();
        });
    });
});
