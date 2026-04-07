"use client";

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
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { logout } from "@/app/actions/auth-actions";

interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  breadcrumb: string;
  user: { name: string; email: string };
}

const navigationItems = [
  { id: "orders", label: "Pedidos", icon: Calendar, href: "/auth/orders" },
  { id: "menu", label: "Cardápio", icon: ChefHat, href: "/auth/menu" },
  { id: "reports", label: "Relatórios", icon: BarChart3, href: "/auth/reports" },
  { id: "settings", label: "Configurações", icon: Settings, href: "/auth/services" },
];

export function AppShell({
  children,
  currentPage,
  breadcrumb,
  user,
}: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50/50">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg lg:shadow-none",
          "lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10   flex items-center justify-center overflow-hidden ">
              <img
                className="w-full h-full object-cover"
                src="/android-chrome-512x512.png"
                alt="IzziOrder Logo"
              />
            </div>
            <div className="text-xl font-bold tracking-tight text-gray-900">
              <span className="text-blue-600">izzi</span>
              <span className="text-orange-500">Order</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-gray-100 rounded-full"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-200 group-hover:scale-110",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-blue-600"
                    )}
                  />
                  <span className="font-semibold text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 bg-gray-50/80 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Avatar className="w-10 h-10 border-2 border-blue-50">
              <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] font-medium text-gray-400 truncate tracking-tight lowercase">
                {user.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              onClick={() => setIsLogoutModalOpen(true)}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-gray-600"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {currentPage}
              </h1>
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
                Home <span className="text-gray-300">/</span> {breadcrumb}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3"></div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/30">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setIsLogoutModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Sair do Sistema
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Você precisará fazer login novamente para acessar seus pedidos e
                cardápio.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
                  onClick={() => setIsLogoutModalOpen(false)}
                >
                  Cancelar
                </Button>
                <form action={logout} className="flex-1">
                  <Button className="w-full h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200 transition-all">
                    Sair Agora
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}