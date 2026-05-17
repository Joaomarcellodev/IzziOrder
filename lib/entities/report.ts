import { PaymentMethod, OrderType } from "./order";

export interface SalesReportFilters {
  establishmentId: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  type?: OrderType;
  productId?: string;
  month?: number;
  year?: number;
}

export interface SalesReport {
  deliveryFeeTotal: number;
  generalTotalSales: number;
  totalChange: number;
  salesByDay: { date: string; total: number; count: number }[];
  salesByProduct: {
    name: string;
    quantity: number;
    total: number;
    category?: string;
    taxa: number;
    troco: number;
    paymentMethods: string[];
  }[];
  salesByPaymentMethod: { method: PaymentMethod; total: number }[];
  ordersByType: { type: OrderType; total: number }[];
  ordersByDay: {
    date: string;
    orders: any[];
  }[];
}