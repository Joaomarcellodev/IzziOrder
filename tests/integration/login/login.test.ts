import { SignUpUser } from "@/lib/entities/sign-up-user";
import { signupService } from "@/app/actions/auth-actions";
import { createClient } from "@/utils/supabase/server";

describe("Login Integration", () => {
  let createdUserId: string
  let createdUser: SignUpUser
  const supabase = createClient()

  beforeEach(async () => {
    const email = `test_${Date.now()}@email.com`
    const password = "12345678A"

    const user = new SignUpUser("test name", email, password, password)

    const result = await signupService(user)
    createdUserId = result.user!.id
    createdUser = user
  });

  afterEach(async () => {
    await (await supabase).auth.admin.deleteUser(createdUserId)

    createdUserId = ""
  })

  describe("Valid Cases", () => {
    describe("Basic Login", () => {
      it("should login with valid credentials successfully", async () => {
        const { data, error } = await (await supabase).auth.signInWithPassword({
          email: createdUser.email,
          password: createdUser.password
        });

        expect(error).toBeNull();
        expect(data.user).toBeDefined();
        expect(data.user?.email).toBe(createdUser.email);
        expect(data.session).toBeDefined();
      });

      it("should retrieve user session after login", async () => {
        // Login primeiro
        await (await supabase).auth.signInWithPassword(createdUser);

        // Verifica sessão
        const { data: sessionData, error: sessionError } = await (await supabase).auth.getSession();

        expect(sessionError).toBeNull();
        expect(sessionData.session).toBeDefined();
        expect(sessionData.session?.user.email).toBe(createdUser.email);
      });
    });

    // Casos válidos - FLUXO COMPLETO
    describe("Complete Flow", () => {
      it("should execute full authentication flow: login → session → logout", async () => {
        // Login
        const { error: loginError } = await (await supabase).auth.signInWithPassword({
          email: createdUser.email,
          password: createdUser.password
        });
        expect(loginError).toBeNull();

        // Sessão
        const { data: sessionData } = await (await supabase).auth.getSession();
        expect(sessionData.session).toBeDefined();

        // Usuário atual
        const { data: userData } = await (await supabase).auth.getUser();
        expect(userData.user?.email).toBe(createdUser.email);

        // Logout
        const { error: logoutError } = await (await supabase).auth.signOut();
        expect(logoutError).toBeNull();

        // Verifica logout
        const { data: userAfterLogout } = await (await supabase).auth.getUser();
        expect(userAfterLogout.user).toBeNull();
      });

      it("should allow new login after logout", async () => {
        // Primeiro login
        const { error: firstLoginError } = await (await supabase).auth.signInWithPassword(createdUser);
        expect(firstLoginError).toBeNull();

        // Logout
        await (await supabase).auth.signOut();

        // Segundo login
        const { data: secondLoginData, error: secondLoginError } = await (await supabase).auth.signInWithPassword(createdUser);

        expect(secondLoginError).toBeNull();
        expect(secondLoginData.user).toBeDefined();
      });
    });
  })

  describe("Valid Cases", () => {

    describe("Credentials", () => {
      it("should fail login with wrong password", async () => {
        const { data, error } = await (await supabase).auth.signInWithPassword({
          email: createdUser.email,
          password: "SenhaErrada123"
        });

        expect(error).not.toBeNull();
        expect(data.user).toBeNull();
        expect(data.session).toBeNull();
      });

      it("should fail login with non-existent email", async () => {
        const emailInexistente = `nao.existe.${Date.now()}@exemplo.com`;

        const { data, error } = await (await supabase).auth.signInWithPassword({
          email: emailInexistente,
          password: "QualquerSenha123"
        });

        expect(data.user).toBeNull();
      });
    })
  })
});