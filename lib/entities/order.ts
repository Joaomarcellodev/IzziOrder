export type OrderStatus = "OPEN" | "CLOSED";
export type OrderType = "DELIVERY" | "LOCAL" | "PICKUP";
export type PaymentMethod = "PIX" | "CREDITO" | 'DEBITO' | "ESPECIE_SEM_TROCO" | "ESPECIE_COM_TROCO";

export interface OrderLine {
  id?: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  observation?: string;
}

export abstract class Order {
  id?: string;
  status: OrderStatus;
  orderLines: OrderLine[];
  date?: string;
  estimatedTime?: number;
  detail?: string;
  paymentMethod?: PaymentMethod;
  changeValue?: number;
  dailySeq?: number;

  constructor(data: {
    id?: string;
    status?: OrderStatus;
    orderLines: OrderLine[];
    date?: string;
    estimatedTime?: number;
    dailySeq?: number;
    detail?: string;
    paymentMethod?: PaymentMethod;
    changeValue?: number;
  }) {
    this.id = data.id;
    this.status = data.status || "OPEN";
    this.orderLines = data.orderLines;
    this.date = data.date || new Date().toISOString();
    this.estimatedTime = data.estimatedTime;
    this.paymentMethod = data.paymentMethod;
    this.changeValue = data.changeValue ?? 0;
    this.dailySeq = data.dailySeq;
    this.detail = data.detail;
    this.validateBase();
  }

  abstract get type(): OrderType;

  get total(): number {
    return this.orderLines.reduce(
      (acc, line) => acc + line.price * line.quantity,
      0
    );
  }

  get code(): string {
    if (this.dailySeq) {
      return `#${this.dailySeq}`;
    }
    if (!this.id) return "";
    return `#${this.id.slice(0, 6).toUpperCase()}`;
  }

  get itemsCount(): number {
    return this.orderLines.reduce((acc, line) => acc + line.quantity, 0);
  }

  protected validateBase() {
    if (this.orderLines.length === 0) {
      throw new Error("O pedido deve conter pelo menos um item.");
    }
  }

  close() {
    if (this.status === "CLOSED") {
      throw new Error("Pedido já está fechado.");
    }
    this.status = "CLOSED";
  }

  reopen() {
    if (this.status === "OPEN") {
      throw new Error("Pedido já está aberto.");
    }
    this.status = "OPEN";
  }

  toJSON() {
    return {
      id: this.id,
      status: this.status,
      orderLines: this.orderLines,
      date: this.date,
      estimatedTime: this.estimatedTime,
      detail: this.detail,
      type: this.type,
      total: this.total,
      code: this.code,
      itemsCount: this.itemsCount,
      dailySeq: this.dailySeq,
      paymentMethod: this.paymentMethod,
      changeValue: this.changeValue,
    };
  }

  static fromDTO(dto: {
    id?: string;
    status?: OrderStatus;
    type: OrderType;
    detail?: string;
    deliveryFee?: number;
    address?: string;
    estimatedTime?: number;
    orderLines: OrderLine[];
    dailySeq?: number;
    paymentMethod?: PaymentMethod;
    changeValue?: number;
  }): Order {
    switch (dto.type) {
      case "LOCAL":
        return new LocalOrder({
          id: dto.id,
          status: dto.status,
          orderLines: dto.orderLines,
          tableNumber: dto.detail || "",
          estimatedTime: dto.estimatedTime,
          dailySeq: dto.dailySeq,
          paymentMethod: dto.paymentMethod,
          changeValue: dto.changeValue
        });
      case "PICKUP":
        return new PickupOrder({
          id: dto.id,
          status: dto.status,
          orderLines: dto.orderLines,
          customerName: dto.detail || "",
          estimatedTime: dto.estimatedTime,
          dailySeq: dto.dailySeq,
          paymentMethod: dto.paymentMethod,
          changeValue: dto.changeValue,
        });
      case "DELIVERY":
        return new DeliveryOrder({
          id: dto.id,
          status: dto.status,
          orderLines: dto.orderLines,
          address: dto.address || dto.detail || "",
          deliveryFee: dto.deliveryFee || 0,
          estimatedTime: dto.estimatedTime,
          dailySeq: dto.dailySeq,
          paymentMethod: dto.paymentMethod,
          changeValue: dto.changeValue,
        });
      default:
        throw new Error("Tipo de pedido inválido.");
    }
  }
}

export class LocalOrder extends Order {
  tableNumber: string;

  constructor(data: {
    id?: string;
    status?: OrderStatus;
    orderLines: OrderLine[];
    tableNumber: string;
    date?: string;
    estimatedTime?: number;
    dailySeq?: number;
    paymentMethod?: PaymentMethod;
    changeValue?: number;
  }) {
    super({ ...data, detail: data.tableNumber });
    this.tableNumber = data.tableNumber;
    this.validate();
  }

  get type(): OrderType {
    return "LOCAL";
  }

  private validate() {
    if (!this.tableNumber || this.tableNumber.trim() === "") {
      throw new Error("Mesa é obrigatória para pedidos locais.");
    }
  }
}

export class PickupOrder extends Order {
  customerName: string;

  constructor(data: {
    id?: string;
    status?: OrderStatus;
    orderLines: OrderLine[];
    customerName: string;
    date?: string;
    estimatedTime?: number;
    dailySeq?: number;
    paymentMethod?: PaymentMethod;
    changeValue?: number;
  }) {
    super({ ...data, detail: data.customerName });
    this.customerName = data.customerName;
    this.validate();
  }

  get type(): OrderType {
    return "PICKUP";
  }

  private validate() {
    if (!this.customerName || this.customerName.trim().length < 3) {
      throw new Error(
        "Pedido do tipo retirada precisa de pelo menos 3 caracteres no nome do cliente."
      );
    }
  }
}

export class DeliveryOrder extends Order {
  address: string;
  deliveryFee: number;

  constructor(data: {
    id?: string;
    status?: OrderStatus;
    orderLines: OrderLine[];
    address: string;
    deliveryFee: number;
    date?: string;
    estimatedTime?: number;
    dailySeq?: number;
    paymentMethod?: PaymentMethod;
    changeValue?: number;
  }) {
    super({ ...data, detail: data.address });
    this.address = data.address;
    this.deliveryFee = data.deliveryFee;
    this.validate();
  }

  get type(): OrderType {
    return "DELIVERY";
  }

  override get total(): number {
    return super.total + this.deliveryFee;
  }

  private validate() {
    if (!this.address || this.address.trim().length < 5) {
      throw new Error("Endereço de entrega é obrigatório e precisa de pelo menos 5 caracteres.");
    }
    if (this.deliveryFee < 0) {
      throw new Error("Taxa de entrega não pode ser negativa.");
    }
  }
}
