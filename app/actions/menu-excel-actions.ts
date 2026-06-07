"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { getEstablishmentId } from "@/app/actions/establisment_actions";
import { parseMenuExcel, generateMenuExcel } from "@/lib/services/menu-excel-service";
import { calculateNextPosition, getMenuItems } from "./menu-item-actions";
import { getCategories } from "./category-actions";
import { PLACEHOLDER_IMAGE_URL } from "@/lib/constants";

export async function importMenuAction(formData: FormData, testEstablishmentId?: string) {
  try {
    const establishmentId = testEstablishmentId ? testEstablishmentId : await getEstablishmentId();
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado." };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. O Motor Excel fará a validação estrutural e das linhas
    const parsedItems = await parseMenuExcel(buffer);

    const supabase = await createClient();
    if (!establishmentId) {
      return { success: false, error: "Estabelecimento não encontrado." };
    }

    // 2. Validação da Regra de Ouro: Todos os IDs informados existem?
    const idsFromExcel = parsedItems.filter(item => item.id).map(item => item.id as string);
    if (idsFromExcel.length > 0) {
      const { data: existingItems, error: fetchError } = await supabase
        .from("menu_items")
        .select("id, name")
        .eq("establishment_id", establishmentId)
        .in("id", idsFromExcel);

      if (fetchError) {
        throw new Error("Erro ao consultar os itens existentes no banco.");
      }

      const existingIds = new Set(existingItems?.map(item => item.id));
      const missingIds = idsFromExcel.filter(id => !existingIds.has(id));

      if (missingIds.length > 0) {
        // Pega o primeiro item falho para dar a mensagem bonitinha
        const wrongItem = parsedItems.find(i => i.id === missingIds[0]);
        return { success: false, error: `Processo cancelado! O produto "${wrongItem?.name}" possui um ID inexistente na planilha. Baixe um novo modelo exportado para atualizações.` };
      }
    }

    // 3. Resolução de Categorias (Criar as que não existem)
    const uniqueCategoryNames = Array.from(new Set(parsedItems.map(i => i.categoryName)));
    
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id, name")
      .eq("establishment_id", establishmentId)
      .in("name", uniqueCategoryNames);

    const existingCategoryMap = new Map((existingCategories || []).map(c => [c.name.toLowerCase(), c.id]));
    const categoryMap = new Map<string, string>(); // name -> id

    for (const catName of uniqueCategoryNames) {
      const lowerCatName = catName.toLowerCase();
      if (existingCategoryMap.has(lowerCatName)) {
        categoryMap.set(catName, existingCategoryMap.get(lowerCatName)!);
      } else {
        // Criar categoria nova
        const { data: newCat, error: catError } = await supabase
          .from("categories")
          .insert({ name: catName, establishment_id: establishmentId })
          .select("id")
          .single();

        if (catError) {
          throw new Error(`Erro ao criar a categoria: ${catName}. Detalhes: ${JSON.stringify(catError)}`);
        }
        categoryMap.set(catName, newCat.id);
      }
    }

    // 4. Salvar os Produtos
    let baseNextPosition = await calculateNextPosition(supabase);

    // Buscar todos os itens existentes para evitar duplicatas por nome+categoria
    const { data: allExistingItems, error: allItemsError } = await supabase
      .from("menu_items")
      .select("id, name, category_id")
      .eq("establishment_id", establishmentId);

    if (allItemsError) {
      throw new Error("Erro ao consultar catálogo de produtos para validação.");
    }

    const existingItemsMap = new Map<string, string>();
    allExistingItems?.forEach(item => {
      // Chave: "nomeemminusculo_idCategoria"
      const key = `${item.name.toLowerCase().trim()}_${item.category_id}`;
      existingItemsMap.set(key, item.id);
    });

    const itemsToCreate = [];
    const itemsToUpdatePromises = [];

    for (const item of parsedItems) {
      const categoryId = categoryMap.get(item.categoryName);
      if (!categoryId) continue;

      let itemId = item.id;

      // Se não veio com ID da planilha, tentamos achar um item idêntico no banco
      if (!itemId) {
        const key = `${item.name.toLowerCase().trim()}_${categoryId}`;
        if (existingItemsMap.has(key)) {
          itemId = existingItemsMap.get(key);
        }
      }

      if (itemId) {
        // Atualizar existente
        itemsToUpdatePromises.push(
          supabase
            .from("menu_items")
            .update({
              name: item.name,
              description: item.description || null,
              price: item.price,
              category_id: categoryId,
            })
            .eq("id", itemId)
            .eq("establishment_id", establishmentId)
        );
      } else {
        // Criar novo
        itemsToCreate.push({
          name: item.name,
          description: item.description || null,
          price: item.price,
          category_id: categoryId,
          establishment_id: establishmentId,
          image: PLACEHOLDER_IMAGE_URL,
          available: true,
          position: baseNextPosition++,
        });
      }
    }

    // Executar updates em paralelo
    if (itemsToUpdatePromises.length > 0) {
      const updateResults = await Promise.all(itemsToUpdatePromises);
      const hasError = updateResults.some(r => r.error);
      if (hasError) {
        throw new Error("Ocorreu um erro ao atualizar os produtos existentes.");
      }
    }

    // Executar inserções de novos itens
    if (itemsToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("menu_items")
        .insert(itemsToCreate);

      if (insertError) {
        throw new Error("Ocorreu um erro ao inserir os novos produtos.");
      }
    }

    revalidatePath("/menu");
    return { 
      success: true, 
      message: `Importação concluída com sucesso! Atualizados: ${itemsToUpdatePromises.length} | Novos: ${itemsToCreate.length}` 
    };

  } catch (error: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.error("Erro na importação:", error);
    }
    return { 
      success: false, 
      error: error?.message || "Erro inesperado ao processar a planilha." 
    };
  }
}

export async function exportMenuAction(establishmentId: string) {
  try {
    if (!establishmentId) {
      return { success: false, error: "ID do estabelecimento não fornecido." };
    }

    // Buscar itens e categorias
    const { data: menuItems, error: itemsError } = await getMenuItems(establishmentId);
    if (itemsError) throw new Error(itemsError);

    const { data: categories, error: categoriesError } = await getCategories(establishmentId);
    if (categoriesError) throw new Error(categoriesError);

    // Gerar o buffer do Excel
    const buffer = await generateMenuExcel(menuItems || [], categories || []);

    // Converter Buffer para Base64
    const base64 = buffer.toString("base64");

    const hasItems = menuItems && menuItems.length > 0;
    const now = new Date();
    const date = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
    const filename = `cardapio_${date}.xlsx`;

    return { 
      success: true, 
      base64,
      filename 
    };
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'test') {
      console.error("Erro na exportação do cardápio:", error);
    }
    return { success: false, error: error.message || "Erro ao gerar o arquivo de exportação." };
  }
}
