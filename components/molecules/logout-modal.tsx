"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { logout } from "@/app/actions/auth-actions";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sair do Sistema</h2>
          <p className="text-gray-500 text-sm mb-8">
            Você precisará fazer login novamente para acessar seus pedidos e cardápio.
          </p>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              className="flex-1 h-12 rounded-xl font-semibold text-gray-600 hover:bg-gray-100"
              onClick={onClose}
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
  );
}