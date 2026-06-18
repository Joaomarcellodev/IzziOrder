"use client";

import { useState } from "react";
import {
  X,
  ArrowLeft,
  CheckCircle2,
  Store,
  Truck,
  MapPin,
  Wallet,
  QrCode,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";
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
    orderType: "PICKUP",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof CheckoutData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = value;
    if (value.length > 2)
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 7)
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;

    handleChange("phone", formatted);
  };

  const handleSubmit = async () => {
    const dataToValidate: CheckoutData = {
      customerName: formData.customerName || "",
      phone: formData.phone || "",
      orderType: formData.orderType as "PICKUP" | "DELIVERY",
      address: formData.address,
      paymentMethod: formData.paymentMethod as PaymentMethod,
      changeValue: formData.changeValue
        ? Number(formData.changeValue)
        : undefined,
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
    { id: "PIX", label: "PIX", icon: QrCode },
    { id: "CREDITO", label: "Cartão de Crédito", icon: CreditCard },
    { id: "DEBITO", label: "Cartão de Débito", icon: Wallet },
    { id: "ESPECIE_SEM_TROCO", label: "Dinheiro (sem troco)", icon: Banknote },
    {
      id: "ESPECIE_COM_TROCO",
      label: "Dinheiro (preciso de troco)",
      icon: Banknote,
    },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* BACKDROP COM BLUR REFINADO */}
      <div
        className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
        {/* HEADER ESTILO APP */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 shrink-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-black text-neutral-900 tracking-tight">
              Finalização
            </h2>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              Confirmação de Dados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-2xl animate-in zoom-in-95 duration-200">
              <p className="font-black text-xs uppercase tracking-wider mb-2">
                Ops! Verifique:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs font-medium">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dados Pessoais */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FD7E14]" />
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Identificação
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-xs font-bold text-neutral-700 ml-1"
                >
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  placeholder="Como devemos te chamar?"
                  value={formData.customerName || ""}
                  onChange={(e) => handleChange("customerName", e.target.value)}
                  className="rounded-xl border-neutral-200 focus:border-[#FD7E14] focus:ring-[#FD7E14]/10 h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-bold text-neutral-700 ml-1"
                >
                  WhatsApp
                </Label>
                <Input
                  id="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone || ""}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  className="rounded-xl border-neutral-200 focus:border-[#FD7E14] focus:ring-[#FD7E14]/10 h-11"
                />
              </div>
            </div>
          </section>

          {/* Tipo de Pedido */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FD7E14]" />
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Entrega ou Retirada
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleChange("orderType", "PICKUP")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                  formData.orderType === "PICKUP"
                    ? "border-[#FD7E14] bg-[#FD7E14]/5 text-[#FD7E14]"
                    : "border-neutral-100 text-neutral-400 hover:border-neutral-200",
                )}
              >
                <Store
                  className={cn(
                    "h-6 w-6",
                    formData.orderType === "PICKUP"
                      ? "text-[#FD7E14]"
                      : "text-neutral-300",
                  )}
                />
                <span className="text-xs font-black uppercase tracking-tighter">
                  Vou Retirar
                </span>
              </button>
              <button
                onClick={() => handleChange("orderType", "DELIVERY")}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300",
                  formData.orderType === "DELIVERY"
                    ? "border-[#FD7E14] bg-[#FD7E14]/5 text-[#FD7E14]"
                    : "border-neutral-100 text-neutral-400 hover:border-neutral-200",
                )}
              >
                <Truck
                  className={cn(
                    "h-6 w-6",
                    formData.orderType === "DELIVERY"
                      ? "text-[#FD7E14]"
                      : "text-neutral-300",
                  )}
                />
                <span className="text-xs font-black uppercase tracking-tighter">
                  Delivery
                </span>
              </button>
            </div>

            {formData.orderType === "DELIVERY" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-[#FD7E14] transition-colors" />
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro e complemento"
                    value={formData.address || ""}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="pl-10 rounded-xl border-neutral-200 focus:border-[#FD7E14] focus:ring-[#FD7E14]/10 h-12"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Pagamento */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FD7E14]" />
              <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                Pagamento no Recebimento
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = formData.paymentMethod === method.id;
                return (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all duration-200",
                      isSelected
                        ? "border-[#FD7E14] bg-[#FD7E14]/5 shadow-sm"
                        : "border-neutral-100 hover:bg-neutral-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isSelected
                            ? "bg-[#FD7E14] text-white"
                            : "bg-neutral-100 text-neutral-400",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-bold",
                          isSelected ? "text-neutral-900" : "text-neutral-600",
                        )}
                      >
                        {method.label}
                      </span>
                    </div>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={isSelected}
                      onChange={() => handleChange("paymentMethod", method.id)}
                      className="w-4 h-4 text-[#FD7E14] border-neutral-300 focus:ring-[#FD7E14]"
                    />
                  </label>
                );
              })}
            </div>

            {formData.paymentMethod === "ESPECIE_COM_TROCO" && (
              <div className="pt-2 animate-in fade-in slide-in-from-top-4 duration-300 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                <Label
                  htmlFor="changeValue"
                  className="text-xs font-bold text-neutral-600"
                >
                  Troco para quanto?
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                    R$
                  </span>
                  <Input
                    id="changeValue"
                    type="number"
                    placeholder="Ex: 50.00"
                    value={formData.changeValue || ""}
                    onChange={(e) =>
                      handleChange("changeValue", e.target.value)
                    }
                    className="pl-10 rounded-xl border-neutral-200 focus:border-[#FD7E14] h-11"
                  />
                </div>
                <p className="text-[10px] font-bold text-[#FD7E14] mt-2 uppercase tracking-wide">
                  O valor deve ser superior a R${" "}
                  {cartTotal.toFixed(2).replace(".", ",")}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-100 bg-white shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full rounded-2xl h-14 bg-neutral-900 hover:bg-[#FD7E14] text-white font-black text-base shadow-xl shadow-neutral-900/10 hover:shadow-[#FD7E14]/20 flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Finalizar Pedido • R$ {cartTotal.toFixed(2).replace(".", ",")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
