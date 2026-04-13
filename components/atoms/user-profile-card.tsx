"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";

interface UserProfileCardProps {
  user: { name: string; email: string };
  onLogoutClick: () => void;
}

export function UserProfileCard({ user, onLogoutClick }: UserProfileCardProps) {
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
    <div className="p-4 bg-gray-50/80 border-t border-gray-200">
      <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Avatar className="w-10 h-10 border-2 border-blue-50">
          <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
          <p className="text-[11px] font-medium text-gray-400 truncate lowercase tracking-tight">
            {user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          onClick={onLogoutClick}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}