"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  X,
  Printer,
  Split,
  CreditCard,
  Send,
  Zap,
  MoreVertical,
  Edit,
  Trash,
} from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/molecules/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/molecules/dialog";
import { ScrollArea } from "@/components/molecules/scroll-area";
import { Separator } from "@/components/atoms/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu";

// --- Interfaces (Mantidas) ---
interface Table {
  id: string;
  establishment_id: string;
  table_number: number;
}

interface MenuItem {
  image: string | Blob | undefined;
  id: string;
  name: string;
  price: number;
  category_id: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface TableMapProps {
  tables: Table[];
  menuItems: MenuItem[];
  categories: Category[];
}
// --- Fim Interfaces ---

// --- Componentes Modais de Ação de Mesa (Mantidos) ---

const AddTableModal = ({
  isOpen,
  onClose,
  onAddTable,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (tableNumber: number) => void;
}) => {
  const [tableNumber, setTableNumber] = useState<string>("");
  const { toast } = useToast();

  const handleSave = () => {
    const num = parseInt(tableNumber, 10);
    if (isNaN(num) || num <= 0) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de mesa válido.",
        variant: "destructive",
      });
      return;
    }
    onAddTable(num);
    setTableNumber("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Mesa</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Label htmlFor="tableNumber">Número da Mesa</Label>
          <Input
            id="tableNumber"
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Ex: 5"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} style={{ backgroundColor: "#FD7E14" }}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EditTableModal = ({
  isOpen,
  onClose,
  onEditTable,
  table,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEditTable: (id: string, newNumber: number) => void;
  table: Table | null;
}) => {
  const [tableNumber, setTableNumber] = useState(
    table ? table.table_number.toString() : ""
  );
  const { toast } = useToast();

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number.toString());
    }
  }, [table]);

  const handleSave = () => {
    const num = parseInt(tableNumber, 10);
    if (!table || isNaN(num) || num <= 0) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de mesa válido.",
        variant: "destructive",
      });
      return;
    }
    onEditTable(table.id, num);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Mesa {table?.table_number}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Label htmlFor="editTableNumber">Novo Número da Mesa</Label>
          <Input
            id="editTableNumber"
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="Ex: 5"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} style={{ backgroundColor: "#007BFF" }}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TableActionsDropdown = ({
  table,
  onEdit,
  onDelete,
}: {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (table: Table) => void;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-8 w-8 text-gray-400 hover:bg-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-40">
      <DropdownMenuItem
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          onEdit(table);
        }}
        className="cursor-pointer"
      >
        <Edit className="w-4 h-4 mr-2" /> Editar
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
          e.stopPropagation();
          onDelete(table);
        }}
        className="text-red-600 cursor-pointer"
      >
        <Trash className="w-4 h-4 mr-2" /> Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Componente Principal TableMap ---

export function TableMap({
  tables: initialTables,
  menuItems: menuItems,
  categories: initialCategories,
}: TableMapProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);
  const [isDeleteTableModalOpen, setIsDeleteTableModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { toast } = useToast();

  const categories = [{ id: "", name: "Todos" }, ...initialCategories];

  const filteredMenuItems =
    selectedCategory === ""
      ? menuItems
      : menuItems.filter((item) => item.category_id === selectedCategory);

  // --- Funções de CRUD de Mesa (Mantidas) ---
  const handleAddTable = (tableNumber: number) => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      establishment_id: "default",
      table_number: tableNumber,
    };
    if (tables.some((t) => t.table_number === tableNumber)) {
      toast({
        title: "Mesa já existe",
        description: `A mesa ${tableNumber} já está no mapa.`,
        variant: "destructive",
      });
      return;
    }
    setTables((prev) =>
      [...prev, newTable].sort((a, b) => a.table_number - b.table_number)
    );
    toast({
      title: "Mesa Adicionada",
      description: `Mesa ${tableNumber} adicionada com sucesso.`,
    });
  };

  const openEditModal = (table: Table) => {
    setTableToEdit(table);
    setIsEditTableModalOpen(true);
  };

  const handleEditTable = (id: string, newNumber: number) => {
    if (tables.some((t) => t.table_number === newNumber && t.id !== id)) {
      toast({
        title: "Número de Mesa Duplicado",
        description: `A mesa ${newNumber} já existe.`,
        variant: "destructive",
      });
      return;
    }
    setTables((prev) =>
      prev
        .map((t) => (t.id === id ? { ...t, table_number: newNumber } : t))
        .sort((a, b) => a.table_number - b.table_number)
    );
    toast({
      title: "Mesa Editada",
      description: `Mesa atualizada para ${newNumber}.`,
    });
    setIsEditTableModalOpen(false);
    setTableToEdit(null);
  };

  const openDeleteConfirmation = (table: Table) => {
    setTableToDelete(table);
    setIsDeleteTableModalOpen(true);
  };

  const handleDeleteTable = () => {
    if (!tableToDelete) return;
    setTables((prev) => prev.filter((t) => t.id !== tableToDelete.id));
    toast({
      title: "Mesa Excluída",
      description: `Mesa ${tableToDelete.table_number} foi removida.`,
      variant: "destructive",
    });
    setIsDeleteTableModalOpen(false);
    setTableToDelete(null);
  };

  // --- Funções de Pedido (Mantidas) ---

  const openTableModal = (table: Table) => {
    setSelectedTable(table);
    setCurrentOrder([]);
    setIsOrderModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTable(null);
    setIsOrderModalOpen(false);
    setCurrentOrder([]);
    setSelectedCategory("");
  };

  const addItemToOrder = (menuItem: MenuItem) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.id === menuItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          id: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCurrentOrder((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCurrentOrder((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return currentOrder.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const sendToKitchen = () => {
    toast({
      title: "Encomenda enviada para cozinha 👩‍🍳",
      description: `Mesa ${selectedTable?.table_number} enviou o pedido para a cozinha.`,
    });
  };

  const printBill = () => {
    toast({
      title: "Conta impressa 🖨️",
      description: `A conta da mesa ${selectedTable?.table_number} foi impressa.`,
    });
  };

  const splitBill = () => {
    toast({
      title: "Conta Dividida ✂️",
      description: `A conta da mesa ${selectedTable?.table_number} foi dividida.`,
    });
  };

  const closeAndPay = () => {
    if (selectedTable) {
      toast({
        title: "Pagamento concluído ✅",
        description: `Mesa ${selectedTable.table_number} foi fechada e o pagamento processado.`,
      });
      closeModal();
    }
  };

  const getTableStyle = (table: Table) => {
    // Exemplo de estilo para mesa ocupada
    const isOccupied = currentOrder.length > 0; // Usando o pedido atual como placeholder
    return isOccupied
      ? "border-red-500 bg-red-50 cursor-pointer hover:shadow-lg shadow-md"
      : "border-blue-500 bg-blue-50 cursor-pointer hover:shadow-lg shadow-md";
  };

  return (
    <div className="p-6">
      {/* Container de Mesas (Inalterado) */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Planta das Mesas</h2>
          <Button
            onClick={() => setIsAddTableModalOpen(true)}
            className="text-white font-semibold flex items-center"
            style={{ backgroundColor: "#007BFF" }}
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar Mesa
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-full">
          {tables.map((table) => (
            <div
              key={table.id}
              className={cn(
                "relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 aspect-square flex items-center justify-center", // 📱 MOBILE FIX
                getTableStyle(table)
              )}
              onClick={() => openTableModal(table)}
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                  {table.table_number}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  Clique para Abrir
                </div>
              </div>
              <TableActionsDropdown
                table={table}
                onEdit={openEditModal}
                onDelete={openDeleteConfirmation}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- Modais de CRUD de Mesa (Mantidos) --- */}
      <AddTableModal
        isOpen={isAddTableModalOpen}
        onClose={() => setIsAddTableModalOpen(false)}
        onAddTable={handleAddTable}
      />
      <EditTableModal
        isOpen={isEditTableModalOpen}
        onClose={() => setIsEditTableModalOpen(false)}
        onEditTable={handleEditTable}
        table={tableToEdit}
      />
      <Dialog
        open={isDeleteTableModalOpen}
        onOpenChange={setIsDeleteTableModalOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a **Mesa{" "}
              {tableToDelete?.table_number}**? Esta ação é irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteTableModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTable}>
              Excluir Mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Table Order Modal (Layout Otimizado: LARGURA MÁXIMA) --- */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        {/* *** MUDANÇA AQUI: Aumentando a largura máxima para dar espaço aos cards *** */}
        <DialogContent className="max-w-[1500px] w-full h-[93vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-2xl font-bold flex items-center text-blue-700">
              Mesa {selectedTable?.table_number}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-0 lg:overflow-hidden">
            {/* Split View Container: 75% (Menu) e 25% (Pedido/Ações) */}

            <div className="flex flex-col lg:grid lg:grid-cols-[5fr_2fr] h-full">
              {" "}
              {/* 📱 MOBILE FIX */}
              {/* PAINEL ESQUERDO: Menu Principal (75% da largura) */}
              <div className="flex flex-col p-4">
                <h3 className="font-bold text-xl text-gray-900 mb-3">
                  Menu de Produtos
                </h3>

                {/* Carrossel de Categorias (Horizontal Scroll) */}
                <ScrollArea className="flex-shrink-0 h-16 mb-4 whitespace-nowrap">
                  <div className="flex gap-3 pb-2 w-max">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? "default"
                            : "outline"
                        }
                        size="lg"
                        onClick={() => setSelectedCategory(category.id)}
                        className={cn(
                          "flex-shrink-0 font-semibold text-base",
                          selectedCategory === category.id
                            ? "text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-200"
                        )}
                        style={
                          selectedCategory === category.id
                            ? { backgroundColor: "#007BFF" }
                            : {}
                        }
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>

                {/* Lista de Itens do Menu (Grid com Overflow) */}
                <div className="flex-1 overflow-auto max-h-[60vh] lg:max-h-[500px]">
                  {" "}
                  {/* 📱 MOBILE FIX */}
                  <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
                    {filteredMenuItems.map((item) => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-2xl transition-shadow border-2 hover:border-orange-500 transform hover:scale-[1.01] w-full min-h-[140px] h-auto flex flex-col"
                        onClick={() => addItemToOrder(item)}
                      >
                        <CardContent className="p-3 text-center flex flex-col justify-between flex-1">
                          {/* IMAGEM E INFORMAÇÕES */}
                          <div className="flex justify-center items-center mb-2">
                            <img
                              // Use a propriedade 'image' do objeto 'item' que contém a URL do banco de dados
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg bg-gray-100"
                            />
                          </div>

                          <div className="flex-1 flex flex-col justify-center">
                            <div className="font-bold text-md text-gray-900 mb-1">
                              {item.name}
                            </div>
                            <div className="text-xl font-extrabold text-green-600">
                              R$ {item.price.toFixed(2)}
                            </div>
                          </div>

                          {/* BOTÃO ADICIONAR */}
                          <Button
                            size="sm"
                            className="w-full mt-1 font-bold py-1 text-xs"
                            style={{ backgroundColor: "#FD7E14" }}
                          >
                            <Plus className="w-3 h-3 mr-1" /> Adicionar
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              {/* PAINEL DIREITO: Pedido Atual, Resumo e Ações (25% da largura, Fixo) */}
              <div className="flex flex-col bg-gray-100 border-t lg:border-l p-4 h-full w-full lg:w-auto">
                {" "}
                {/* 📱 MOBILE FIX */}
                <h3 className="font-bold text-lg text-gray-900 border-b pb-2 mb-3">
                  Pedido
                </h3>
                {/* CONTAINER COM SCROLL FIXO */}
                <div
                  className="flex-1 overflow-auto mb-4"
                  style={{ maxHeight: "250px" }}
                >
                  <div className="space-y-3 pr-2">
                    {currentOrder.length === 0 ? (
                      <div className="text-center py-16 text-gray-500 border border-dashed rounded-lg bg-white">
                        <Send className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <div className="text-sm">Selecione itens no menu.</div>
                      </div>
                    ) : (
                      currentOrder.map((item) => (
                        <Card
                          key={item.id}
                          className="shadow-md border-l-4 border-l-blue-500"
                        >
                          <CardContent className="p-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 pr-2">
                                <div className="font-extrabold text-sm text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  R$ {(item.price * item.quantity).toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <span className="w-4 text-center text-sm font-bold text-blue-700">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="w-8 h-8 p-0 text-red-500 hover:bg-red-100"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
                {/* Resumo e Botões de Ação (FIXO no rodapé do painel) */}
                <div className="flex-shrink-0 pt-2 border-t bg-gray-100">
                  <Card className="shadow-xl mb-3 bg-blue-600 text-white">
                    <CardContent className="p-3">
                      <div className="text-sm font-semibold uppercase opacity-90">
                        TOTAL
                      </div>
                      <div className="flex justify-between font-extrabold text-3xl mt-0.5">
                        <span>R$</span>
                        <span>{calculateTotal().toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    onClick={sendToKitchen}
                    className="w-full text-white font-bold h-10 text-base shadow-md mb-2"
                    style={{ backgroundColor: "#FD7E14" }}
                    disabled={currentOrder.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    ENVIAR COZINHA
                  </Button>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Button
                      onClick={printBill}
                      variant="outline"
                      className="w-full bg-transparent h-9 border-blue-500 text-blue-500 hover:bg-blue-100 text-xs"
                    >
                      <Printer className="w-3 h-3 mr-1" />
                      Imprimir
                    </Button>
                    <Button
                      onClick={splitBill}
                      variant="outline"
                      className="w-full bg-transparent h-9 border-blue-500 text-blue-500 hover:bg-blue-100 text-xs"
                    >
                      <Split className="w-3 h-3 mr-1" />
                      Dividir
                    </Button>
                  </div>
                  <Button
                    onClick={closeAndPay}
                    className="w-full text-white font-bold h-12 text-base shadow-lg"
                    style={{ backgroundColor: "#28A745" }}
                    disabled={currentOrder.length === 0}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    PAGAR E FECHAR
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
