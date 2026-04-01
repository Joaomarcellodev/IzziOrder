import { OrderRequestDTO } from "@/app/actions/order-actions";

export function validateOrder(order: OrderRequestDTO) {
    if (order.type == "PICKUP") {
        if (order.detail == undefined) {
            throw new Error("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
        } else if (order.detail.trim().length < 3) {
            throw new Error("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
        }
    }

    if (order.orderLines.length == 0) throw new Error("O pedido deve conter pelo menos um item.")
}