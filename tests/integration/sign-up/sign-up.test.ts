import { signupService } from "@/app/actions/auth-actions"
import { User } from "@/lib/user"
import { createTestClient } from "@/utils/supabase/test/test-server-client"

describe("Cadastro de usuário", () => {
    let createdUserIds: string[] = []
    const supabase = createTestClient()

    afterEach(async () => {
        for (const id of createdUserIds) {
            await (await supabase).auth.admin.deleteUser(id)
        }
        createdUserIds = []
    })

    it("deve criar um usuário com sucesso", async () => {
        const email = `teste@email.com`
        const password = "12345678A"

        const user = new User("nome teste", email, password, password)

        const result = await signupService(user)
        createdUserIds.push(result.user!.id)

        expect(result.user).toBeDefined()
        expect(result.user!.email).toBe(email)
    })

    it("não deve permitir email duplicado", async () => {
        const email = `teste@email.com`
        const password = "12345678A"

        const user = new User("nome teste dup", email, password, password)

        const result = await signupService(user)
        createdUserIds.push(result.user!.id)

        await expect(signupService(user))
            .rejects
            .toThrow()
    })
})