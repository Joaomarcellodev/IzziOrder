export class CashEntryCategory {
  id?: any;
  establishmentId: string;
  name: string;

  constructor(data: {
    id?: any;
    establishmentId: string;
    name: string;
  }) {
    this.id = data.id;
    this.establishmentId = data.establishmentId;
    this.name = data.name;
    this.validate();
  }

  private validate() {
    if (!this.name || this.name.trim() === "") {
      throw new Error("O nome da categoria é obrigatório.");
    }
    if (!this.establishmentId || this.establishmentId.trim() === "") {
      throw new Error("O ID do estabelecimento é obrigatório.");
    }
  }

  toJSON() {
    return {
      id: this.id,
      establishmentId: this.establishmentId,
      name: this.name,
    };
  }

  static fromDTO(dto: {
    id?: any;
    establishment_id: string;
    name: string;
  }): CashEntryCategory {
    return new CashEntryCategory({
      id: dto.id,
      establishmentId: dto.establishment_id,
      name: dto.name,
    });
  }
}
