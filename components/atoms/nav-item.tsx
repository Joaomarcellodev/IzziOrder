"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function NavItem({ label, href, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href} onClick={onClick}>
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
            isActive ? "text-white" : "text-gray-400 group-hover:text-blue-600"
          )}
        />
        <span className="font-semibold text-sm">{label}</span>
      </div>
    </Link>
  );
}