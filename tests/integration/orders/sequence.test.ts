import { createOrder, OrderRequestDTO } from "@/app/actions/order-actions";
import { signupService } from "@/app/actions/auth-actions";
import { SignUpUser } from "@/lib/entities/sign-up-user";
import { createClient } from "@/utils/supabase/server";

describe("Orders Sequence - Advanced Integration", () => {
  const testEstablishmentId = process.env.TEST_ESTABLISHMENT_ID!;
  const mockMenuItemId = "6cfd93ee-1e3d-430d-b525-f5a30bc96338";
  const supabase = createClient();
  
  let otherEstablishmentId: string = "";
  let otherUserId: string = "";

  const baseOrder: OrderRequestDTO = {
    total: 10,
    type: "PICKUP",
    detail: "Test Client",
    orderLines: [{ menuItemId: mockMenuItemId, name: "Item", quantity: 1, price: 10 }]
  };

  beforeAll(async () => {
    const email = `test_sequence_${Date.now()}@email.com`;
    const user = new SignUpUser("Second Store", email, "Password123", "Password123");
    const signupResult = await signupService(user);
    
    if (!signupResult.user) throw new Error("Falha ao criar usuário de teste");
    otherUserId = signupResult.user.id;

    const s = await supabase;
    const { data: est } = await s.from("establishments").select("id").eq("owner_id", otherUserId).single();
    
    if (!est) throw new Error("Estabelecimento de teste não encontrado");
    otherEstablishmentId = est.id;
  });

  beforeEach(async () => {
    const s = await supabase;
    await s.from("orders").delete().eq("establishment_id", testEstablishmentId);
    await s.from("daily_counters").delete().eq("establishment_id", testEstablishmentId);
    
    if (otherEstablishmentId) {
      await s.from("orders").delete().eq("establishment_id", otherEstablishmentId);
      await s.from("daily_counters").delete().eq("establishment_id", otherEstablishmentId);
    }
  });

  describe("Positive Scenarios", () => {
    it("should maintain independent sequences for different establishments", async () => {
      // Restaurante A -> Pedido #1
      const orderA1 = await createOrder(baseOrder, testEstablishmentId);
      expect(orderA1.dailySeq).toBe(1);

      // Restaurante B -> Pedido #1 (Deve ser independente)
      const orderB1 = await createOrder(baseOrder, otherEstablishmentId);
      expect(orderB1.dailySeq).toBe(1);

      // Restaurante A -> Pedido #2
      const orderA2 = await createOrder(baseOrder, testEstablishmentId);
      expect(orderA2.dailySeq).toBe(2);
    });

    it("should handle high concurrency without duplication", async () => {
      const results = await Promise.all([
        createOrder(baseOrder, testEstablishmentId),
        createOrder(baseOrder, testEstablishmentId),
        createOrder(baseOrder, testEstablishmentId),
      ]);
      const sequences = results.map(r => r.dailySeq).sort((a, b) => (a ?? 0) - (b ?? 0));
      expect(sequences).toEqual([1, 2, 3]);
    });

    it("should NOT reuse numbers if the last order is deleted", async () => {
      await createOrder(baseOrder, testEstablishmentId); // #1
      const order2 = await createOrder(baseOrder, testEstablishmentId); // #2
      
      const s = await supabase;
      await s.from("orders").delete().eq("id", order2.id);

      const orderNext = await createOrder(baseOrder, testEstablishmentId);
      expect(orderNext.dailySeq).toBe(3); 
    });
  });

  afterAll(async () => {
    const s = await supabase;
    await s.from("orders").delete().eq("establishment_id", testEstablishmentId);
    await s.from("daily_counters").delete().eq("establishment_id", testEstablishmentId);
    
    if (otherUserId) {
      await s.auth.admin.deleteUser(otherUserId);
    }
  });
});
