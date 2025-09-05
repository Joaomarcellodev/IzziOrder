"use client"

import { useState } from "react"
import { GripVertical, Edit, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
}

const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "izziBurger Duplo",
    description: "Double beef patty with cheese, lettuce, tomato and special sauce",
    price: 42.5,
    category: "Burgers",
    image: "/classic-beef-burger.png",
    available: true,
  },
  {
    id: "2",
    name: "Pizza Margherita",
    description: "Classic pizza with tomato sauce, mozzarella and fresh basil",
    price: 38.0,
    category: "Pizzas",
    image: "/delicious-pizza.png",
    available: true,
  },
  {
    id: "3",
    name: "Salada Caesar",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
    price: 28.0,
    category: "Salads",
    image: "/vibrant-mixed-salad.png",
    available: false,
  },
]

const categories = ["Burgers", "Pizzas", "Salads", "Drinks", "Desserts"]

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const filteredItems =
    selectedCategory === "All" ? menuItems : menuItems.filter((item) => item.category === selectedCategory)

  const toggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newAvailability = !item.available
          toast({
            title: `${item.name} ${newAvailability ? "now available" : "now unavailable"}`,
            duration: 3000,
          })
          return { ...item, available: newAvailability }
        }
        return item
      }),
    )
  }

  const openEditModal = (item: MenuItem) => {
    setEditingItem({ ...item })
    setIsModalOpen(true)
  }

  const closeEditModal = () => {
    setEditingItem(null)
    setIsModalOpen(false)
  }

  const saveItem = () => {
    if (!editingItem) return

    setMenuItems((prev) => prev.map((item) => (item.id === editingItem.id ? editingItem : item)))

    toast({
      title: "Item updated successfully",
      duration: 3000,
    })

    closeEditModal()
  }

  const addNewItem = () => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: "",
      description: "",
      price: 0,
      category: categories[0],
      image: "/diverse-food-spread.png",
      available: true,
    }
    setEditingItem(newItem)
    setIsModalOpen(true)
  }

  return (
    <div className="p-6">
      {/* Header with Category Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={addNewItem} className="text-white font-semibold" style={{ backgroundColor: "#FD7E14" }}>
          + Add New Item
        </Button>
      </div>

      {/* Menu Items List */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">👨‍🍳</div>
              <div className="text-lg text-gray-600">This category is empty.</div>
              <Button onClick={addNewItem} className="text-white font-semibold" style={{ backgroundColor: "#FD7E14" }}>
                + Add first item
              </Button>
            </div>
          </Card>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Item Image */}
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />

                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                    <div className="text-lg font-semibold text-gray-900 mt-2">R$ {item.price.toFixed(2)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    {/* Availability Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => toggleAvailability(item.id)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <span className={cn("text-sm font-medium", item.available ? "text-blue-600" : "text-gray-400")}>
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(item)}
                      className="hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem?.name ? `Editing: ${editingItem.name}` : "Add New Item"}</DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6 py-4">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                  placeholder="Enter item name"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  placeholder="Enter item description"
                  rows={3}
                />
              </div>

              {/* Price and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem((prev) =>
                        prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : null,
                      )
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem((prev) => (prev ? { ...prev, category: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Drag and drop an image here, or click to select</div>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button onClick={saveItem} className="text-white font-semibold" style={{ backgroundColor: "#FD7E14" }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
