import { signupService } from "@/app/actions/auth-actions"
import { getCategories } from "@/app/actions/category-actions"
import { getEstablishmentId } from "@/app/actions/establisment_actions"
import { getMenuItems } from "@/app/actions/menu-item-actions"
import { getOrders } from "@/app/actions/order-actions"
import { SignUpUser } from "@/lib/entities/sign-up-user"
import { createClient } from "@/utils/supabase/server"

describe("New user initial state", () => {
    let createdUserIds: string[] = []
    const supabasePromise = createClient()

    afterEach(async () => {
        const supabase = await supabasePromise
        for (const id of createdUserIds) {
            await supabase.auth.admin.deleteUser(id)
        }
        createdUserIds = []
    })

    it("should start with empty orders, categories, and menu items", async () => {
        const email = `test_initial_${Date.now()}@email.com`
        const password = "12345678A"
        const name = "Initial User"

        const user = new SignUpUser(name, email, password, password)
        const result = await signupService(user)
        const userId = result.user!.id
        createdUserIds.push(userId)

        const supabase = await createClient()
        // Authenticate to allow getEstablishmentId to work
        await supabase.auth.signInWithPassword({ email, password })

        // 1. Get the establishment ID using server action
        const establishmentId = await getEstablishmentId(supabase)
        expect(establishmentId).toBeDefined()

        // 2. Verify categories are empty using server action
        const categoriesResult = await getCategories(establishmentId)
        expect(categoriesResult.success).toBe(true)
        expect(categoriesResult.data).toHaveLength(0)

        // 3. Verify menu items are empty using server action
        const menuItemsResult = await getMenuItems(establishmentId)
        expect(menuItemsResult.success).toBe(true)
        expect(menuItemsResult.data).toHaveLength(0)

        // 4. Verify orders are empty using server action
        const orders = await getOrders(establishmentId)
        expect(orders).toHaveLength(0)
    })
})
