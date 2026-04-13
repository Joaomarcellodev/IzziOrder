
export type OrderLineDTO = {
  id?: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observation?: string;
};

export type OrderDTO = {
  id?: string;
  code: string;
  total: number;
  status: "OPEN" | "CLOSED";
  type: "LOCAL" | "PICKUP" | "DELIVERY";
  detail?: string;
  tableNumber?: string;
  customerName?: string;
  orderLines: OrderLineDTO[];
};

export interface OrderCardProps {
  order: OrderDTO;
  onEdit?: (order: OrderDTO) => void;
  onDelete?: (id: string) => void;
  onFinish?: (id: string) => void;
  onReopen?: (id: string) => void;
}