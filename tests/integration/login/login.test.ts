import { supabase } from "@/utils/supabase/supabaseClient";
import { User } from "@/lib/user";

describe("Login Integration", () => {
  const testUser = new User("Usuario", "teste.login@exemplo.com", "Senha859", "Senha859")

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

  // Casos válidos - FLUXO COMPLETO
  describe("Valid Cases - Complete Flow", () => {
    it("should execute full authentication flow: login → session → logout", async () => {
      // Login
      const { error: loginError } = await supabase.auth.signInWithPassword({
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

  afterAll(async () => {
    await supabase.auth.signOut();
  });
});