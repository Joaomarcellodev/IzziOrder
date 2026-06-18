"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * Esse wrapper (Client Component) envolve o MenuManagement garantindo que
 * ele seja renderizado exclusivamente no lado do cliente. Isso evita o
 * Hydration Mismatch causado pelo DndProvider e pelas Tabs do Radix,
 * além de manter o carregamento inicial da página rápido.
 */
const MenuManagementClient = dynamic(
  () => import("./menu-management").then((mod) => mod.MenuManagement),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
      </div>
    )
  }
);

export default MenuManagementClient;
