import { OrderRequestDTO } from "@/app/actions/order-actions";

export function validateOrder(order: OrderRequestDTO) {
    const errors: string[] = [];

    if (order.type == "PICKUP") {
        if (order.detail == undefined) {
            errors.push("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
        } else if (order.detail.trim().length < 3) {
            errors.push("Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente.");
        }
    }

    return errors;
}