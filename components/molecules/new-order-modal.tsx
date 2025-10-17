// components/molecules/new-order-modal.tsx

import { Button } from "@/components/atoms/button";
import { Clock, MapPin, Truck, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Defina um tipo simples para os itens do menu (simulação)
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

// Cardápio de Exemplo
const MENU: MenuItem[] = [
  { id: "1", name: "Hambúrguer Clássico", price: 25.90, category: "Lanches" },
  { id: "2", name: "Batata Frita Média", price: 12.00, category: "Acompanhamentos" },
  { id: "3", name: "Refrigerante Lata", price: 6.50, category: "Bebidas" },
  { id: "4", name: "Milk-shake de Chocolate", price: 18.00, category: "Bebidas" },
  { id: "5", name: "Sanduíche Vegetariano", price: 22.50, category: "Lanches" },
  { id: "6", name: "Porção de Camarão", price: 55.00, category: "Acompanhamentos" },
];

// Defina a estrutura de um item de linha de pedido temporário
interface OrderLineTemp {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

// ⚠️ CORREÇÃO DA INTERFACE: tableNumber deve ser number | undefined.
interface NewOrderData {
  customerName: string;
  total: number;
  type: 'DELIVERY' | 'LOCAL';
  estimated_time: number;
  tableNumber?: number; // Tipo corrigido para number
  status: 'OPEN' | 'CLOSED';
  order_lines: OrderLineTemp[];
  date: string;
  observation: string;
}

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Função para adicionar o pedido (recebida do OrdersDashboard)
  onAddOrder: (order: NewOrderData) => void;
}

export function NewOrderModal({ isOpen, onClose, onAddOrder }: NewOrderModalProps) {
  const [currentOrder, setCurrentOrder] = useState<OrderLineTemp[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<'DELIVERY' | 'LOCAL'>('LOCAL');
  // Mantemos como string, pois é o que o input retorna
  const [tableNumber, setTableNumber] = useState(""); 
  const [observation, setObservation] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Lanches"); // Categoria inicial

  if (!isOpen) return null;

  // Agrupa o menu por categoria
  const groupedMenu = MENU.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const categories = Object.keys(groupedMenu);

  const total = currentOrder.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Adiciona/Incrementa um item no pedido
  const addItemToOrder = (item: MenuItem) => {
    setCurrentOrder(prev => {
      const existing = prev.find(line => line.id === item.id);
      if (existing) {
        return prev.map(line =>
          line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  // Remove/Decrementa um item do pedido
  const updateItemQuantity = (itemId: string, delta: number) => {
    setCurrentOrder(prev => {
      const updated = prev.map(line =>
        line.id === itemId ? { ...line, quantity: line.quantity + delta } : line
      ).filter(line => line.quantity > 0);

      return updated;
    });
  };

  // ⚠️ FUNÇÃO CORRIGIDA: Conversão de tableNumber para number
  const handleSubmit = () => {
    if (currentOrder.length === 0) {
      alert("Adicione pelo menos um item ao pedido.");
      return;
    }
    if (!customerName.trim()) {
      alert("O nome do cliente é obrigatório.");
      return;
    }

    let finalTableNumber: number | undefined = undefined;

    if (orderType === 'LOCAL') {
      if (!tableNumber.trim()) {
          alert("O número da mesa é obrigatório para pedidos LOCAIS.");
          return;
      }
      // Conversão da string para number
      const parsedNumber = Number(tableNumber.trim());
      
      if (isNaN(parsedNumber)) {
          alert("O número da mesa deve ser um número válido.");
          return;
      }
      finalTableNumber = parsedNumber;
    }

    const newOrder: NewOrderData = {
      customerName: customerName.trim(),
      total: total,
      type: orderType,
      estimated_time: Math.floor(Math.random() * 15) + 5, // Tempo simulado entre 5 e 20 min
      
      // Usando o valor number | undefined corrigido
      tableNumber: finalTableNumber, 
      
      status: 'OPEN' as const,
      order_lines: currentOrder,
      date: new Date().toISOString(), // Data atual
      observation: observation,
    };

    onAddOrder(newOrder);
    
    // Limpa o estado após adicionar o pedido
    setCurrentOrder([]);
    setCustomerName("");
    setTableNumber("");
    setObservation("");
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-orange-600">Novo Pedido - Cardápio</h2>
          <Button variant="ghost" size="icon" onClick={onClose} title="Fechar">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Conteúdo Principal (Menu e Resumo) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 p-4 gap-4">
          {/* Coluna 1: Cardápio (Scrollable) */}
          <div className="lg:col-span-2 space-y-4 pr-4 border-r lg:h-full lg:overflow-y-auto">
            {/* Filtros de Categoria */}
            <div className="flex gap-2 overflow-x-auto pb-2 sticky top-0 bg-white pt-1 z-10">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? "default" : "outline"}
                  className={cn(
                    "whitespace-nowrap",
                    categoryFilter === category ? "bg-orange-500 hover:bg-orange-600 text-white" : "border-gray-300 text-gray-700"
                  )}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Itens do Menu */}
            <div className="space-y-3">
              {groupedMenu[categoryFilter]?.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">R$ {item.price.toFixed(2)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold"
                    onClick={() => addItemToOrder(item)}
                  >
                    Adicionar
                  </Button>
                </div>
              ))}
              {groupedMenu[categoryFilter]?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nenhum item nesta categoria.
                </div>
              )}
            </div>
          </div>

          {/* Coluna 2: Resumo do Pedido e Dados */}
          <div className="lg:col-span-1 space-y-4 lg:h-full lg:overflow-y-auto">
            <h3 className="text-lg font-semibold border-b pb-2">Resumo do Pedido ({currentOrder.length} itens)</h3>
            
            {/* Lista de Itens do Pedido */}
            <div className="space-y-3">
              {currentOrder.length > 0 ? (
                currentOrder.map(line => (
                  <div key={line.id} className="flex justify-between items-center bg-white p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{line.name}</p>
                      <p className="text-xs text-gray-500">R$ {(line.price * line.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 p-0"
                        onClick={() => updateItemQuantity(line.id, -1)}
                      >
                        -
                      </Button>
                      <span className="font-semibold">{line.quantity}</span>
                      <Button
                        size="icon"
                        className="h-6 w-6 p-0 bg-orange-500 hover:bg-orange-600"
                        onClick={() => updateItemQuantity(line.id, 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">Adicione itens do menu para começar.</p>
              )}
            </div>

            <div className="pt-2 border-t space-y-3">
              <h3 className="text-lg font-semibold">Detalhes do Cliente</h3>

              {/* Nome do Cliente */}
              <input
                type="text"
                placeholder="Nome do Cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
              
              {/* Observação */}
              <textarea
                placeholder="Observação (Ex: Sem cebola, ponto da carne)"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={2}
                className="w-full p-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 resize-none"
              />

              {/* Tipo de Pedido */}
              <div className="flex gap-2">
                <Button
                  className={cn("flex-1", orderType === 'LOCAL' ? "bg-green-500 hover:bg-green-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300")}
                  onClick={() => setOrderType('LOCAL')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Local
                </Button>
                <Button
                  className={cn("flex-1", orderType === 'DELIVERY' ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300")}
                  onClick={() => setOrderType('DELIVERY')}
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Delivery
                </Button>
              </div>

              {/* Número da Mesa (Apenas Local) */}
              {orderType === 'LOCAL' && (
                <input
                  type="text"
                  placeholder="Número da Mesa"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value.replace(/\D/g, ''))} // Permite apenas números (string)
                  className="w-full p-2 border rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              )}

              {/* Total e Botão Finalizar */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-orange-600">R$ {total.toFixed(2)}</span>
                </div>
                <Button
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold disabled:bg-gray-400"
                  onClick={handleSubmit}
                  // A validação de tableNumber está agora em handleSubmit, mas vamos manter a validação visual
                  disabled={currentOrder.length === 0 || !customerName.trim() || (orderType === 'LOCAL' && !tableNumber.trim())}
                >
                  Finalizar Pedido
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}