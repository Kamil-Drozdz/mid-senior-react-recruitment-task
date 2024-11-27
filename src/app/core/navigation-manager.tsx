"use client";
import React, { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CirclePlus } from "lucide-react";

import { Button } from "@/ui/button";
import { NavigationForm } from "@/components/navigation-form";
import { NavigationItem } from "@/components/navigation-form-item";
import { useNavigation } from "@/hooks/use-navigation";
import { useNavigationManagerHelper } from "@/hooks/use-navigation-manager-helper";
import useIsMobile from "@/hooks/use-is-mobile";
import { NavigationItem as NavigationItemType } from "@/types/navigation";

export default function NavigationManager() {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingChildToId, setAddingChildToId] = useState<string | null>(null);
  const { items, addItem, updateItem, removeItem, reorderItems } =
    useNavigation();
  const isMobile = useIsMobile();

  const { getAllItems, handleDragEnd, handleSubmit } =
    useNavigationManagerHelper(
      items,
      editingItemId,
      addingChildToId,
      addItem,
      updateItem,
      reorderItems,
      setIsAddingItem,
      setEditingItemId,
      setAddingChildToId
    );

  const handleAddItem = () => {
    setIsAddingItem(true);
  };
  const countItems = (items: NavigationItemType[]): number => {
    return items.reduce((count, item) => {
      return count + 1 + (item.children ? countItems(item.children) : 0);
    }, 0);
  };

  const countLinks = (items: NavigationItemType[]): number => {
    return items.reduce((count, item) => {
      const hasUrl = item.url ? 1 : 0;
      return count + hasUrl + (item.children ? countLinks(item.children) : 0);
    }, 0);
  };

  const totalItems = countItems(items);
  const totalLinks = countLinks(items);

  return (
    <div className="space-y-4 p-4">
      <div className="text-center flex flex-col items-center gap-2 p-4 bg-background-light card rounded-lg">
        <h1 className="text-2xl font-semibold">
          {items.length === 0 ? "Menu jest puste" : "Menu"}
        </h1>
        <p className="text-muted-foreground">
          {items.length === 0 ? (
            "W tym menu nie ma jeszcze żadnych linków."
          ) : totalLinks === 0 ? (
            "Dodaj linki do swojego menu, aby użytkownik mógł się nimi poruszać."
          ) : (
            <>
              <p>Ilość pozycji w menu: {totalItems}</p>
              <p>Ilość linków w menu: {totalLinks}</p>
            </>
          )}
        </p>
        {!isAddingItem && !editingItemId && !addingChildToId && (
          <div className="flex items-center gap-2 bg-special px-2.5 py-1 rounded-lg w-fit brightness-[1.25] hover:brightness-110 transition-colors">
            <CirclePlus className="h-6 w-6 text-white" />
            <Button
              aria-label="Dodaj pozycję menu"
              className="bg-inherit hover:bg-inherit font-semibold"
              onClick={handleAddItem}
            >
              Dodaj pozycję menu
            </Button>
          </div>
        )}
      </div>

      {isAddingItem && !addingChildToId && !editingItemId && (
        <NavigationForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsAddingItem(false);
            setEditingItemId(null);
            setAddingChildToId(null);
          }}
          initialData={undefined}
        />
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={getAllItems(items)}
          strategy={verticalListSortingStrategy}
        >
          {items.length > 0 && (
            <div className=" flex items-start flex-col rounded-lg border-[1px] border-dark-border bg-[#f9fafc] w-full">
              {items.map((item) => (
                <NavigationItem
                  key={item.id}
                  item={item}
                  isMobile={isMobile}
                  onEdit={setEditingItemId}
                  onDelete={removeItem}
                  onAddChild={setAddingChildToId}
                  firstItem={item.id === items[0].id}
                  isAddingItem={isAddingItem}
                  editingItemId={editingItemId}
                  addingChildToId={addingChildToId}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setIsAddingItem(false);
                    setEditingItemId(null);
                    setAddingChildToId(null);
                  }}
                />
              ))}

              <div className="w-full flex justify-start bg-background-darker p-5 rounded-b-lg">
                <Button
                  aria-label="Dodaj pozycję menu"
                  variant="outline"
                  size="sm"
                  className="font-semibold"
                  onClick={handleAddItem}
                >
                  Dodaj pozycję menu
                </Button>
              </div>
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}
