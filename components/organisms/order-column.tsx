import React, { useState } from "react";
import { OrderDTO } from "@/app/auth/orders/types";
import { OrderCard } from "./order-card";
import { History } from "lucide-react";

interface OrderColumnProps {
  title: string;
  orders: OrderDTO[];
  status: "OPEN" | "CLOSED";
  onEdit?: (order: OrderDTO) => void;
  onDelete?: (id: string) => void;
  onFinish?: (id: string) => void;
  onReopen?: (id: string) => void;
  serverDate: string;
}

export function OrderColumn({ title, orders, status, serverDate, ...actions }: OrderColumnProps) {
  const [showBacklog, setShowBacklog] = useState(false);

  const filteredOrders = orders.filter(o => o.status === status);
  const today = serverDate;

  const backlogOrders = filteredOrders.filter(order => order.date && order.date < today);
  const todayOrders = filteredOrders.filter(order => !order.date || order.date >= today);

  backlogOrders.sort((a, b) => {
    const dateComparison = (a.date || "").localeCompare(b.date || "");
    if (dateComparison !== 0) return dateComparison;
    return (a.dailySeq || 0) - (b.dailySeq || 0);
  });

  todayOrders.sort((a, b) => (a.dailySeq || 0) - (b.dailySeq || 0));

  const hasBacklog = status === "OPEN" && backlogOrders.length > 0;


  return (
    <div className="bg-gray-50/50 p-0 md:p-4 rounded-2xl border border-gray-100 flex flex-col h-full" data-testid={`order-column-${status}`}>
      <div className="flex items-center justify-between mb-4 px-4 mt-4 md:mt-0 md:px-1">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          {title}
          {hasBacklog ? (
            <button
              onClick={() => setShowBacklog(!showBacklog)}
              className={`text-xs px-2.5 py-1 rounded-full font-black transition-all shadow-sm flex items-center gap-1.5 shrink-0 hover:scale-105 active:scale-95 ${
                showBacklog 
                  ? "bg-orange-500 text-white" 
                  : "bg-orange-500 text-white animate-pulse"
              }`}
              title="Clique para ver pendências de dias anteriores"
            >
              <History className="size-3.5" />
              {filteredOrders.length}
            </button>
          ) : (
            <span className="bg-gray-200 text-gray-600 text-xs px-2.5 py-1 rounded-full font-bold shrink-0">
              {status === "OPEN" ? filteredOrders.length : todayOrders.length}
            </span>
          )}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto px-0 md:pr-1">
        {hasBacklog && showBacklog && (
          <div className="mb-4 space-y-4 pb-4 border-b border-orange-100">
            {backlogOrders.map(order => (
              <div key={order.id} className="relative">
                <div className="absolute -top-1.5 right-2 z-10">
                  <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase">
                    Pendente
                  </span>
                </div>
                <OrderCard order={order} {...actions} />
              </div>
            ))}
          </div>
        )}

        {todayOrders.length === 0 && (!hasBacklog || !showBacklog) ? (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum pedido aqui</p>
        ) : (
          todayOrders.map(order => (
            <OrderCard key={order.id} order={order} {...actions} />
          ))
        )}
      </div>
    </div>
  );
}