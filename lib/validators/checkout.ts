import { PaymentMethod } from "@/lib/entities/order";

export interface CheckoutData {
  customerName: string;
  phone: string;
  orderType: "PICKUP" | "DELIVERY";
  address?: string;
  paymentMethod: PaymentMethod;
  changeValue?: number;
  cartTotal: number;
}

export function validateCheckout(data: CheckoutData): string[] {
  const errors: string[] = [];

  // Validação do nome
  if (!data.customerName || data.customerName.trim().length < 3) {
    errors.push("O nome deve ter pelo menos 3 caracteres.");
  }

  // Validação do telefone
  const cleanPhone = data.phone?.replace(/\D/g, "") || "";
  if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
    errors.push("Informe um telefone válido com DDD (10 ou 11 dígitos).");
  }

  // Validação do tipo de pedido
  if (!data.orderType || !["PICKUP", "DELIVERY"].includes(data.orderType)) {
    errors.push("Selecione o tipo de pedido (retirada ou delivery).");
  }

  // Validação de endereço para delivery
  if (data.orderType === "DELIVERY") {
    if (!data.address || data.address.trim().length < 5) {
      errors.push(
        "Endereço de entrega é obrigatório e precisa de pelo menos 5 caracteres."
      );
    }
  }

  // Validação da forma de pagamento
  const validPayments: PaymentMethod[] = [
    "PIX",
    "CREDITO",
    "DEBITO",
    "ESPECIE_SEM_TROCO",
    "ESPECIE_COM_TROCO",
  ];

  if (!data.paymentMethod || !validPayments.includes(data.paymentMethod)) {
    errors.push("Selecione uma forma de pagamento válida.");
  }

  // Validação do troco
  if (data.paymentMethod === "ESPECIE_COM_TROCO") {
    if (!data.changeValue || data.changeValue <= 0) {
      errors.push("Informe o valor para troco.");
    } else if (data.changeValue <= data.cartTotal) {
      errors.push(
        "O valor para troco deve ser maior que o total do pedido."
      );
    }
  }

  return errors;
}
