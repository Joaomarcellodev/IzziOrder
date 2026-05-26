"use client";

import { useState } from "react";
import { X, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { cn } from "@/lib/utils";
import { CheckoutData, validateCheckout } from "@/lib/validators/checkout";
import { PaymentMethod } from "@/lib/entities/order";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  cartTotal: number;
  onSubmit: (data: CheckoutData) => Promise<void>;
}

export function CheckoutModal({
  isOpen,
  onClose,
  onBack,
  cartTotal,
  onSubmit,
}: CheckoutModalProps) {
  const [formData, setFormData] = useState<Partial<CheckoutData>>({
    orderType: "PICKUP", // Padrão retirado conforme o admin anterior (mas suporta os dois agora)
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof CheckoutData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]); // Limpa erros ao digitar
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    // Formatação (XX) XXXXX-XXXX
    let formatted = value;
    if (value.length > 2) formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 7) formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    
    handleChange("phone", formatted);
  };

  const handleSubmit = async () => {
    const dataToValidate: CheckoutData = {
      customerName: formData.customerName || "",
      phone: formData.phone || "",
      orderType: formData.orderType as "PICKUP" | "DELIVERY",
      address: formData.address,
      paymentMethod: formData.paymentMethod as PaymentMethod,
      changeValue: formData.changeValue ? Number(formData.changeValue) : undefined,
      cartTotal,
    };

    const validationErrors = validateCheckout(dataToValidate);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(dataToValidate);
    } catch (err: any) {
      setErrors([err.message || "Erro ao processar pedido."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: "PIX", label: "PIX" },
    { id: "CREDITO", label: "Cartão de Crédito" },
    { id: "DEBITO", label: "Cartão de Débito" },
    { id: "ESPECIE_SEM_TROCO", label: "Dinheiro (sem troco)" },
    { id: "ESPECIE_COM_TROCO", label: "Dinheiro (preciso de troco)" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-0">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">Finalizar Pedido</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errors.length > 0 && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
              <ul className="list-disc pl-5 space-y-1">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dados Pessoais */}
          <section className="space-y-4">
            <h3 className="font-bold text-gray-900">Seus Dados</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Ex: João Silva"
                  value={formData.customerName || ""}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={formData.phone || ""}
                  onChange={handlePhoneChange}
                  maxLength={15}
                />
              </div>
            </div>
          </section>

          {/* Tipo de Pedido */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900">Como deseja receber?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange("orderType", "PICKUP")}
                className={cn(
                  "p-3 rounded-xl border-2 text-center font-semibold transition-all",
                  formData.orderType === "PICKUP" 
                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                Vou Retirar
              </button>
              <button
                onClick={() => handleChange("orderType", "DELIVERY")}
                className={cn(
                  "p-3 rounded-xl border-2 text-center font-semibold transition-all",
                  formData.orderType === "DELIVERY" 
                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                Delivery
              </button>
            </div>

            {formData.orderType === "DELIVERY" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="address">Endereço completo de entrega</Label>
                <Input
                  id="address"
                  placeholder="Rua, Número, Bairro, Referência"
                  value={formData.address || ""}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            )}
          </section>

          {/* Pagamento */}
          <section className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="font-bold text-gray-900">Forma de Pagamento</h3>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    formData.paymentMethod === method.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={() => handleChange("paymentMethod", method.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-600"
                  />
                  <span className={cn(
                    "font-medium",
                    formData.paymentMethod === method.id ? "text-blue-900" : "text-gray-700"
                  )}>
                    {method.label}
                  </span>
                </label>
              ))}
            </div>

            {formData.paymentMethod === "ESPECIE_COM_TROCO" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="changeValue">Troco para quanto?</Label>
                <Input
                  id="changeValue"
                  type="number"
                  placeholder={`Ex: 100`}
                  value={formData.changeValue || ""}
                  onChange={(e) => handleChange("changeValue", e.target.value)}
                  min={cartTotal + 1}
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O valor deve ser maior que R$ {cartTotal.toFixed(2).replace(".", ",")}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Processando...</span>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Confirmar Pedido (R$ {cartTotal.toFixed(2).replace(".", ",")})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
