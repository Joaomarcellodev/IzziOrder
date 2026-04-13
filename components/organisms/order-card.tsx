"use client";

import { OrderCardProps, OrderLineDTO } from "@/app/auth/orders/types";
import { Button } from "../atoms/button";
import { Pencil, Trash2, CheckCircle, RotateCcw } from "lucide-react";

export function OrderCard({ order, onEdit, onDelete, onFinish, onReopen }: OrderCardProps) {
  const isClosed = order.status === "CLOSED";

  return (
    <div className="p-4 border border-gray-100 rounded-xl mb-3 bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            #{order.code}
          </span>
          <p className="text-sm font-semibold text-gray-800 mt-2">
            {order.type === "LOCAL" ? `Mesa: ${order.detail}` : `Cliente: ${order.detail}`}
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">
            {order.type === "LOCAL" ? "Consumo Local" : "Retirada"}
          </p>
        </div>
        <p className="font-bold text-gray-900 text-sm">R$ {order.total.toFixed(2)}</p>
      </div>

      <div className="space-y-1 my-3">
        {order.orderLines?.map((item: OrderLineDTO) => (
          <div key={item.id || item.menuItemId} className="text-xs text-gray-600 flex justify-between">
            <div className="flex flex-col">
              <span>{item.quantity}x {item.name}</span>
              {item.observation && (
                <span className="text-[10px] italic text-gray-400 ml-2">
                  Obs: {item.observation}
                </span>
              )}
            </div>
            <span className="text-gray-400">R$ {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-50">
        {!isClosed ? (
          <>
            <Button 
              size="sm" 
              onClick={() => onFinish?.(order.id!)} 
              className="bg-green-600 hover:bg-green-700 h-8 gap-2 text-white"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Finalizar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onEdit?.(order)} 
              className="text-yellow-600 hover:bg-yellow-50 h-8 w-8 p-0"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete?.(order.id!)} 
              className="text-red-500 hover:bg-red-50 h-8 w-8 p-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onReopen?.(order.id!)} 
            className="h-8 gap-2 text-gray-600 border-gray-200"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reabrir
          </Button>
        )}
      </div>
    </div>
  );
}