import { DragEndEvent } from '@dnd-kit/core';

import { NavigationFormData, NavigationItem, NavigationItem as NavigationItemType } from '@/types';
export function useNavigationManagerHelper(
  items: NavigationItemType[],
  editingItemId: string | null,
  addingChildToId: string | null,
  addItem: (item: NavigationItem, parentId?: string) => void,
  updateItem: (id: string, data: NavigationFormData) => void,
  reorderItems: (items: NavigationItemType[]) => void,
  setIsAddingItem: (isAddingItem: boolean) => void,
  setEditingItemId: (editingItemId: string | null) => void,
  setAddingChildToId: (addingChildToId: string | null) => void
) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const findItemAndParent = (items: NavigationItemType[], id: string): [NavigationItemType, NavigationItemType[], number] | null => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === id) {
            return [items[i], items, i];
          }
          if (items[i].children) {
            const found = findItemAndParent(items[i].children as NavigationItemType[], id);
            if (found) return found;
          }
        }
        return null;
      };

      const sourceResult = findItemAndParent(items, active.id as string);
      const targetResult = findItemAndParent(items, over.id as string);

      if (sourceResult && targetResult) {
        const [sourceItem, sourceParent, sourceIndex] = sourceResult;
        const [, targetParent, targetIndex] = targetResult;

        const newItems = JSON.parse(JSON.stringify(items));

        const sourceParentInNew = findItemAndParent(newItems, sourceParent[0]?.id)?.[1] || newItems;
        sourceParentInNew.splice(sourceIndex, 1);

        const targetParentInNew = findItemAndParent(newItems, targetParent[0]?.id)?.[1] || newItems;
        targetParentInNew.splice(targetIndex, 0, sourceItem);

        reorderItems(newItems);
      }
    }
  };

  const handleSubmit = (data: NavigationFormData) => {
    if (editingItemId) {
      updateItem(editingItemId, data);
      setEditingItemId(null);
    } else if (addingChildToId) {
      addItem(
        {
          id: new Date().getTime().toString(),
          ...data,
        },
        addingChildToId
      );
      setAddingChildToId(null);
    } else {
      addItem({
        id: new Date().getTime().toString(),
        ...data,
      });
      setIsAddingItem(false);
    }
  };

  const getAllItems = (items: NavigationItemType[]): string[] => {
    return items.reduce((acc: string[], item) => {
      acc.push(item.id);
      if (item.children?.length) {
        acc.push(...getAllItems(item.children));
      }
      return acc;
    }, []);
  };

  return {
    getAllItems,
    handleDragEnd,
    handleSubmit,
  };
}
