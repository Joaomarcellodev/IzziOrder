export function validateMenuItem(item: {
    name: string;
    description: string;
    price: number;
    categoryId: string;
}): string[] {
    const errors: string[] = [];

    if (!item.name || item.name.trim().length < 3) {
        errors.push("O nome deve ter pelo menos 3 caracteres.");
    }
    if (!item.description || item.description.trim().length < 3) {
        errors.push("A descrição deve ter pelo menos 3 caracteres.");
    }
    if (item.price < 0) {
        errors.push("O preço não pode ser negativo.");
    }
    if (!item.categoryId) {
        errors.push("A categoria é obrigatória.");
    }

    return errors;
}