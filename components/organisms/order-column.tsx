import { OrderDTO } from "@/app/auth/orders/types";
import { OrderCard } from "./order-card";

interface OrderColumnProps {
  title: string;
  orders: OrderDTO[];
  status: "OPEN" | "CLOSED";
  onEdit?: (order: OrderDTO) => void;
  onDelete?: (id: string) => void;
  onFinish?: (id: string) => void;
  onReopen?: (id: string) => void;
}

export function OrderColumn({ title, orders, status, ...actions }: OrderColumnProps) {
  const filteredOrders = orders.filter(o => o.status === status);

  return (
    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex flex-col h-full" data-testid={`order-column-${status}`}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          {title}
          <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">
            {filteredOrders.length}
          </span>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredOrders.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">Nenhum pedido aqui</p>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} {...actions} />
          ))
        )}
      </div>
    </div>
  );
}