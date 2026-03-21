"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Settings,
  ChefHat,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { User } from "@/lib/entities/user";

interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  breadcrumb: string;
  hasNewNotifications?: boolean;
  user: { name: string, email: string }
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
  user
}: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleNavigation = () => {
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const router = useRouter();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Menu */}
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

        {/* Perfil + Logout lado a lado */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between gap-3">
            {/* Avatar + Nome */}
            <div
              className="flex items-center gap-3 p-2 rounded-lg transition flex-1"

            >
              <Avatar className="w-10 h-10">
                <AvatarImage src="/manager-avatar.png" />
                <AvatarFallback>CM</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>

            {/* Botão Logout */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-red-600 transition"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          isSidebarOpen
            ? "filter blur-sm lg:filter-none pointer-events-none"
            : ""
        )}
        onClick={() => {
          if (isSidebarOpen && window.innerWidth < 1024) {
            setIsSidebarOpen(false);
          }
        }}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
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
              <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                {breadcrumb}
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Modal de Logout */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Deseja realmente sair do sistema?
            </h2>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className=" bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  router.push("/login");
                  setIsLogoutModalOpen(false);
                }}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
