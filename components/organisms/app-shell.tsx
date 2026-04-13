"use client";

import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { BarChart3, Calendar, Settings, ChefHat, Menu, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";
import { NavItem } from "../atoms/nav-item";
import { UserProfileCard } from "../atoms/user-profile-card";
import { LogoutModal } from "../molecules/logout-modal";

interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  breadcrumb: string;
  user: { 
    name: string; 
    email: string; 
  };
}

const navigationItems = [
  { id: "orders", label: "Pedidos", icon: Calendar, href: "/auth/orders" },
  { id: "menu", label: "Cardápio", icon: ChefHat, href: "/auth/menu" },
  { id: "reports", label: "Relatórios", icon: BarChart3, href: "/auth/reports" },
  { id: "settings", label: "Configurações", icon: Settings, href: "/auth/services" },
];

export function AppShell({ children, currentPage, breadcrumb, user }: AppShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50/50">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 shadow-lg lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/android-chrome-512x512.png" className="w-full h-full object-cover" alt="Logo" />
             </div>
             <div className="text-xl font-bold tracking-tight text-gray-900">
                <span className="text-blue-600">izzi</span><span className="text-orange-500">Order</span>
             </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => (
            <NavItem
              key={item.id}
              {...item}
              isActive={pathname === item.href}
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}
        </nav>

        <UserProfileCard user={user} onLogoutClick={() => setIsLogoutModalOpen(true)} />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{currentPage}</h1>
              <p className="text-xs font-medium text-gray-400 flex items-center gap-1">
                Home <span className="text-gray-300">/</span> {breadcrumb}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50/30">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      <LogoutModal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} />
    </div>
  );
}