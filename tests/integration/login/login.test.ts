import { supabase } from "@/utils/supabase/supabaseClient";
import { SignUpUser } from "@/lib/entity/sign-up-user";

describe("Login Integration", () => {
  const testUser = new SignUpUser("Usuario", "teste.login@exemplo.com", "Senha859", "Senha859")

  beforeEach(async () => {
    await supabase.auth.signOut();
  });

  // Casos válidos - LOGIN BÁSICO
  describe("Valid Cases - Basic Login", () => {
    it("should login with valid credentials successfully", async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });

      expect(error).toBeNull();
      expect(data.user).toBeDefined();
      expect(data.user?.email).toBe(testUser.email);
      expect(data.session).toBeDefined();
    });

    it("should retrieve user session after login", async () => {
      // Login primeiro
      await supabase.auth.signInWithPassword(testUser);

      // Verifica sessão
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      expect(sessionError).toBeNull();
      expect(sessionData.session).toBeDefined();
      expect(sessionData.session?.user.email).toBe(testUser.email);
    });
  });

  // Casos válidos - VALIDAÇÃO + LOGIN
  describe("Valid Cases - Validation + Login", () => {
    it("should validate credentials before sending to Supabase", () => {
      expect(() => SignUpUser.validateCredentials(
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
        expect(() => SignUpUser.validateEmail(email)).not.toThrow()
      });
    });

    it("should accept passwords meeting all security rules", () => {
      const senhasValidas = [
        "Senha859",
        "M1nhaS3nh@",
        "P@ssw0rdV4l1d"
      ];

      senhasValidas.forEach(senha => {
        expect(() => SignUpUser.validatePassword(senha)).not.toThrow()
      });
    });
  });

  // Casos válidos - FLUXO COMPLETO
  describe("Valid Cases - Complete Flow", () => {
    it("should execute full authentication flow: login → session → logout", async () => {
      // Login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testUser.email,
        password: testUser.password
      });
      expect(loginError).toBeNull();

      // Sessão
      const { data: sessionData } = await supabase.auth.getSession();
      expect(sessionData.session).toBeDefined();

      // Usuário atual
      const { data: userData } = await supabase.auth.getUser();
      expect(userData.user?.email).toBe(testUser.email);

      // Logout
      const { error: logoutError } = await supabase.auth.signOut();
      expect(logoutError).toBeNull();

      // Verifica logout
      const { data: userAfterLogout } = await supabase.auth.getUser();
      expect(userAfterLogout.user).toBeNull();
    });

    it("should allow new login after logout", async () => {
      // Primeiro login
      const { error: firstLoginError } = await supabase.auth.signInWithPassword(testUser);
      expect(firstLoginError).toBeNull();

      // Logout
      await supabase.auth.signOut();

      // Segundo login
      const { data: secondLoginData, error: secondLoginError } = await supabase.auth.signInWithPassword(testUser);

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
      expect(() => SignUpUser.validateCredentials(emailNovo, senhaValida, senhaValida)).not.toThrow()

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
        email: testUser.email,
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
        expect(() => SignUpUser.validateEmail(email)).toThrow()
      });
    });

    it("should reject passwords shorter than 8 characters", () => {
      expect(() => SignUpUser.validatePassword("Abc123")).toThrow("Senha deve ter no mínimo 8 caracteres");
    });

    it("should reject passwords without uppercase letters", () => {
      expect(() => SignUpUser.validatePassword("senha1234")).toThrow("Senha deve ter pelo menos uma letra maiúscula");
    });

    it("should reject passwords without numbers", () => {
      expect(() => SignUpUser.validatePassword("SenhaFraca")).toThrow("Senha deve ter pelo menos um número");
    });
  });

  // Casos inválidos - CAMPOS VAZIOS
  describe("Invalid Cases - Empty Fields", () => {
    it("should reject empty email", () => {
      expect(() => SignUpUser.validateCredentials("", "Senha123", "Senha123")).toThrow()
    });

    it("should reject empty password", () => {
      expect(() => SignUpUser.validateCredentials("teste@exemplo.com", "", "")).toThrow()
    });

    it("should reject both empty fields", () => {
      expect(() => SignUpUser.validateCredentials("", "", "")).toThrow()
    });
  });

  afterAll(async () => {
    await supabase.auth.signOut();
  });
});