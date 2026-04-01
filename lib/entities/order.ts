export type OrderStatus = "OPEN" | "CLOSED";
export type OrderType = "DELIVERY" | "LOCAL" | "PICKUP";

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

  constructor(data: {
    id?: string;
    status?: OrderStatus;
    orderLines: OrderLine[];
    date?: string;
    estimatedTime?: number;
  }) {
    this.id = data.id;
    this.status = data.status || "OPEN";
    this.orderLines = data.orderLines;
    this.date = data.date || new Date().toISOString();
    this.estimatedTime = data.estimatedTime;
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
    if (!this.id) return "";
    let prefix = "";
    switch (this.type) {
      case "LOCAL":
        prefix = "LOC";
        break;
      case "DELIVERY":
        prefix = "DLV";
        break;
      case "PICKUP":
        prefix = "PIC";
        break;
    }
    return `#${prefix}-${this.id.slice(0, 6).toUpperCase()}`;
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

  static fromDTO(dto: {
    id?: string;
    status?: OrderStatus;
    type: OrderType;
    detail?: string;
    deliveryFee?: number;
    address?: string;
    estimatedTime?: number;
    orderLines: OrderLine[];
  }): Order {
    switch (dto.type) {
      case "LOCAL":
        return new LocalOrder({
          id: dto.id,
          status: dto.status,
          orderLines: dto.orderLines,
          tableNumber: dto.detail || "",
          estimatedTime: dto.estimatedTime,
        });
      case "PICKUP":
        return new PickupOrder({
          id: dto.id,
          status: dto.status,
          orderLines: dto.orderLines,
          customerName: dto.detail || "",
          estimatedTime: dto.estimatedTime,
        });
      case "DELIVERY":
        return new DeliveryOrder({
          id: dto.id,
          status: dto.status,
          orderLines: dto.orderLines,
          address: dto.address || dto.detail || "",
          deliveryFee: dto.deliveryFee || 0,
          estimatedTime: dto.estimatedTime,
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
  }) {
    super(data);
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
  }) {
    super(data);
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
  }) {
    super(data);
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
