"use client";

import { useState } from "react";
import { Plus, Minus, X, Printer, Split, CreditCard, Send } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/molecules/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/dialog";
import { ScrollArea } from "@/components/molecules/scroll-area";
import { Separator } from "@/components/atoms/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Order {
  text: string
}

interface Table {
  establishment_id: string;
  id: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const mockMenuItems: MenuItem[] = [
  { id: "1", name: "izziBurger Duplo", price: 42.5, category: "Hambúrgueres" },
  { id: "2", name: "Pizza Margherita", price: 38.0, category: "Pizzas" },
  { id: "3", name: "Salada Caesar", price: 28.0, category: "Saladas" },
  { id: "4", name: "Batata Frita", price: 15.0, category: "Petiscos" },
  { id: "5", name: "Coca-Cola", price: 8.0, category: "Bebidas" },
  { id: "6", name: "Água", price: 5.0, category: "Bebidas" },
];

interface TableMapProps {
  tables: Table[];
}

export function TableMap({ tables: initialTables }: TableMapProps) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { toast } = useToast();

  const categories = ["Todos", "Hambúrgueres", "Pizzas", "Saladas", "Petiscos", "Bebidas"];

  const filteredMenuItems =
    selectedCategory === "Todos"
      ? mockMenuItems
      : mockMenuItems.filter((item) => item.category === selectedCategory);

  const openTableModal = (table: Table) => {
    setSelectedTable(table);
    setCurrentOrder([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTable(null);
    setIsModalOpen(false);
    setCurrentOrder([]);
  };

  const addItemToOrder = (menuItem: MenuItem) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.name === menuItem.name);
      if (existingItem) {
        return prev.map((item) =>
          item.name === menuItem.name
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
      title: "Encomenda enviada para cozinha",
      description: `Mesa ${selectedTable?.id} enviou o pedido para a cozinha.`,
    });
  };

  const printBill = () => {
    toast({
      title: "Conta impressa",
      description: `A conta da mesa ${selectedTable?.id} foi impressa.`,
    });
  };

  const splitBill = () => {
    toast({
      title: "Conta Dividida",
      description: `A conta da mesa ${selectedTable?.id} foi dividida.`,
    });
  };

  const closeAndPay = () => {
    if (selectedTable) {
      setTables((prev) =>
        prev.map((table) =>
          table.id === selectedTable.id
            ? { ...table, status: "aberto" as const }
            : table
        )
      );
      toast({
        title: "Pagamento concluído",
        description: `Mesa ${selectedTable.id} foi fechado e o pagamento processado.`,
      });
      closeModal();
    }
  };

  const getTableStyle = (table: Table) => {
    return "border-blue-500 bg-blue-50 cursor-pointer hover:shadow-lg";
  };

  const getTooltipText = (table: Table) => {
    return "Clique para abrir uma nova aba";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Planta das mesas do estabelecimento
        </h2>

        {/* Tables Grid */}
        <div className="grid grid-cols-4 gap-6 max-w-4xl">
          {tables.map((table) => (
            <div
              key={table.id}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all duration-200",
                getTableStyle(table)
              )}
              onClick={() => openTableModal(table)}
              title={getTooltipText(table)}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  Table {table.id}
                </div>


              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Order Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Table {selectedTable?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-6 h-[70vh]">
            {/* Left Column - Menu */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Menu</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category ? "text-white" : ""
                      }
                      style={
                        selectedCategory === category
                          ? { backgroundColor: "#007BFF" }
                          : {}
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => (
                    <Card
                      key={item.id}
                      className="cursor-pointer hover:shadow-sm"
                      onClick={() => addItemToOrder(item)}
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.category}
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            R$ {item.price.toFixed(2)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Center Column - Current Order */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Pedido Atual</h3>
              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {currentOrder.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-sm">Nenhum item em ordem</div>
                    </div>
                  ) : (
                    currentOrder.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {item.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                R$ {item.price.toFixed(2)} each
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right Column - Totals & Actions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Resumo do pedido</h3>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    {currentOrder.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between text-sm"
                      >
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>R$ {calculateTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button
                  onClick={sendToKitchen}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: "#FD7E14" }}
                  disabled={currentOrder.length === 0}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar
                </Button>

                <Button
                  onClick={printBill}
                  variant="outline"
                  className="w-full bg-transparent"
                  style={{ borderColor: "#007BFF", color: "#007BFF" }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Imprimir nota
                </Button>

                <Button
                  onClick={splitBill}
                  variant="outline"
                  className="w-full bg-transparent"
                  style={{ borderColor: "#007BFF", color: "#007BFF" }}
                >
                  <Split className="w-4 h-4 mr-2" />
                  Dividir conta
                </Button>

                <Button
                  onClick={closeAndPay}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: "#28A745" }}
                  disabled={currentOrder.length === 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pagar
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
