export interface NavigationItem {
  id: string;
  label: string;
  url?: string;
  children?: NavigationItem[];
}

export interface NavigationFormData {
  label: string;
  url?: string;
}

export interface NavigationItemProps {
  item: NavigationItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (id: string) => void;
  level?: number;
  isAddingItem: boolean;
  editingItemId: string | null;
  addingChildToId: string | null;
  firstItem?: boolean;
  onSubmit: (data: NavigationFormData) => void;
  onCancel: () => void;
  isMobile: boolean;
}

export interface NavigationFormProps {
  onSubmit: (data: NavigationFormData) => void;
  onCancel: () => void;
  initialData?: NavigationFormData;
  className?: string;
}
