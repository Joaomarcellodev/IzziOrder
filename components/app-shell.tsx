"use client"

import type React from "react"
import { Bell, BarChart3, Calendar, Settings, Users, ChefHat, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface AppShellProps {
  children: React.ReactNode
  currentPage: string
  breadcrumb: string
  hasNewNotifications?: boolean
}

const navigationItems = [
  { id: "orders", label: "Orders Dashboard", icon: Calendar, href: "/" },
  { id: "menu", label: "Menu Management", icon: ChefHat, href: "/menu" },
  { id: "tables", label: "Table Map", icon: Users, href: "/tables" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
]

export function AppShell({ children, currentPage, breadcrumb, hasNewNotifications = false }: AppShellProps) {
  const getActiveItem = () => {
    const item = navigationItems.find((item) => item.label === currentPage)
    return item?.id || "orders"
  }

  const activeItem = getActiveItem()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-2xl font-bold text-gray-900">
            <span style={{ color: "#007BFF" }}>izzi</span>
            <span style={{ color: "#FD7E14" }}>Order</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <Link key={item.id} href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 relative",
                    isActive ? "text-white shadow-sm" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                  )}
                  style={isActive ? { backgroundColor: "#007BFF" } : {}}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
                      style={{ backgroundColor: "#007BFF" }}
                    />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src="/manager-avatar.png" />
              <AvatarFallback>CM</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">Carlos - Manager</div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentPage}</h1>
              <div className="text-sm text-gray-500 mt-1">{breadcrumb}</div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {hasNewNotifications && (
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: "#FD7E14" }}
                    />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
