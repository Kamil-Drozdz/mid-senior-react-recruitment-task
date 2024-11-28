'use client';

import { useSortable } from '@dnd-kit/sortable';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { CSS } from '@dnd-kit/utilities';
import { Move } from 'lucide-react';

import { Button } from '@/ui/button';
import { cn } from '../lib/utils';
import { NavigationForm } from './navigation-form';
import { NavigationItemProps } from '@/types';
import { Badge } from '@/ui/badge';

export function NavigationItem({
  item,
  isMobile,
  onEdit,
  onDelete,
  onAddChild,
  level = 0,
  isAddingItem,
  editingItemId,
  addingChildToId,
  firstItem,
  onSubmit,
  onCancel,
}: NavigationItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  useEffect(() => {
    if (level >= 5) {
      toast.error('Maksymalny poziom zagnieżdżenia to 5');
    }
  }, [level]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      data-testid={`data-test-level-${level}`}
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && 'opacity-50', level > 0 ? '' : 'w-full')}
    >
      <div
        className={`flex border-dark-border items-center p-2 md:p-5 bg-white border-[1px] ${level >= 2 && 'border-t-1 '} ${
          level >= 1 ? 'border-t-0 border-r-0' : firstItem ? ' border-t-0 border-r-0 border-l-0 rounded-t-lg ' : 'border-l-0 border-r-0'
        }`}
      >
        <button {...listeners} {...attributes} className="cursor-grab mr-3" aria-label="Przenieś element">
          <Move className="md:h-5 md:w-5 h-4 w-4 text-text-accent" />
        </button>
        <Button variant="ghost" size="sm" className="p-0" aria-label="Rozwiń/zwiń element" disabled={editingItemId === item.id}></Button>
        <div className="flex-1">
          <div className="font-semibold text-text-primary text-sm md:w-auto max-w-12 md:max-w-full truncate">
            {item.label}
            <Badge variant="outline" className="ml-2 text-special bg-violet-500 bg-opacity-10 border-special-border">
              kolekcja
            </Badge>
          </div>
          {item.url && <div className="text-sm font-normal text-text-accent md:w-auto max-w-12 md:max-w-full truncate">{item.url}</div>}
        </div>
        <div className="flex">
          <Button
            className="rounded-none border-r-0 rounded-l-lg font-semibold md:gap-2 gap-1 text-text-secondary"
            aria-label="Edytuj element"
            variant="outline"
            size={isMobile ? 'xs' : 'sm'}
            onClick={() => onEdit(item.id)}
          >
            Edytuj
          </Button>
          <Button
            className="rounded-none font-semibold text-text-secondary"
            variant="outline"
            aria-label="Usuń element"
            size={isMobile ? 'xs' : 'sm'}
            disabled={editingItemId === item.id}
            onClick={() => onDelete(item.id)}
          >
            Usuń
          </Button>
          <Button
            aria-label="Dodaj pozycję menu"
            className="rounded-none border-l-0 rounded-r-lg font-semibold text-text-secondary"
            variant="outline"
            size={isMobile ? 'xs' : 'sm'}
            disabled={editingItemId === item.id || level >= 5}
            onClick={() => onAddChild(item.id)}
          >
            Dodaj pozycję menu
          </Button>
        </div>
      </div>

      {/* Formularz edycji dla bieżącego elementu */}
      {editingItemId === item.id && (
        <div className="mt-2 md:ml-8 ml-2 flex justify-center">
          <NavigationForm className="w-11/12 my-4" onSubmit={onSubmit} onCancel={onCancel} initialData={item} />
        </div>
      )}

      {/* Formularz dodawania dziecka */}
      {addingChildToId === item.id && (
        <div className="mt-2 md:ml-8 ml-2 flex justify-center">
          <NavigationForm className="w-11/12 my-4" onSubmit={onSubmit} onCancel={onCancel} initialData={undefined} />
        </div>
      )}

      {/* Zagnieżdżone elementy */}
      {item.children && item.children.length > 0 && (
        <div className="md:ml-8 ml-2">
          {item.children.map((child) => (
            <React.Fragment key={child.id}>
              <NavigationItem
                item={child}
                onEdit={onEdit}
                isMobile={isMobile}
                onDelete={onDelete}
                onAddChild={onAddChild}
                level={level + 1}
                isAddingItem={isAddingItem}
                editingItemId={editingItemId}
                addingChildToId={addingChildToId}
                onSubmit={onSubmit}
                onCancel={onCancel}
              />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
