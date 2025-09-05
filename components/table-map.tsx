"use client"

import { useState } from "react"
import { Plus, Minus, X, Printer, Split, CreditCard, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface Table {
  id: number
  status: "free" | "occupied" | "closing"
  partySize?: number
  tabId?: string
  total?: number
  items?: Array<{ name: string; quantity: number; price: number }>
}

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

const mockTables: Table[] = [
  { id: 1, status: "free" },
  {
    id: 2,
    status: "occupied",
    partySize: 4,
    tabId: "#T002",
    total: 125.5,
    items: [
      { name: "izziBurger Duplo", quantity: 2, price: 42.5 },
      { name: "Pizza Margherita", quantity: 1, price: 38.0 },
    ],
  },
  { id: 3, status: "free" },
  {
    id: 4,
    status: "closing",
    partySize: 2,
    tabId: "#T004",
    total: 67.0,
    items: [{ name: "Salada Caesar", quantity: 2, price: 28.0 }],
  },
  { id: 5, status: "free" },
  {
    id: 6,
    status: "occupied",
    partySize: 3,
    tabId: "#T006",
    total: 89.5,
    items: [{ name: "izziBurger Duplo", quantity: 1, price: 42.5 }],
  },
  { id: 7, status: "free" },
  { id: 8, status: "free" },
]

const mockMenuItems: MenuItem[] = [
  { id: "1", name: "izziBurger Duplo", price: 42.5, category: "Burgers" },
  { id: "2", name: "Pizza Margherita", price: 38.0, category: "Pizzas" },
  { id: "3", name: "Salada Caesar", price: 28.0, category: "Salads" },
  { id: "4", name: "Batata Frita", price: 15.0, category: "Sides" },
  { id: "5", name: "Coca-Cola", price: 8.0, category: "Drinks" },
  { id: "6", name: "Água", price: 5.0, category: "Drinks" },
]

export function TableMap() {
  const [tables, setTables] = useState<Table[]>(mockTables)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const { toast } = useToast()

  const categories = ["All", "Burgers", "Pizzas", "Salads", "Sides", "Drinks"]

  const filteredMenuItems =
    selectedCategory === "All" ? mockMenuItems : mockMenuItems.filter((item) => item.category === selectedCategory)

  const openTableModal = (table: Table) => {
    setSelectedTable(table)
    if (table.status === "occupied" && table.items) {
      setCurrentOrder(
        table.items.map((item, index) => ({
          id: `${table.id}-${index}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      )
    } else {
      setCurrentOrder([])
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedTable(null)
    setIsModalOpen(false)
    setCurrentOrder([])
  }

  const addItemToOrder = (menuItem: MenuItem) => {
    setCurrentOrder((prev) => {
      const existingItem = prev.find((item) => item.name === menuItem.name)
      if (existingItem) {
        return prev.map((item) => (item.name === menuItem.name ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }]
    })
  }

  const updateQuantity = (itemId: string, change: number) => {
    setCurrentOrder((prev) =>
      prev
        .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (itemId: string) => {
    setCurrentOrder((prev) => prev.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const sendToKitchen = () => {
    toast({
      title: "Order sent to kitchen",
      description: `Table ${selectedTable?.id} order has been sent to the kitchen.`,
    })
  }

  const printBill = () => {
    toast({
      title: "Bill printed",
      description: `Bill for Table ${selectedTable?.id} has been sent to printer.`,
    })
  }

  const splitBill = () => {
    toast({
      title: "Bill split",
      description: `Bill for Table ${selectedTable?.id} has been split.`,
    })
  }

  const closeAndPay = () => {
    if (selectedTable) {
      setTables((prev) =>
        prev.map((table) => (table.id === selectedTable.id ? { ...table, status: "free" as const } : table)),
      )
      toast({
        title: "Payment completed",
        description: `Table ${selectedTable.id} has been closed and payment processed.`,
      })
      closeModal()
    }
  }

  const getTableStyle = (table: Table) => {
    switch (table.status) {
      case "free":
        return "border-green-500 bg-green-50 hover:border-green-600 hover:shadow-lg cursor-pointer"
      case "occupied":
        return "border-blue-500 bg-blue-50 cursor-pointer hover:shadow-lg"
      case "closing":
        return "border-orange-500 bg-orange-50 cursor-pointer hover:shadow-lg animate-pulse"
      default:
        return ""
    }
  }

  const getTooltipText = (table: Table) => {
    switch (table.status) {
      case "free":
        return "Click to open new tab"
      case "occupied":
        return `Party: ${table.partySize} | Tab: ${table.tabId} | Total: R$ ${table.total?.toFixed(2)}`
      case "closing":
        return "Awaiting payment"
      default:
        return ""
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Restaurant Floor Plan</h2>

        {/* Tables Grid */}
        <div className="grid grid-cols-4 gap-6 max-w-4xl">
          {tables.map((table) => (
            <div
              key={table.id}
              className={cn("relative p-4 rounded-lg border-2 transition-all duration-200", getTableStyle(table))}
              onClick={() => openTableModal(table)}
              title={getTooltipText(table)}
            >
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">Table {table.id}</div>

                {table.status === "occupied" && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-600">Party: {table.partySize}</div>
                    <div className="text-sm font-medium text-blue-600">{table.tabId}</div>
                    <div className="text-sm font-semibold">R$ {table.total?.toFixed(2)}</div>
                  </div>
                )}

                {table.status === "closing" && (
                  <div className="mt-2 space-y-1">
                    <div className="text-sm text-gray-600">Party: {table.partySize}</div>
                    <div className="text-sm font-medium text-orange-600">{table.tabId}</div>
                    <div className="text-sm font-semibold">R$ {table.total?.toFixed(2)}</div>
                    <div className="text-xs text-orange-600 font-medium">Awaiting Payment</div>
                  </div>
                )}

                {table.status === "free" && <div className="mt-2 text-sm text-green-600 font-medium">Available</div>}
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
              Table {selectedTable?.id} -{" "}
              {selectedTable?.status === "free" ? "New Order" : `Tab ${selectedTable?.tabId}`}
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
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={selectedCategory === category ? "text-white" : ""}
                      style={selectedCategory === category ? { backgroundColor: "#007BFF" } : {}}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {filteredMenuItems.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm" onClick={() => addItemToOrder(item)}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                          <div className="text-sm font-semibold">R$ {item.price.toFixed(2)}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Center Column - Current Order */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Current Order</h3>
              <ScrollArea className="h-[50vh]">
                <div className="space-y-2">
                  {currentOrder.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-sm">No items in order</div>
                    </div>
                  ) : (
                    currentOrder.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500">R$ {item.price.toFixed(2)} each</div>
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
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
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
              <h3 className="font-semibold text-gray-900">Order Summary</h3>

              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    {currentOrder.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
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
                  Send new items to kitchen
                </Button>

                <Button
                  onClick={printBill}
                  variant="outline"
                  className="w-full bg-transparent"
                  style={{ borderColor: "#007BFF", color: "#007BFF" }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print bill
                </Button>

                <Button
                  onClick={splitBill}
                  variant="outline"
                  className="w-full bg-transparent"
                  style={{ borderColor: "#007BFF", color: "#007BFF" }}
                >
                  <Split className="w-4 h-4 mr-2" />
                  Split bill
                </Button>

                <Button
                  onClick={closeAndPay}
                  className="w-full text-white font-semibold"
                  style={{ backgroundColor: "#28A745" }}
                  disabled={currentOrder.length === 0}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Close & Pay
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
