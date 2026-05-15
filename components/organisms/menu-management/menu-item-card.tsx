"use client";

import { useState, useRef, useEffect } from "react";
import { GripVertical, SquarePen, Trash, CameraOff, MoreVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/molecules/card";
import { Switch } from "@/components/atoms/switch";
import { cn } from "@/lib/utils";
import { MenuItemRequestDTO } from "@/app/actions/menu-item-actions";

interface MenuItemCardProps {
  item: MenuItemRequestDTO;
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number) => void;
  toggleAvailability: (itemId: string) => Promise<void>;
  openEditModal: (item: MenuItemRequestDTO) => void;
  openDeleteModal: (itemId: string) => void;
  onDrop: (dragIndex: number) => void;
}

interface DragItem {
  id: string;
  index: number;
}

interface DropCollectedProps {
  handlerId: string | symbol | null;
}

const ItemTypes = {
  CARD: "card",
};

export const MenuItemCard = ({
  item,
  index,
  moveItem,
  toggleAvailability,
  openEditModal,
  openDeleteModal,
  onDrop,
}: MenuItemCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const [isActionsOpen, setIsActionsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (isActionsOpen && window.innerWidth < 640) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          setIsActionsOpen(false);
        }
      }
    };

    if (isActionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsOpen]);

  const [{ handlerId }, drop] = useDrop<DragItem, void, DropCollectedProps>({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(draggedItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) return;

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveItem(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: item.id!, index: index };
    },
    end: (draggedItem, monitor) => {
      if (monitor.didDrop()) {
        onDrop(draggedItem.index);
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drop(ref);

  const dragRef = drag(useRef<HTMLDivElement>(null));

  const hasImage = item.imageUrl && item.imageUrl !== "/placeholder-img.svg";

  const toggleMobileActions = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (window.innerWidth < 640) {
      e.stopPropagation();
      setIsActionsOpen((prev) => !prev);
    }
  };

  return (
    <Card
      ref={ref}
      className={cn("hover:shadow-md transition-shadow relative overflow-hidden", {
        "opacity-50": isDragging,
      })}
      data-handler-id={handlerId}
      style={{ minHeight: isActionsOpen && window.innerWidth < 640 ? "100px" : "auto" }}
    >
      <CardContent className="p-3 sm:p-4 relative">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            ref={dragRef as any}
            className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0"
            data-handler-id={handlerId}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {hasImage ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center border border-gray-200">
              <CameraOff className="w-6 h-6 text-gray-400" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 break-words line-clamp-2">{item.name}</h3>
            <p className="text-xs text-gray-500 truncate mt-0.5 hidden md:block">
              {item.description}
            </p>
            <div className="text-base sm:text-lg font-semibold text-gray-900 mt-1">
              R$ {item.price.toFixed(2)}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div className="flex items-center flex-shrink-0">
              <Switch
                checked={item.available}
                onCheckedChange={() => toggleAvailability(item.id!)}
                className="data-[state=checked]:bg-blue-600 w-9 h-5"
              />
            </div>

            <div className="flex gap-1.5 sm:gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => openEditModal(item)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => openDeleteModal(item.id!)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Trash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
              </Button>
            </div>
          </div>

          <div className="sm:hidden flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileActions}
              className="h-8 w-8 text-gray-500"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </CardContent>

      <div
        ref={actionsRef}
        className={cn(
          "absolute right-0 top-0 h-full w-40 bg-gray-100/95 backdrop-blur-sm transition-transform duration-300 sm:hidden",
          "flex items-center justify-end gap-2 p-3",
          isActionsOpen ? "translate-x-0" : "translate-x-full"
        )}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Switch
          checked={item.available}
          onCheckedChange={() => toggleAvailability(item.id!)}
          className="data-[state=checked]:bg-blue-600 w-9 h-5"
        />

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            openEditModal(item);
            setIsActionsOpen(false);
          }}
          className="h-8 w-8"
        >
          <SquarePen className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            openDeleteModal(item.id!);
            setIsActionsOpen(false);
          }}
          className="h-8 w-8"
        >
          <Trash className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </Card>
  );
};
