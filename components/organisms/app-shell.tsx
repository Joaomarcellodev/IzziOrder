"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  Bell,
  BarChart3,
  Calendar,
  Settings,
  Users,
  ChefHat,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  breadcrumb: string;
  hasNewNotifications?: boolean;
}

const navigationItems = [
   { id: "orders", label: "Pedidos", icon: Calendar, href: "/auth/orders" },
  { id: "menu", label: "Cardápio", icon: ChefHat, href: "/auth/menu" },
  { id: "reports", label: "Relatórios", icon: BarChart3, href: "/auth/reports" },
  { id: "settings", label: "Configurações", icon: Settings, href: "/auth/settings" },
];

export function AppShell({
  children,
  currentPage,
  breadcrumb,
  hasNewNotifications = false,
}: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getActiveItem = () => {
    const item = navigationItems.find((item) => item.label === currentPage);
    return item?.id || "orders";
  };

  const activeItem = getActiveItem();

  const handleNavigation = () => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* REMOVIDO: O Overlay preto foi removido.
        Vamos usar o desfoque no conteúdo principal para o efeito de "espelho".
      */}

      {/* Left Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out",
          "lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            <span style={{ color: "#007BFF" }}>izzi</span>
            <span style={{ color: "#FD7E14" }}>Order</span>
          </div>
          {/* Botão de Fechar no Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.id} href={item.href} onClick={handleNavigation}>
                <button
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 relative",
                    isActive
                      ? "text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  style={isActive ? { backgroundColor: "#007BFF" } : {}}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </Link>
            );
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
              <div className="text-sm font-medium text-gray-900">
                Carlos - Manager
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {/* APRIMORADO: Adicionado 'pointer-events-none' quando borrado para 
        desabilitar cliques no conteúdo desfocado, melhorando a UX mobile. 
      */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          // Desfoque em telas pequenas quando o sidebar está aberto
          isSidebarOpen
            ? "filter blur-sm lg:filter-none pointer-events-none"
            : ""
        )}
        // Adicionando um clique aqui para fechar o menu se o usuário tocar no conteúdo desfocado
        onClick={() => {
          if (isSidebarOpen && window.innerWidth < 1024) { // 1024px é o breakpoint 'lg'
            setIsSidebarOpen(false);
          }
        }}
      >
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            {/* Botão Hambúrguer para Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir Menu"
            >
              <Menu className="w-6 h-6 text-gray-900" />
            </Button>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {currentPage}
              </h1>
              <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">{breadcrumb}</div>
            </div>

            <div className="flex items-center gap-4 ml-auto">
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
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}