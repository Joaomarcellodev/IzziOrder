import { PaymentMethod, OrderType } from "./order";
import { SalesReportFilters, SalesReport } from "./report";
import { format, parseISO, getMonth, getYear } from "date-fns";

/**
 * Interface representing the structure of the order data coming from Supabase.
 */
interface OrderDTO {
    id: string;
    total: string;
    delivery_fee: string | null;
    change_value: string | null;
    date: string;
    payment_method: PaymentMethod | null;
    type: OrderType;
    order_lines: OrderLineDTO[];
}

interface OrderLineDTO {
    menu_item_id: string;
    name: string;
    quantity: number;
    price: number;
    menu_items: {
        categories: {
            name: string;
        };
    };
}

/**
 * Internal interface to store processed order data for efficient grouping.
 */
interface ProcessedOrder {
    raw: OrderDTO;
    total: number;
    deliveryFee: number;
    changeValue: number;
    date: Date;
    dayKey: string;
    effectiveRevenue: number; // Revenue adjusted by filters (e.g. product filter)
}

interface ProductSummary {
    name: string;
    quantity: number;
    total: number;
    category: string;
    taxa: number;
    troco: number;
    paymentMethods: Set<PaymentMethod>;
}

interface Accumulators {
    salesByDay: Map<string, { total: number; count: number }>;
    ordersByDay: Map<string, OrderDTO[]>;
    salesByProduct: Map<string, ProductSummary>;
    salesByPaymentMethod: Map<PaymentMethod, number>;
    ordersByType: Map<OrderType, number>;
}

export class SalesReportProcessor {
    constructor(
        private readonly rawOrders: OrderDTO[],
        private readonly filters: SalesReportFilters
    ) { }

    public generateReport(): SalesReport {
        const orders = this.prepareAndFilterData();
        const report = this.initializeReport();

        const acc: Accumulators = {
            salesByDay: new Map(),
            ordersByDay: new Map(),
            salesByProduct: new Map(),
            salesByPaymentMethod: new Map(),
            ordersByType: new Map(),
        };

        orders.forEach(order => this.processOrder(order, report, acc));

        this.finalizeReport(report, acc);

        return report;
    }

    private prepareAndFilterData(): ProcessedOrder[] {
        return (this.rawOrders || [])
            .map(order => {
                const date = parseISO(order.date);
                const lines = order.order_lines || [];

                const effectiveRevenue = this.filters.productId
                    ? lines
                        .filter(l => l.menu_item_id === this.filters.productId)
                        .reduce((sum, l) => sum + (l.price * l.quantity), 0)
                    : parseFloat(order.total || "0");

                return {
                    raw: order,
                    total: parseFloat(order.total || "0"),
                    deliveryFee: parseFloat(order.delivery_fee || "0"),
                    changeValue: parseFloat(order.change_value || "0"),
                    date,
                    dayKey: format(date, "yyyy-MM-dd"),
                    effectiveRevenue
                };
            })
            .filter(order => {
                if (this.filters.month !== undefined && getMonth(order.date) + 1 !== this.filters.month) return false;
                if (this.filters.year !== undefined && getYear(order.date) !== this.filters.year) return false;
                if (this.filters.productId && order.effectiveRevenue === 0) return false;
                return true;
            });
    }

    private initializeReport(): SalesReport {
        return {
            deliveryFeeTotal: 0,
            generalTotalSales: 0,
            totalChange: 0,
            salesByDay: [],
            salesByProduct: [],
            salesByPaymentMethod: [],
            ordersByDay: [],
            ordersByType: [],
        };
    }

    private processOrder(order: ProcessedOrder, report: SalesReport, acc: Accumulators) {
        report.generalTotalSales += order.effectiveRevenue;
        report.deliveryFeeTotal += order.deliveryFee;
        report.totalChange += order.changeValue;

        // Sales by Day
        const dayData = acc.salesByDay.get(order.dayKey) || { total: 0, count: 0 };
        dayData.total += order.effectiveRevenue;
        dayData.count += 1;
        acc.salesByDay.set(order.dayKey, dayData);

        // Orders by Day
        const dayOrders = acc.ordersByDay.get(order.dayKey) || [];
        dayOrders.push(order.raw);
        acc.ordersByDay.set(order.dayKey, dayOrders);

        // Sales by Payment Method
        if (order.raw.payment_method) {
            const current = acc.salesByPaymentMethod.get(order.raw.payment_method) || 0;
            acc.salesByPaymentMethod.set(order.raw.payment_method, current + order.effectiveRevenue);
        }

        // Orders by Type
        const currentTypeCount = acc.ordersByType.get(order.raw.type) || 0;
        acc.ordersByType.set(order.raw.type, currentTypeCount + 1);

        this.processOrderLines(order, acc.salesByProduct);
    }

    private processOrderLines(order: ProcessedOrder, salesByProductMap: Map<string, ProductSummary>) {
        const lines = order.raw.order_lines || [];
        const lineCount = lines.length;
        if (lineCount === 0) return;

        lines.forEach((line) => {
            if (this.filters.productId && line.menu_item_id !== this.filters.productId) return;

            const categoryName = line.menu_items?.categories?.name || "Sem Categoria";
            const productData = salesByProductMap.get(line.menu_item_id) || {
                name: line.name,
                quantity: 0,
                total: 0,
                category: categoryName,
                taxa: 0,
                troco: 0,
                paymentMethods: new Set<PaymentMethod>()
            };

            productData.quantity += line.quantity;
            productData.total += (line.price * line.quantity);

            productData.taxa += order.deliveryFee / lineCount;
            productData.troco += order.changeValue / lineCount;

            if (order.raw.payment_method) {
                productData.paymentMethods.add(order.raw.payment_method);
            }

            salesByProductMap.set(line.menu_item_id, productData);
        });
    }

    private finalizeReport(report: SalesReport, acc: Accumulators) {
        report.salesByDay = Array.from(acc.salesByDay.entries())
            .map(([date, data]) => ({ date, total: data.total, count: data.count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        report.ordersByDay = Array.from(acc.ordersByDay.entries())
            .map(([date, orders]) => ({ date, orders }))
            .sort((a, b) => b.date.localeCompare(a.date));

        report.salesByProduct = Array.from(acc.salesByProduct.values())
            .map(p => ({
                ...p,
                paymentMethods: Array.from(p.paymentMethods)
            }))
            .sort((a, b) => b.total - a.total);

        report.salesByPaymentMethod = Array.from(acc.salesByPaymentMethod.entries())
            .map(([method, total]) => ({ method, total }));

        report.ordersByType = Array.from(acc.ordersByType.entries())
            .map(([type, total]) => ({ type, total }));

    }
}
