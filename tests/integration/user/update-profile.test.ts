import { signupService } from "@/app/actions/auth-actions";
import { updatePassword, updateProfile, getUser } from "@/app/actions/user-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("User Profile Integration", () => {
    let createdUserId: string;
    let createdUser: SignUpUser;
    const supabase = createClient();

    jest.setTimeout(15000); // 15 seconds for integration tests

    beforeEach(async () => {
        const email = `test_profile_${Date.now()}@email.com`;
        const password = "Password123!";
        createdUser = new SignUpUser("Original Name", email, password, password);
        
        const result = await signupService(createdUser);
        if (!result.user) throw new Error("Failed to create first user");
        createdUserId = result.user.id;

        // Login to have a session
        const s = await supabase;
        const { error: loginError } = await s.auth.signInWithPassword({
            email: createdUser.email,
            password: createdUser.password
        });
        if (loginError) throw new Error(`Failed to login first user: ${loginError.message}`);
    });

    afterEach(async () => {
        const s = await supabase;
        await s.auth.admin.deleteUser(createdUserId);
    });

    it("should update user profile data (name, email)", async () => {
        const s = await supabase;
        const formData = new FormData();
        formData.append("name", "Updated Name");
        formData.append("email", createdUser.email);

        const result = await updateProfile(formData, s);
        expect(result.success).toBe(true);

        const updatedUser = await getUser(s);
        expect(updatedUser.name).toBe("Updated Name");
        expect(updatedUser.email).toBe(createdUser.email);
    });

    it("should update user password", async () => {
        const s = await supabase;
        const formData = new FormData();
        formData.append("currentPassword", createdUser.password);
        formData.append("newPassword", "NewPassword123!");
        formData.append("confirmPassword", "NewPassword123!");

        const result = await updatePassword(formData, s);
        expect(result.success).toBe(true);

        // Verify we can login with new password
        const { error } = await s.auth.signInWithPassword({
            email: createdUser.email,
            password: "NewPassword123!"
        });
        expect(error).toBeNull();
    });

    it("should enforce complex password rules", async () => {
        const s = await supabase;
        const formData = new FormData();
        formData.append("currentPassword", createdUser.password);
        formData.append("newPassword", "weak"); 
        formData.append("confirmPassword", "weak");

        const result = await updatePassword(formData, s);
        
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
    });

    it("should fail to update password with wrong current password", async () => {
        const s = await supabase;
        const formData = new FormData();
        formData.append("currentPassword", "wrongPassword");
        formData.append("newPassword", "NewPassword123!");
        formData.append("confirmPassword", "NewPassword123!");

        const result = await updatePassword(formData, s);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Senha atual incorreta");
    });
});
