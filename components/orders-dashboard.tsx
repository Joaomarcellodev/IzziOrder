"use client"

import { cn } from "@/lib/utils"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, Eye, Truck } from "lucide-react"

interface Order {
  id: string
  customerName: string
  items: Array<{ name: string; quantity: number; notes?: string }>
  total: number
  source: "ifood" | "delivery" | "table"
  waitingTime: number
  type: "delivery" | "table"
  tableNumber?: number
  status: "new" | "confirmed" | "preparing" | "ready"
}

const mockOrders: Order[] = [
  {
    id: "#1235",
    customerName: "Ana B.",
    items: [
      { name: "izziBurger Duplo", quantity: 2, notes: "no onions" },
      { name: "Batata Frita", quantity: 1 },
    ],
    total: 85.5,
    source: "ifood",
    waitingTime: 8,
    type: "delivery",
    status: "new",
  },
  {
    id: "#1236",
    customerName: "João S.",
    items: [
      { name: "Pizza Margherita", quantity: 1 },
      { name: "Coca-Cola", quantity: 2 },
    ],
    total: 45.0,
    source: "table",
    waitingTime: 12,
    type: "table",
    tableNumber: 5,
    status: "new",
  },
  {
    id: "#1234",
    customerName: "Maria L.",
    items: [{ name: "Salada Caesar", quantity: 1 }],
    total: 28.0,
    source: "delivery",
    waitingTime: 5,
    type: "delivery",
    status: "confirmed",
  },
]

const columns = [
  { id: "new", title: "NEW ORDERS", status: "new" as const },
  { id: "confirmed", title: "CONFIRMED", status: "confirmed" as const },
  { id: "preparing", title: "PREPARING", status: "preparing" as const },
  { id: "ready", title: "READY", status: "ready" as const },
]

export function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [draggedOrder, setDraggedOrder] = useState<string | null>(null)

  const getOrdersByStatus = (status: Order["status"]) => {
    return orders.filter((order) => order.status === status)
  }

  const confirmOrder = (orderId: string) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: "confirmed" } : order)))
  }

  const getSourceIcon = (source: Order["source"]) => {
    switch (source) {
      case "ifood":
        return (
          <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">
            iF
          </div>
        )
      case "delivery":
        return <Truck className="w-5 h-5 text-blue-600" />
      case "table":
        return <MapPin className="w-5 h-5 text-green-600" />
    }
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status)
          const hasNewOrders = column.status === "new" && columnOrders.length > 0

          return (
            <div key={column.id} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <div
                  className={cn(
                    "flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium",
                    hasNewOrders ? "text-white animate-pulse" : "bg-gray-200 text-gray-600",
                  )}
                  style={hasNewOrders ? { backgroundColor: "#FD7E14" } : {}}
                >
                  {columnOrders.length}
                </div>
              </div>

              {/* Order Cards */}
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                    draggable
                    onDragStart={() => setDraggedOrder(order.id)}
                    onDragEnd={() => setDraggedOrder(null)}
                    style={{ opacity: draggedOrder === order.id ? 0.8 : 1 }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{order.id}</span>
                          <span className="text-gray-600">- {order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSourceIcon(order.source)}
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-4 h-4" />
                            <span className={cn(order.waitingTime > 10 ? "text-red-600" : "text-gray-500")}>
                              {order.waitingTime}min
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Items */}
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            {item.notes && <Eye className="w-4 h-4 text-gray-400" title={item.notes} />}
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="font-semibold text-lg">R$ {order.total.toFixed(2)}</div>
                        <div className="flex items-center gap-1">
                          {order.type === "delivery" ? (
                            <Truck className="w-4 h-4 text-blue-600" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-600">#{order.tableNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button for New Orders */}
                      {order.status === "new" && (
                        <Button
                          className="w-full font-semibold text-white"
                          style={{ backgroundColor: "#FD7E14" }}
                          onClick={() => confirmOrder(order.id)}
                        >
                          Confirm Order
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {columnOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-sm">No orders</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
