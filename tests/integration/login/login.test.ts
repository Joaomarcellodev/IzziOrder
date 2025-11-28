import { supabase } from "@/utils/supabase/supabaseClient";
import { AuthValidator } from "@/lib/validators/authValidator";

describe("Login Integration", () => {
  const usuarioTeste = {
    email: "teste.login@exemplo.com",
    password: "Senha859"
  };

  beforeEach(async () => {
    await supabase.auth.signOut();
  });

  // Casos válidos - LOGIN BÁSICO
  describe("Valid Cases - Basic Login", () => {
    it("should login with valid credentials successfully", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuarioTeste.email,
        password: usuarioTeste.password
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(usuarioTeste.email);
      expect(data.session).toBeDefined();
    });

    it("should retrieve user session after login", async () => {
      // Login primeiro
      await supabase.auth.signInWithPassword(usuarioTeste);

      // Verifica sessão
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      expect(sessionError).toBeNull();
      expect(sessionData.session).toBeDefined();
      expect(sessionData.session?.user.email).toBe(usuarioTeste.email);
    });
  });

  // Casos válidos - VALIDAÇÃO + LOGIN
  describe("Valid Cases - Validation + Login", () => {
    it("should validate credentials before sending to Supabase", () => {
      const validation = AuthValidator.validateCredentials(
        usuarioTeste.email, 
        usuarioTeste.password
      );

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toBeUndefined();
    });

    it("should accept valid email format", () => {
      const emailsValidos = [
        "usuario@exemplo.com",
        "test.email@domain.com.br",
        "name123@company.org"
      ];

      emailsValidos.forEach(email => {
        const result = AuthValidator.validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it("should accept passwords meeting all security rules", () => {
      const senhasValidas = [
        "Senha859",
        "M1nhaS3nh@",
        "P@ssw0rdV4l1d"
      ];

      senhasValidas.forEach(senha => {
        const result = AuthValidator.validatePassword(senha);
        expect(result.isValid).toBe(true);
      });
    });
  });

  // Casos válidos - FLUXO COMPLETO
  describe("Valid Cases - Complete Flow", () => {
    it("should execute full authentication flow: login → session → logout", async () => {
      // Login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: usuarioTeste.email,
        password: usuarioTeste.password
      });
      expect(loginError).toBeNull();

      // Sessão
      const { data: sessionData } = await supabase.auth.getSession();
      expect(sessionData.session).toBeDefined();

      // Usuário atual
      const { data: userData } = await supabase.auth.getUser();
      expect(userData.user?.email).toBe(usuarioTeste.email);

      // Logout
      const { error: logoutError } = await supabase.auth.signOut();
      expect(logoutError).toBeNull();

      // Verifica logout
      const { data: userAfterLogout } = await supabase.auth.getUser();
      expect(userAfterLogout.user).toBeNull();
    });

    it("should allow new login after logout", async () => {
      // Primeiro login
      const { error: firstLoginError } = await supabase.auth.signInWithPassword(usuarioTeste);
      expect(firstLoginError).toBeNull();

      // Logout
      await supabase.auth.signOut();

      // Segundo login
      const { data: secondLoginData, error: secondLoginError } = await supabase.auth.signInWithPassword(usuarioTeste);
      
      expect(secondLoginError).toBeNull();
      expect(secondLoginData.user).toBeDefined();
    });
  });

  // Casos válidos - CADASTRO
  describe("Valid Cases - Registration", () => {
    it("should register new user with valid password", async () => {
      const emailNovo = `novo.usuario.${Date.now()}@exemplo.com`;
      const senhaValida = "NovaS3nh@859";

      // Valida antes de enviar
      const validation = AuthValidator.validateCredentials(emailNovo, senhaValida);
      expect(validation.isValid).toBe(true);

      const { data, error } = await supabase.auth.signUp({
        email: emailNovo,
        password: senhaValida
      });

      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(emailNovo);
    });
  });

  // Casos inválidos - CREDENCIAIS
  describe("Invalid Cases - Credentials", () => {
    it("should fail login with wrong password", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuarioTeste.email,
        password: "SenhaErrada123"
      });

      expect(error).not.toBeNull();
      expect(data.user).toBeNull();
      expect(data.session).toBeNull();
    });

    it("should fail login with non-existent email", async () => {
      const emailInexistente = `nao.existe.${Date.now()}@exemplo.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInexistente,
        password: "QualquerSenha123"
      });

      expect(data.user).toBeNull();
    });
  });

  // Casos inválidos - VALIDAÇÃO
  describe("Invalid Cases - Validation", () => {
    it("should reject invalid email format", () => {
      const emailsInvalidos = [
        "email-invalido",
        "semarroba.com",
        "email@semdominio",
        ""
      ];

      emailsInvalidos.forEach(email => {
        const result = AuthValidator.validateEmail(email);
        expect(result.isValid).toBe(false);
      });
    });

    it("should reject passwords shorter than 8 characters", () => {
      const result = AuthValidator.validatePassword("Abc123");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Senha deve ter no mínimo 8 caracteres");
    });

    it("should reject passwords without uppercase letters", () => {
      const result = AuthValidator.validatePassword("senha1234");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Senha deve ter pelo menos uma letra maiúscula");
    });

    it("should reject passwords without numbers", () => {
      const result = AuthValidator.validatePassword("SenhaFraca");
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Senha deve ter pelo menos um número");
    });
  });

  // Casos inválidos - SEQUÊNCIAS
  describe("Invalid Cases - Sequences", () => {
    it("should reject numeric sequences", () => {
      const senhasInvalidas = ["Senha123", "ABC456def", "Teste789X"];
      
      senhasInvalidas.forEach(senha => {
        const result = AuthValidator.validatePassword(senha);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Senha não pode conter sequências numéricas (ex: 123, 456)");
      });
    });

    it("should reject alphabetic sequences", () => {
      const senhasInvalidas = ["Abcdefg1", "XYZteste2", "MinhaMNO3"];
      
      senhasInvalidas.forEach(senha => {
        const result = AuthValidator.validatePassword(senha);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Senha não pode conter sequências alfabéticas (ex: abc, xyz)");
      });
    });

    it("should reject repeated characters", () => {
      const senhasInvalidas = ["AAAbbb123", "Testeee1", "Senha444"];
      
      senhasInvalidas.forEach(senha => {
        const result = AuthValidator.validatePassword(senha);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Senha não pode ter mais de 2 caracteres repetidos em sequência");
      });
    });
  });

  // Casos inválidos - CAMPOS VAZIOS
  describe("Invalid Cases - Empty Fields", () => {
    it("should reject empty email", () => {
      const result = AuthValidator.validateCredentials("", "Senha123");
      expect(result.isValid).toBe(false);
    });

    it("should reject empty password", () => {
      const result = AuthValidator.validateCredentials("teste@exemplo.com", "");
      expect(result.isValid).toBe(false);
    });

    it("should reject both empty fields", () => {
      const result = AuthValidator.validateCredentials("", "");
      expect(result.isValid).toBe(false);
    });
  });

  afterAll(async () => {
    await supabase.auth.signOut();
  });
});