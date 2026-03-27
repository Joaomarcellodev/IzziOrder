import { signupService } from "@/app/actions/auth-actions"
import { SignUpUser } from "@/lib/entities/sign-up-user"
import { createClient } from "@/utils/supabase/server"

describe("User sign up", () => {
    let createdUserIds: string[] = []
    const supabase = createClient()

    afterEach(async () => {
        for (const id of createdUserIds) {
            await (await supabase).auth.admin.deleteUser(id)
        }
        createdUserIds = []
    })

    describe("Valid cases", () => {
        it("should create user with success", async () => {
            const email = `test_${Date.now()}@email.com`
            const password = "12345678A"

            const user = new SignUpUser("test name", email, password, password)

            const result = await signupService(user)
            createdUserIds.push(result.user!.id)

            expect(result.user).toBeDefined()
            expect(result.user!.email).toBe(email)
        })

    })

    describe("Invalid cases", () => {
        it("should not let duplicated emails", async () => {
            const email = `test_${Date.now()}@email.com`
            const password = "12345678A"

            const user = new SignUpUser("test dup name", email, password, password)

            const result = await signupService(user)
            createdUserIds.push(result.user!.id)

            await expect(signupService(user))
                .rejects
                .toThrow("User already registered")
        })
    })
})