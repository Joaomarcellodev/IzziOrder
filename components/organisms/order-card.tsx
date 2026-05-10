"use client";

import { OrderCardProps, OrderLineDTO } from "@/app/auth/orders/types";
import { Button } from "../atoms/button";
import { Pencil, Trash2, CheckCircle, RotateCcw } from "lucide-react";

export function OrderCard({ order, onEdit, onDelete, onFinish, onReopen }: OrderCardProps) {
  const isClosed = order.status === "CLOSED";

  return (
    <div 
      className="p-4 border border-gray-100 rounded-xl mb-4 bg-white shadow-sm hover:shadow-md transition-all ring-1 ring-black/5" 
      data-testid="order-card"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              {order.code}
            </span>
            {order.date && (
              <span className="text-[10px] text-gray-400 font-medium">
                {(() => {
                  const parts = order.date.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}`;
                  }
                  return order.date;
                })()}
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-gray-800 mt-2.5">
            {order.type === "LOCAL" ? `Mesa: ${order.detail}` : `Cliente: ${order.detail}`}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5 font-medium">
            {order.type === "LOCAL" ? "Consumo Local" : "Retirada"}
          </p>
        </div>
        <p className="font-black text-gray-900 text-sm">R$ {order.total.toFixed(2)}</p>
      </div>

      <div className="space-y-1.5 my-4">
        {order.orderLines?.map((item: OrderLineDTO) => (
          <div key={item.id || item.menuItemId} className="text-xs text-gray-600 flex justify-between items-start">
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex gap-1.5 overflow-hidden">
                <span className="font-bold text-blue-600 shrink-0">{item.quantity}x</span>
                <span className="font-medium text-gray-700 truncate">{item.name}</span>
              </div>
              {item.observation && (
                <span className="text-[10px] italic text-amber-600 mt-0.5 ml-5 leading-tight">
                  Obs: {item.observation}
                </span>
              )}
            </div>
            <span className="text-gray-400 text-[10px] font-medium ml-2 shrink-0">R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

{(order as any).paymentMethod && (
  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
    <span className="font-medium">Pagamento: </span>
    {({
      PIX: "Pix",
      CREDITO: "Crédito",
      DEBITO: "Débito",
      ESPECIE_SEM_TROCO: "Espécie sem troco",
      ESPECIE_COM_TROCO: "Espécie com troco",
    } as Record<string, string>)[(order as any).paymentMethod]}
    {(order as any).paymentMethod === "ESPECIE_COM_TROCO" && (
      <span className="text-green-600 font-semibold ml-1">
        — Troco: R$ {((order as any).changeValue ?? 0).toFixed(2)}
      </span>
    )}
  </div>
)}

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-50 mt-2">
        {!isClosed ? (
          <>
            <Button 
              size="sm" 
              onClick={() => onFinish?.(order.id!)} 
              className="bg-green-600 hover:bg-green-700 h-9 gap-2 text-white px-4 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={order.type === "LOCAL" && !(order as any).paymentMethod}
              title={order.type === "LOCAL" && !(order as any).paymentMethod 
              ? "Informe a forma de pagamento para finalizar" 
              : ""}
              data-testid="finish-order-button"
            >
              <CheckCircle className="size-4" /> Finalizar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onEdit?.(order)} 
              className="text-yellow-600 hover:bg-yellow-50 h-9 w-9 p-0 rounded-lg border border-gray-100"
              data-testid="edit-order-button"
            >
              <Pencil className="size-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete?.(order.id!)} 
              className="text-red-500 hover:bg-red-50 h-9 w-9 p-0 rounded-lg border border-gray-100"
              data-testid="delete-order-button"
            >
              <Trash2 className="size-4" />
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onReopen?.(order.id!)} 
            className="h-9 gap-2 text-gray-600 border-gray-200 px-4 rounded-lg font-bold"
            data-testid="reopen-order-button"
          >
            <RotateCcw className="size-4" /> Reabrir
          </Button>
        )}
      </div>
    </div>
  );
}