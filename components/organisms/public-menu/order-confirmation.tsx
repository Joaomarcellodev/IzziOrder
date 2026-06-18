"use client";

import { CheckCircle2, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrderConfirmationProps {
  orderId: string;
  dailySeq: number;
  phone: string;
  establishmentName: string;
  onNewOrder: () => void;
}

export function OrderConfirmation({
  orderId,
  dailySeq,
  phone,
  establishmentName,
  onNewOrder,
}: OrderConfirmationProps) {
  const [copied, setCopied] = useState(false);

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const formattedSeq = dailySeq.toString().padStart(3, "0");

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-md w-full space-y-8">
        {/* Ícone de Sucesso */}
        <div className="mx-auto w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Pedido Realizado!
          </h1>
          <p className="text-lg text-gray-600">
            Seu pedido em <strong className="text-gray-900">{establishmentName}</strong> foi recebido com sucesso.
          </p>
        </div>

        {/* Card do Pedido */}
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">
              Sua senha
            </p>
            <div className="text-4xl font-black text-blue-600">
              #{formattedSeq}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">ID do Pedido</p>
            <button
              onClick={copyOrderId}
              className={cn(
                "flex items-center justify-center gap-2 w-full p-2 rounded-lg text-xs font-mono transition-colors",
                copied ? "bg-green-100 text-green-700" : "bg-white border text-gray-600 hover:bg-gray-100"
              )}
            >
              {orderId.substring(0, 13)}...
              {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3 pt-4">
          <p className="text-sm text-gray-500 px-4">
            Em caso de dúvidas, entre em contato diretamente com o estabelecimento.
          </p>

          <Button
            onClick={onNewOrder}
            variant="outline"
            className="w-full rounded-2xl h-12 font-bold"
          >
            Fazer novo pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
