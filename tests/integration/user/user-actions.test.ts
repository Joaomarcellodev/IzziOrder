import { signupService } from "@/app/actions/auth-actions";
import { getUser } from "@/app/actions/user-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("Test User Data Integration from getUser()", () => {
  let createdUserId: string
  let createdUser: SignUpUser
  let supabase: any

  beforeAll(async () => {
    supabase = await createClient()

    const email = `security_test_${Date.now()}@email.com`;
    const password = "Password123!";
    const name = "Security Tester";

    createdUser = new SignUpUser(name, email, password, password);

    const result = await signupService(createdUser);
    if (!result.user) {
      throw new Error("Failed to create user for security test");
    }
    createdUserId = result.user.id;

    const { error: loginError } = await (await supabase).auth.signInWithPassword({
      email: createdUser.email,
      password: createdUser.password
    });

    if (loginError) {
      throw new Error(`Login failed: ${loginError.message}`);
    }
  });

  afterAll(async () => {
    if (createdUserId) {
      await (await supabase).auth.admin.deleteUser(createdUserId);
    }
  });

  it("should return only public user data and not leak sensitive information", async () => {
    const user = await getUser(supabase);

    // Verify properties of the User entity
    expect(user.name).toBe(createdUser.name);
    expect(user.email).toBe(createdUser.email);

    // Explicitly check that common sensitive fields are NOT present
    const userAsAny = user as any;
    expect(userAsAny.id).toBeUndefined();
    expect(userAsAny.password).toBeUndefined();
    expect(userAsAny.aud).toBeUndefined();
    expect(userAsAny.role).toBeUndefined();
    expect(userAsAny.app_metadata).toBeUndefined();
    expect(userAsAny.user_metadata).toBeUndefined();

    // Verify toJSON() output
    const json = user.toJSON();
    expect(json).toEqual({
      name: createdUser.name,
      email: createdUser.email
    });

    // Verify the JSON object's keys count to ensure no extra fields
    expect(Object.keys(json)).toHaveLength(2);
    expect(Object.keys(json)).toContain("name");
    expect(Object.keys(json)).toContain("email");
  });

  it("should verify that serialization doesn't include hidden properties", async () => {
    const user = await getUser(supabase);
    const serialized = JSON.stringify(user);
    const parsed = JSON.parse(serialized);

    expect(parsed).toEqual({
      name: createdUser.name,
      email: createdUser.email
    });

    expect(Object.keys(parsed)).toHaveLength(2);
  });
});

describe("Test User Data Integration when unauthenticated", () => {
  let supabase: any;

  beforeAll(async () => {
    // Create an unauthenticated client.
    // We are *not* logging in or creating a user here.
    supabase = await createClient();
  });

  it("should throw an error when no user is logged in", async () => {
    // We expect getUser to throw an error if the user is not authenticated.
    await expect(getUser(supabase)).rejects.toThrow("User not authenticated");
  });
});
