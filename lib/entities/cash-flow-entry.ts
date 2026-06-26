export class CashFlowEntry {
  id?: any;
  description?: string;
  entryCategoryId: any;
  amount: number;
  createdAt?: string;
  establishmentId: string;

  constructor(data: {
    id?: any;
    description?: string;
    entryCategoryId: any;
    amount: number;
    createdAt?: string;
    establishmentId: string;
  }) {
    this.id = data.id;
    this.description = data.description;
    this.entryCategoryId = data.entryCategoryId;
    this.amount = Number(data.amount);
    this.createdAt = data.createdAt;
    this.establishmentId = data.establishmentId;
    this.validate();
  }

  private validate() {
    if (this.entryCategoryId === undefined || this.entryCategoryId === null || String(this.entryCategoryId).trim() === "") {
      throw new Error("A categoria é obrigatória.");
    }
    if (isNaN(this.amount) || this.amount === 0) {
      throw new Error("O valor do lançamento deve ser diferente de zero.");
    }
    if (!this.establishmentId || this.establishmentId.trim() === "") {
      throw new Error("O ID do estabelecimento é obrigatório.");
    }
  }

  toJSON() {
    return {
      id: this.id,
      description: this.description,
      entryCategoryId: this.entryCategoryId,
      amount: this.amount,
      createdAt: this.createdAt,
      establishmentId: this.establishmentId,
    };
  }

  static fromDTO(dto: {
    id?: any;
    description?: string;
    entryCategoryId?: any;
    entry_category_id?: any;
    amount: number;
    createdAt?: string;
    created_at?: string;
    establishmentId?: string;
    establishment_id?: string;
  }): CashFlowEntry {
    return new CashFlowEntry({
      id: dto.id,
      description: dto.description,
      entryCategoryId: dto.entryCategoryId !== undefined ? dto.entryCategoryId : dto.entry_category_id,
      amount: dto.amount,
      createdAt: dto.createdAt || dto.created_at,
      establishmentId: dto.establishmentId || dto.establishment_id || "",
    });
  }
}
