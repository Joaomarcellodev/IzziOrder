"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/organisms/select";
import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  X,
  Printer,
  Split,
  CreditCard,
  Send,
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
import { createTable, deleteTable, updateTable } from "@/app/actions/tables";

// Importar o componente Textarea (necessário para o modal de observações)
import { Textarea } from "@/components/atoms/textarea";
import { createOrder, Order, OrderRequestDTO } from "@/app/actions/orders";
// Supondo que você tenha um componente Textarea em '@/components/atoms/textarea'

// --- Interfaces ---
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

interface OrderLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  observation: string;
}

interface TableMapProps {
  tables: Table[];
  menuItems: MenuItem[];
  categories: Category[];
}
// --- Fim Interfaces ---

// --- Componentes Modais de Ação de Mesa ---

const AddTableModal = ({
  isOpen,
  onClose,
  onAddTable,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (newTable: Table) => void;
}) => {
  const [tableNumber, setTableNumber] = useState<string>("");
  const { toast } = useToast();

  const handleSave = async () => {
    const num = parseInt(tableNumber, 10);
    if (isNaN(num) || num <= 0) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de mesa válido.",
        variant: "destructive",
      });
      return;
    }

    const newTableData = await createTable(num);

    if (newTableData && newTableData.data) {
      onAddTable(newTableData.data);
      setTableNumber("");
      onClose();
    } else {
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a mesa.",
        variant: "destructive",
      });
    }
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

    updateTable(table.id, num);
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
  const [tables, setTables] = useState<Table[]>(
    initialTables.sort((a, b) => a.table_number - b.table_number)
  );
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAddTableModalOpen, setIsAddTableModalOpen] = useState(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [tableToEdit, setTableToEdit] = useState<Table | null>(null);
  const [isDeleteTableModalOpen, setIsDeleteTableModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const [currentOrder, setCurrentOrder] = useState<OrderLine[]>([]);
  // FIX: Altera o estado inicial para 'all' (string não vazia)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { toast } = useToast();

  // Estados para o modal de observação (CORRIGIDOS)
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [orderObservations, setOrderObservations] = useState("");

  // FIX: Simplifica a lista de categorias, não precisamos de um item com id=""
  const categories = initialCategories;

  // FIX: Atualiza a lógica de filtro para usar 'all'
  const filteredMenuItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category_id === selectedCategory);

  // --- Funções de CRUD de Mesa (Mantidas) ---
  const handleAddTable = (newTable: Table) => {
    if (tables.some((t) => t.table_number === newTable.table_number)) {
      toast({
        title: "Mesa já existe",
        description: `A mesa ${newTable.table_number} já está no mapa.`,
        variant: "destructive",
      });
      return;
    }
    setTables((prev) =>
      [...prev, newTable].sort((a, b) => a.table_number - b.table_number)
    );
    toast({
      title: "Mesa Adicionada",
      description: `Mesa ${newTable.table_number} adicionada com sucesso.`,
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
    deleteTable(tableToDelete.id);
    setTables((prev) => prev.filter((t) => t.id !== tableToDelete.id));
    toast({
      title: "Mesa Excluída",
      description: `Mesa ${tableToDelete.table_number} foi removida com sucesso.`,
    });
    setIsDeleteTableModalOpen(false);
    setTableToDelete(null);
  };

  // --- Funções de Pedido (Alteradas para incluir Observações) ---

  const openTableModal = (table: Table) => {
    setSelectedTable(table);
    setCurrentOrder([]);
    setOrderObservations(""); // Resetar observações
    setIsOrderModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTable(null);
    setIsOrderModalOpen(false);
    setCurrentOrder([]);
    // FIX: Altera o reset para 'all'
    setSelectedCategory("all");
    setOrderObservations(""); // Garantir reset
  };

  const addItemToOrder = (menuItem: MenuItem) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prev.map((item) =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          menuItemId: menuItem.id,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
          observation: "implementar"
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCurrentOrder((prev) =>
      prev
        .map((item) =>
          item.menuItemId === itemId
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCurrentOrder((prev) => prev.filter((item) => item.menuItemId !== itemId));
  };

  const calculateTotal = () => {
    return currentOrder.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // FUNÇÃO ALTERADA: Abre o modal de observações
  const sendToKitchen = () => {
    if (currentOrder.length === 0) {
      toast({
        title: "Pedido Vazio",
        description: "Adicione itens ao pedido antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    setIsObservationModalOpen(true);
  };

  // FUNÇÃO NOVA: Confirma o envio após as observações
  const confirmSendToKitchen = async () => {
    const observation = orderObservations.trim();
    const total = calculateTotal();
    const order: OrderRequestDTO = {
      total: total,
      type: "LOCAL",
      orderLines: currentOrder,
      tableNumber: selectedTable!.table_number,
    }

    // Envio para a cozinha
    const { success, error } = await createOrder(order);
    if (success) {
      toast({
        title: "Encomenda enviada para cozinha 👩‍🍳",
        description: `Mesa ${selectedTable?.table_number} enviou o pedido para a cozinha. ${observation ? 'Obs: ' + observation.substring(0, 50) + '...' : ''}`,
      });
    } else {
      toast({
        title: "❌ Erro ao enviar pedido:",
        description: error
      });
    }

    setIsObservationModalOpen(false);
    setIsOrderModalOpen(false);
    setCurrentOrder([]);
    setOrderObservations(""); // Limpa o campo após envio
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
    // Lógica simples: verifica se há itens no pedido para o estilo de "mesa ocupada"
    const isOccupied = false;
    return isOccupied
      ? "border-red-500 bg-red-50 cursor-pointer hover:shadow-lg shadow-md"
      : "border-blue-500 bg-blue-50 cursor-pointer hover:shadow-lg shadow-md";
  };

  return (
    <div className="p-6">
      {/* Container de Mesas */}
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
                "relative p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 aspect-square flex items-center justify-center",
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

      {/* --- Modais de CRUD de Mesa --- */}
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

      {/* --- Table Order Modal --- */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-[1400px] w-[95%] h-[90vh] flex flex-col">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-2xl font-bold text-blue-700">Mesa {selectedTable?.table_number}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
            <div className="flex-shrink-0">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full max-w-xs font-semibold text-base h-11">
                  <SelectValue placeholder="Todas as Categorias" />
                </SelectTrigger>
                <SelectContent>
                  {/* FIX: Altera o value de "" para "all" */}
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories
                    // Não é mais necessário o filter, pois a lista só tem categorias válidas
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-shrink-0">
              <h3 className="font-bold text-xl text-gray-900 mb-3">Menu de Produtos</h3>
              <div className="relative">
                <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory">
                  {filteredMenuItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-xl transition-all border-2 hover:border-orange-500 transform hover:scale-105 flex-shrink-0 w-[200px] snap-start"
                      onClick={() => addItemToOrder(item)}
                    >
                      <CardContent className="p-4 text-center flex flex-col h-full">
                        <div className="flex justify-center items-center mb-3">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-center mb-3">
                          <div className="font-bold text-base text-gray-900 mb-2">{item.name}</div>
                          <div className="text-xl font-extrabold text-green-600">R$ {item.price.toFixed(2)}</div>
                        </div>

                        <Button size="sm" className="w-full font-bold" style={{ backgroundColor: "#FD7E14" }}>
                          <Plus className="w-4 h-4 mr-1" /> Adicionar
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Pedido Atual</h3>

              <div className="mb-4 max-h-[200px] overflow-auto">
                {currentOrder.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border border-dashed rounded-lg bg-white">
                    <Send className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm">Selecione itens no menu acima.</div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {currentOrder.map((item) => (
                      <Card key={item.menuItemId} className="shadow-md border-l-4 border-l-blue-500">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-bold text-base text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-600">R$ {item.price.toFixed(2)} cada</div>
                              <div className="text-sm font-semibold text-blue-600">
                                Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.menuItemId, -1)}
                                className="w-8 h-8"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-10 text-center text-lg font-bold text-blue-700">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.menuItemId, 1)}
                                className="w-8 h-8"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.menuItemId)}
                                className="w-8 h-8 text-red-500 hover:bg-red-100 ml-2"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Card className="shadow-xl bg-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="text-sm font-semibold uppercase opacity-90">TOTAL DO PEDIDO</div>
                    <div className="flex justify-between items-center font-extrabold text-3xl mt-1">
                      <span>R$</span>
                      <span>{calculateTotal().toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={sendToKitchen}
                    className="text-white font-bold h-12 col-span-2"
                    style={{ backgroundColor: "#FD7E14" }}
                    disabled={currentOrder.length === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para Cozinha
                  </Button>
                  <Button
                    onClick={printBill}
                    variant="outline"
                    className="h-11 border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-semibold bg-transparent"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    onClick={splitBill}
                    variant="outline"
                    className="h-11 border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold bg-transparent"
                  >
                    <Split className="w-4 h-4 mr-2" />
                    Dividir
                  </Button>
                  <Button
                    onClick={closeAndPay}
                    className="text-white font-bold h-12 col-span-2"
                    style={{ backgroundColor: "#28A745" }}
                    disabled={currentOrder.length === 0}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Encerrar e Pagar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Modal de Observações do Pedido (CORRIGIDO) --- */}
      <Dialog open={isObservationModalOpen} onOpenChange={setIsObservationModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Observações do Pedido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="modal-observations" className="text-sm font-semibold text-gray-700 mb-2 block">
              Há alguma observação para este pedido?
            </Label>
            <Textarea
              id="modal-observations"
              placeholder="Ex: Sem cebola, ponto da carne mal passado, sem gelo..."
              value={orderObservations}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOrderObservations(e.target.value)}
              className="w-full h-32 resize-none"
            />
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-3">
            <Button variant="outline" onClick={() => setIsObservationModalOpen(false)} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button
              onClick={confirmSendToKitchen}
              className="flex-1 sm:flex-none text-white font-bold"
              style={{ backgroundColor: "#FD7E14" }}
            >
              <Send className="w-4 h-4 mr-2" />
              Confirmar Envio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
